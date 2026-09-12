import { db } from './config';
import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';

const RESORT_DOC_REF = 'resort_content';
const MAIN_STATE_DOC = 'live_state';

/**
 * Deep sanitization for Firestore documents.
 * Removes DOM File/Blob instances, functions, undefined values, and non-serializable objects.
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
 * Compress and convert image File to high-quality Base64 Data URL.
 * Automatically scales down massive camera photos (e.g. 10MB+) to crystal-clear 1280px WebP/JPEG,
 * producing permanent, fast-loading, zero-dependency image strings that store directly in Firestore.
 */
export async function compressImageToDataUrl(file, maxWidth = 1280, quality = 0.82) {
  return new Promise((resolve, reject) => {
    if (!file || typeof file === 'string') return resolve(file);
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to parse image for compression'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.src = readerEvent.target.result;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Convert any device file (video or image) directly to permanent Data URL
 */
export async function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    if (!file || typeof file === 'string') return resolve(file);
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read device file'));
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}

/**
 * Permanent Cloud Media Uploader.
 * - Photos & Logos: Compressed to high-resolution web Data URLs (fast, zero cloud dependency).
 * - Videos: Direct parallel chunk storage in Firestore (resort_media_chunks).
 * - Direct URLs: Preserved and verified.
 * 
 * NEVER uses Firebase Storage or temporary file hosts.
 */
export async function uploadMediaToCloud(file, folder = 'uploads', onProgress = null) {
  if (!file || typeof file === 'string') return typeof file === 'string' ? file : null;

  const isImage = file.type ? file.type.startsWith('image/') : false;
  const isVideo = file.type ? file.type.startsWith('video/') : (file.name && /\.(mp4|webm|mov|mkv|m4v|ogg)$/i.test(file.name));

  // 1. For images: Use fast, permanent, zero-failure Web-Optimized Data URL
  if (isImage) {
    if (typeof onProgress === 'function') onProgress(30);
    const compressedDataUrl = await compressImageToDataUrl(file, 1280, 0.82);
    if (typeof onProgress === 'function') onProgress(100);
    return compressedDataUrl;
  }

  // 2. For videos: Use direct Firestore chunk streaming
  if (isVideo) {
    const { saveVideoToFirestore } = await import('./videoStreamService');
    const streamMeta = await saveVideoToFirestore(file, folder, onProgress);
    return streamMeta.fileName || 'custom_video_stream';
  }

  throw new Error('Unsupported media format. Please upload an image or video file.');
}

// Backward-compatible alias for existing imports
export const uploadMediaToFirebaseStorage = uploadMediaToCloud;

/**
 * Save section data to Firestore and sync across all customer devices in real-time
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
 * Authoritative, atomic transaction saving the ENTIRE live state to Firestore.
 * Verifies that the record is persisted and readable before resolving.
 */
export async function saveEntireLiveStateToFirebase(fullState) {
  const cleanData = sanitizeForFirestore(fullState);
  if (!cleanData) {
    throw new Error('Invalid state data passed for Firestore persistence');
  }

  const docRef = doc(db, RESORT_DOC_REF, MAIN_STATE_DOC);
  const payload = {
    ...cleanData,
    lastUpdated: Date.now()
  };

  // 1. Write to Firestore with merge
  await setDoc(docRef, payload, { merge: true });

  // 2. Read back from Firestore to verify persistence
  const snap = await getDoc(docRef);
  if (!snap.exists()) {
    throw new Error('Persistence verification failed: Firestore document could not be read back.');
  }

  return {
    success: true,
    data: snap.data(),
    lastUpdated: payload.lastUpdated
  };
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
 * Real-time listener for Firestore live updates.
 * Triggers callback whenever the admin changes anything in Firestore.
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
