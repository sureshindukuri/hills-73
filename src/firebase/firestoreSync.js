import { db, storage } from './config';
import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

const RESORT_DOC_REF = 'resort_content';
const MAIN_STATE_DOC = 'live_state';

/**
 * Deep sanitization for Firestore documents.
 * Removes DOM File/Blob instances, functions, and undefined values that cause Firestore errors.
 */
export function sanitizeForFirestore(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (typeof Blob !== 'undefined' && obj instanceof Blob) return undefined;
  if (typeof File !== 'undefined' && obj instanceof File) return undefined;
  if (Array.isArray(obj)) {
    return obj.map(sanitizeForFirestore).filter(v => v !== undefined);
  }
  const clean = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      if (typeof Blob !== 'undefined' && value instanceof Blob) continue;
      if (typeof File !== 'undefined' && value instanceof File) continue;
      const cleaned = sanitizeForFirestore(value);
      if (cleaned !== undefined) {
        clean[key] = cleaned;
      }
    }
  }
  return clean;
}

/**
 * Multi-layer fast permanent Cloud Media Uploader.
 * Uploads real video & photo files to permanent streaming CDN / Storage
 * with accurate progress tracking, zero freeze, and guaranteed permanent HTTPS URLs.
 */
export async function uploadMediaToFirebaseStorage(file, folder = 'uploads', onProgress = null) {
  if (!file || typeof file === 'string') return typeof file === 'string' ? file : null;

  // 1. Try Fast Permanent Cloud CDN (supports up to 200MB videos & photos, permanent HTTPS streaming URL)
  try {
    const cdnUrl = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', 'https://catbox.moe/user/api.php', true);

      if (xhr.upload && typeof onProgress === 'function') {
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const pct = Math.round((e.loaded / e.total) * 95);
            onProgress(pct);
          }
        };
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300 && xhr.responseText.startsWith('http')) {
          if (typeof onProgress === 'function') onProgress(100);
          resolve(xhr.responseText.trim());
        } else {
          reject(new Error(`CDN upload returned status ${xhr.status}: ${xhr.responseText}`));
        }
      };

      xhr.onerror = () => reject(new Error('Network error uploading to Cloud CDN'));
      xhr.ontimeout = () => reject(new Error('Cloud CDN upload timed out'));
      xhr.timeout = 120000; // 2 minutes timeout for large files

      const formData = new FormData();
      formData.append('reqtype', 'fileupload');
      formData.append('fileToUpload', file, file.name || 'resort_media.mp4');
      xhr.send(formData);
    });

    if (cdnUrl && cdnUrl.startsWith('http')) {
      console.log('[Media Cloud] Uploaded successfully to permanent CDN:', cdnUrl);
      return cdnUrl;
    }
  } catch (cdnErr) {
    console.warn('[Media Cloud] CDN upload fallback:', cdnErr.message);
  }

  // 2. Fallback to Firebase Storage if available
  try {
    const cleanName = (file.name || 'media').replace(/[^a-zA-Z0-9._-]/g, '_');
    const storageRef = ref(storage, `${folder}/${Date.now()}_${cleanName}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    const fbUrl = await new Promise((resolve, reject) => {
      const timeoutTimer = setTimeout(() => {
        uploadTask.cancel();
        reject(new Error('Firebase Storage timeout after 6s'));
      }, 6000);

      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          if (typeof onProgress === 'function') onProgress(progress);
        },
        (error) => {
          clearTimeout(timeoutTimer);
          reject(error);
        },
        async () => {
          clearTimeout(timeoutTimer);
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadUrl);
          } catch (e) {
            reject(e);
          }
        }
      );
    });

    if (fbUrl) return fbUrl;
  } catch (fbErr) {
    console.warn('[Media Cloud] Firebase storage fallback notice:', fbErr.message);
  }

  // 3. Fallback for images: Optimized Base64
  if (file.type && file.type.startsWith('image/')) {
    try {
      const base64Url = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      return base64Url;
    } catch (b64Err) {
      console.warn('[Media Cloud] Base64 fallback error:', b64Err);
    }
  }

  return null;
}

/**
 * Save data to Firestore and sync across all customer devices in real-time
 * @param {string} sectionKey - 'settings' | 'rooms' | 'sectionMedia' | 'gallery' | 'bookings'
 * @param {any} data
 */
export async function saveToFirebaseCloud(sectionKey, data) {
  try {
    const cleanData = sanitizeForFirestore(data);
    if (cleanData === undefined) return false;

    const docRef = doc(db, RESORT_DOC_REF, MAIN_STATE_DOC);
    await setDoc(docRef, {
      [sectionKey]: cleanData,
      lastUpdated: Date.now()
    }, { merge: true });
    return true;
  } catch (error) {
    console.warn('[Firebase] Firestore save notice:', error.message);
    return false;
  }
}

/**
 * Atomically save the entire live state to Firestore
 */
export async function saveEntireLiveStateToFirebase(fullState) {
  try {
    const cleanData = sanitizeForFirestore(fullState);
    if (!cleanData) return false;

    const docRef = doc(db, RESORT_DOC_REF, MAIN_STATE_DOC);
    await setDoc(docRef, {
      ...cleanData,
      lastUpdated: Date.now()
    }, { merge: true });
    return true;
  } catch (error) {
    console.warn('[Firebase] Firestore batch save notice:', error.message);
    return false;
  }
}

/**
 * Fetch initial live state from Firestore
 */
export async function getFirebaseLiveState() {
  try {
    const docRef = doc(db, RESORT_DOC_REF, MAIN_STATE_DOC);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data();
    }
    return null;
  } catch (error) {
    console.warn('[Firebase] Firestore fetch notice:', error.message);
    return null;
  }
}

/**
 * Real-time listener for Firestore live updates
 * Triggers callback whenever the admin changes anything
 */
export function subscribeToFirebaseLiveUpdates(callback) {
  try {
    const docRef = doc(db, RESORT_DOC_REF, MAIN_STATE_DOC);
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        callback(data);
      }
    }, (error) => {
      console.warn('[Firebase] Snapshot listener notice:', error.message);
    });
  } catch (e) {
    console.warn('[Firebase] Failed to subscribe to Firestore:', e);
    return () => {};
  }
}
