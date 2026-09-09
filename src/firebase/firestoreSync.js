import { db, storage } from './config';
import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

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
 * Upload a media file (video or image) to Firebase Storage with non-blocking fast resolution
 */
export async function uploadMediaToFirebaseStorage(file, folder = 'uploads', timeoutMs = 4000) {
  if (!file || typeof file === 'string') return typeof file === 'string' ? file : null;
  try {
    const cleanName = (file.name || 'media').replace(/[^a-zA-Z0-9._-]/g, '_');
    const storageRef = ref(storage, `${folder}/${Date.now()}_${cleanName}`);
    
    // Fast upload with timeout so UI never hangs
    const uploadTask = uploadBytes(storageRef, file).then(snap => getDownloadURL(snap.ref));
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Storage timeout - instant local/cloud mode active')), timeoutMs)
    );

    const downloadUrl = await Promise.race([uploadTask, timeoutPromise]);
    return downloadUrl;
  } catch (err) {
    console.warn('[Firebase Storage] Fast fallback engaged:', err.message);
    return null;
  }
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
    console.warn('[Firebase] Firestore save notice (local state remains active):', error.message);
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
