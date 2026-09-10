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
 * Upload a media file (video or image) to Firebase Storage permanently
 * Supports real-time upload progress and returns a permanent public HTTPS download URL.
 */
export async function uploadMediaToFirebaseStorage(file, folder = 'uploads', onProgress = null) {
  if (!file || typeof file === 'string') return typeof file === 'string' ? file : null;
  
  return new Promise((resolve, reject) => {
    try {
      const cleanName = (file.name || 'media').replace(/[^a-zA-Z0-9._-]/g, '_');
      const storageRef = ref(storage, `${folder}/${Date.now()}_${cleanName}`);
      
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on('state_changed', 
        (snapshot) => {
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          if (typeof onProgress === 'function') {
            onProgress(progress);
          }
        }, 
        (error) => {
          console.error('[Firebase Storage] Upload failed:', error);
          reject(error);
        }, 
        async () => {
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            console.log('[Firebase Storage] Upload completed successfully:', downloadUrl);
            resolve(downloadUrl);
          } catch (urlErr) {
            console.error('[Firebase Storage] getDownloadURL error:', urlErr);
            reject(urlErr);
          }
        }
      );
    } catch (err) {
      console.error('[Firebase Storage] Initialization error:', err);
      reject(err);
    }
  });
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
