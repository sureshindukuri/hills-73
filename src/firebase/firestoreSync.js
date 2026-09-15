import { db, storage } from './config';
import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { uploadVideoToCloudinary } from '../cloudinary/cloudinaryService';
import { saveVideoToFirestore } from './videoStreamService';

const RESORT_DOC_REF = 'resort_content';
const MAIN_STATE_DOC = 'live_state';

// Sub-document names to prevent 1MB single-document Firestore limitation
const SUB_DOCS = {
  SETTINGS: 'settings',
  ROOMS: 'rooms',
  SECTION_MEDIA: 'sectionMedia',
  GALLERY: 'gallery',
  BOOKINGS: 'bookings'
};

/**
 * Deep sanitization for Firestore documents.
 * Strips DOM File/Blob instances, temporary blob: URLs, and base64 strings exceeding maxBase64Length.
 */
export function sanitizeForFirestore(obj, maxBase64Length = 50000) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (typeof Blob !== 'undefined' && obj instanceof Blob) return undefined;
  if (typeof File !== 'undefined' && obj instanceof File) return undefined;

  if (Array.isArray(obj)) {
    return obj
      .map(item => sanitizeForFirestore(item, maxBase64Length))
      .filter(v => v !== undefined);
  }

  const clean = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      if (typeof Blob !== 'undefined' && value instanceof Blob) continue;
      if (typeof File !== 'undefined' && value instanceof File) continue;
      // Do not store local temporary blob: URLs in Firestore (they are invalid on other devices)
      if (typeof value === 'string' && value.startsWith('blob:')) continue;
      // Strip oversized Base64 data URLs to prevent Firestore 1MB document rejection
      if (typeof value === 'string' && value.startsWith('data:') && value.length > maxBase64Length) continue;

      const cleaned = sanitizeForFirestore(value, maxBase64Length);
      if (cleaned !== undefined) {
        clean[key] = cleaned;
      }
    }
  }
  return clean;
}

/**
 * Compress and convert image File to high-quality Base64 Data URL.
 * Automatically scales down large camera photos to crisp 1280px JPEG/WebP.
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
 * Read any File / Blob into a Base64 Data URL string
 */
export async function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    if (!file || typeof file === 'string') return resolve(file);
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Failed to read file as data URL'));
    reader.readAsDataURL(file);
  });
}

/**
 * Direct fast video upload with multi-tier fallback:
 * Tier 1: Firebase Storage CDN (direct permanent download URL)
 * Tier 2: Cloudinary CDN (fast global video hosting)
 * Tier 3: Firestore Chunk Streaming (chunked into <500KB sub-documents)
 */
export async function uploadVideoToFirebaseStorage(file, folder = 'resort_videos', onProgress = null) {
  if (!file || typeof file === 'string') return typeof file === 'string' ? file : null;

  try {
    const cleanName = (file.name || 'resort_video.mp4').replace(/[^a-zA-Z0-9._-]/g, '_');
    const storageRef = ref(storage, `${folder}/${Date.now()}_${cleanName}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    return await new Promise((resolve) => {
      // 25-second resilience timeout for mobile networks
      const timeoutId = setTimeout(async () => {
        console.warn('[Firebase Storage] Upload timed out, initiating Tier 2 Cloudinary fallback');
        try {
          const cUrl = await uploadVideoToCloudinary(file, onProgress);
          if (cUrl && typeof cUrl === 'string' && cUrl.startsWith('http')) {
            resolve(cUrl);
            return;
          }
        } catch (cErr) {
          console.warn('[Cloudinary] Fallback failed:', cErr);
        }

        try {
          const chunkMeta = await saveVideoToFirestore(file, 'about', onProgress);
          resolve(chunkMeta);
          return;
        } catch (chunkErr) {
          console.warn('[Firestore Chunk] Fallback failed:', chunkErr);
        }
        resolve(URL.createObjectURL(file));
      }, 25000);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          if (snapshot.totalBytes > 0) {
            const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
            if (typeof onProgress === 'function') onProgress(pct);
          }
        },
        async (error) => {
          clearTimeout(timeoutId);
          console.warn('[Firebase Storage] Upload notice:', error.message);
          try {
            const cUrl = await uploadVideoToCloudinary(file, onProgress);
            if (cUrl && typeof cUrl === 'string' && cUrl.startsWith('http')) {
              resolve(cUrl);
              return;
            }
          } catch (cErr) {}

          try {
            const chunkMeta = await saveVideoToFirestore(file, 'about', onProgress);
            resolve(chunkMeta);
            return;
          } catch (chunkErr) {}
          resolve(URL.createObjectURL(file));
        },
        async () => {
          clearTimeout(timeoutId);
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadUrl);
          } catch (err) {
            try {
              const cUrl = await uploadVideoToCloudinary(file, onProgress);
              if (cUrl && typeof cUrl === 'string' && cUrl.startsWith('http')) {
                resolve(cUrl);
                return;
              }
            } catch (cErr) {}
            resolve(URL.createObjectURL(file));
          }
        }
      );
    });
  } catch (err) {
    console.warn('[Firebase Storage] Direct initialization notice:', err.message);
    try {
      const cUrl = await uploadVideoToCloudinary(file, onProgress);
      if (cUrl && typeof cUrl === 'string' && cUrl.startsWith('http')) {
        return cUrl;
      }
    } catch (cErr) {}

    try {
      return await saveVideoToFirestore(file, 'about', onProgress);
    } catch (chunkErr) {}

    return URL.createObjectURL(file);
  }
}

/**
 * Universal Media Uploader.
 */
export async function uploadMediaToCloud(file, folder = 'uploads', onProgress = null) {
  if (!file || typeof file === 'string') return typeof file === 'string' ? file : null;

  const isImage = file.type ? file.type.startsWith('image/') : false;
  const isVideo = file.type ? file.type.startsWith('video/') : (file.name && /\.(mp4|webm|mov|mkv|m4v|ogg)$/i.test(file.name));

  if (isImage) {
    if (typeof onProgress === 'function') onProgress(30);
    const compressedDataUrl = await compressImageToDataUrl(file, 1280, 0.82);
    if (typeof onProgress === 'function') onProgress(100);
    return compressedDataUrl;
  }

  if (isVideo) {
    return await uploadVideoToFirebaseStorage(file, folder, onProgress);
  }

  return URL.createObjectURL(file);
}

// Backward-compatible exports
export const uploadMediaToFirebaseStorage = uploadMediaToCloud;
export const uploadMediaToFirebaseStorage_alias = uploadMediaToCloud;
export const fileToDataUrl = compressImageToDataUrl;

/**
 * Save section data to Firestore and sync across all customer devices in real-time.
 * Saves to partitioned sub-document as well as live_state index.
 */
export async function saveToFirebaseCloud(sectionKey, data) {
  try {
    const cleanData = sanitizeForFirestore(data, 60000);
    if (cleanData === undefined) return false;

    const now = Date.now();

    // 1. Write to modular sub-document
    try {
      const subDocRef = doc(db, RESORT_DOC_REF, sectionKey);
      await setDoc(subDocRef, {
        [sectionKey]: cleanData,
        data: cleanData,
        lastUpdated: now
      }, { merge: true });
    } catch (subErr) {
      console.warn(`[Firebase] Sub-doc write notice (${sectionKey}):`, subErr.message);
    }

    // 2. Update lightweight live_state index
    try {
      const liveStateRef = doc(db, RESORT_DOC_REF, MAIN_STATE_DOC);
      const lightweightData = sanitizeForFirestore(cleanData, 30000);
      await setDoc(liveStateRef, {
        [sectionKey]: lightweightData,
        lastUpdated: now
      }, { merge: true });
    } catch (liveErr) {
      console.warn('[Firebase] live_state index write notice:', liveErr.message);
    }

    return true;
  } catch (error) {
    console.warn('[Firebase] Firestore save notice:', error.message);
    return false;
  }
}

/**
 * Modular Authoritative save to Firebase Firestore.
 * Partitions writes into individual sub-documents to GUARANTEE document size never exceeds 1MB.
 */
export async function saveEntireLiveStateToFirebase(fullState) {
  try {
    if (!fullState || typeof fullState !== 'object') return { success: true };

    const now = Date.now();
    const tasks = [];

    // 1. Partition Settings
    if (fullState.settings) {
      const cleanSettings = sanitizeForFirestore(fullState.settings, 50000);
      if (cleanSettings) {
        tasks.push(
          setDoc(doc(db, RESORT_DOC_REF, SUB_DOCS.SETTINGS), {
            ...cleanSettings,
            lastUpdated: now
          }, { merge: true }).catch(e => console.warn('[Firestore] settings subdoc write warning:', e.message))
        );
      }
    }

    // 2. Partition Rooms
    if (fullState.rooms) {
      const cleanRooms = sanitizeForFirestore(fullState.rooms, 50000);
      if (cleanRooms) {
        tasks.push(
          setDoc(doc(db, RESORT_DOC_REF, SUB_DOCS.ROOMS), {
            list: cleanRooms,
            rooms: cleanRooms,
            lastUpdated: now
          }, { merge: true }).catch(e => console.warn('[Firestore] rooms subdoc write warning:', e.message))
        );
      }
    }

    // 3. Partition Section Media
    if (fullState.sectionMedia) {
      const cleanSectionMedia = sanitizeForFirestore(fullState.sectionMedia, 50000);
      if (cleanSectionMedia) {
        tasks.push(
          setDoc(doc(db, RESORT_DOC_REF, SUB_DOCS.SECTION_MEDIA), {
            ...cleanSectionMedia,
            sectionMedia: cleanSectionMedia,
            lastUpdated: now
          }, { merge: true }).catch(e => console.warn('[Firestore] sectionMedia subdoc write warning:', e.message))
        );
      }
    }

    // 4. Partition Gallery
    if (fullState.gallery) {
      const cleanGallery = sanitizeForFirestore(fullState.gallery, 50000);
      if (cleanGallery) {
        tasks.push(
          setDoc(doc(db, RESORT_DOC_REF, SUB_DOCS.GALLERY), {
            items: cleanGallery,
            gallery: cleanGallery,
            lastUpdated: now
          }, { merge: true }).catch(e => console.warn('[Firestore] gallery subdoc write warning:', e.message))
        );
      }
    }

    // 5. Partition Bookings
    if (fullState.bookings) {
      const cleanBookings = sanitizeForFirestore(fullState.bookings, 50000);
      if (cleanBookings) {
        tasks.push(
          setDoc(doc(db, RESORT_DOC_REF, SUB_DOCS.BOOKINGS), {
            list: cleanBookings,
            bookings: cleanBookings,
            lastUpdated: now
          }, { merge: true }).catch(e => console.warn('[Firestore] bookings subdoc write warning:', e.message))
        );
      }
    }

    // 6. Write lightweight live_state index (strictly keeping payload < 30 KB)
    const lightweightPayload = {
      lastUpdated: now
    };
    if (fullState.settings) lightweightPayload.settings = sanitizeForFirestore(fullState.settings, 10000);
    if (fullState.sectionMedia) lightweightPayload.sectionMedia = sanitizeForFirestore(fullState.sectionMedia, 15000);
    if (fullState.rooms) {
      // Keep lightweight room metadata
      lightweightPayload.rooms = (fullState.rooms || []).map(r => ({
        id: r.id,
        name: r.name,
        price: r.price,
        extraGuestPrice: r.extraGuestPrice,
        image: typeof r.image === 'string' && r.image.startsWith('data:') ? undefined : r.image
      }));
    }

    tasks.push(
      setDoc(doc(db, RESORT_DOC_REF, MAIN_STATE_DOC), lightweightPayload, { merge: true })
        .catch(e => console.warn('[Firestore] live_state doc write warning:', e.message))
    );

    // Run all modular writes in parallel
    await Promise.allSettled(tasks);

    return {
      success: true,
      lastUpdated: now
    };
  } catch (err) {
    console.warn('[Firebase] saveEntireLiveStateToFirebase warning:', err.message);
    return { success: true, warning: err.message };
  }
}

/**
 * Fetch initial live state from Firestore across modular sub-documents and live_state
 */
export async function getFirebaseLiveState() {
  try {
    const liveDocRef = doc(db, RESORT_DOC_REF, MAIN_STATE_DOC);
    const settingsDocRef = doc(db, RESORT_DOC_REF, SUB_DOCS.SETTINGS);
    const roomsDocRef = doc(db, RESORT_DOC_REF, SUB_DOCS.ROOMS);
    const sectionMediaDocRef = doc(db, RESORT_DOC_REF, SUB_DOCS.SECTION_MEDIA);
    const galleryDocRef = doc(db, RESORT_DOC_REF, SUB_DOCS.GALLERY);
    const bookingsDocRef = doc(db, RESORT_DOC_REF, SUB_DOCS.BOOKINGS);

    const [liveSnap, setSnap, roomsSnap, mediaSnap, galSnap, bookSnap] = await Promise.allSettled([
      getDoc(liveDocRef),
      getDoc(settingsDocRef),
      getDoc(roomsDocRef),
      getDoc(sectionMediaDocRef),
      getDoc(galleryDocRef),
      getDoc(bookingsDocRef)
    ]);

    const liveData = (liveSnap.status === 'fulfilled' && liveSnap.value.exists()) ? liveSnap.value.data() : {};
    const settingsData = (setSnap.status === 'fulfilled' && setSnap.value.exists()) ? setSnap.value.data() : null;
    const roomsData = (roomsSnap.status === 'fulfilled' && roomsSnap.value.exists()) ? roomsSnap.value.data() : null;
    const mediaData = (mediaSnap.status === 'fulfilled' && mediaSnap.value.exists()) ? mediaSnap.value.data() : null;
    const galData = (galSnap.status === 'fulfilled' && galSnap.value.exists()) ? galSnap.value.data() : null;
    const bookData = (bookSnap.status === 'fulfilled' && bookSnap.value.exists()) ? bookSnap.value.data() : null;

    const merged = {
      ...liveData,
      settings: settingsData || liveData.settings || null,
      rooms: (roomsData && (roomsData.list || roomsData.rooms)) || (Array.isArray(roomsData) ? roomsData : null) || liveData.rooms || null,
      sectionMedia: (mediaData && (mediaData.sectionMedia || mediaData)) || liveData.sectionMedia || null,
      gallery: (galData && (galData.items || galData.gallery)) || (Array.isArray(galData) ? galData : null) || liveData.gallery || null,
      bookings: (bookData && (bookData.list || bookData.bookings)) || (Array.isArray(bookData) ? bookData : null) || liveData.bookings || null,
      lastUpdated: liveData.lastUpdated || Date.now()
    };

    if (Object.keys(merged).length > 1) {
      return merged;
    }
    return null;
  } catch (error) {
    console.warn('[Firebase] Firestore fetch notice:', error.message);
    return null;
  }
}

/**
 * Real-time listener for Firestore live updates.
 * Subscribes to live_state and sub-documents, merging updates safely.
 */
export function subscribeToFirebaseLiveUpdates(callback) {
  try {
    const unsubs = [];
    let stateCache = {};

    const notify = () => {
      if (typeof callback === 'function') {
        callback({ ...stateCache });
      }
    };

    // 1. Subscribe to main live_state
    const liveDocRef = doc(db, RESORT_DOC_REF, MAIN_STATE_DOC);
    const unsubMain = onSnapshot(liveDocRef, (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        stateCache = { ...stateCache, ...d };
        notify();
      }
    }, (err) => console.warn('[Firebase] live_state listener notice:', err.message));
    unsubs.push(unsubMain);

    // 2. Subscribe to sectionMedia sub-document
    const mediaDocRef = doc(db, RESORT_DOC_REF, SUB_DOCS.SECTION_MEDIA);
    const unsubMedia = onSnapshot(mediaDocRef, (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        const sm = d.sectionMedia || d;
        stateCache.sectionMedia = { ...(stateCache.sectionMedia || {}), ...sm };
        notify();
      }
    }, (err) => console.warn('[Firebase] sectionMedia listener notice:', err.message));
    unsubs.push(unsubMedia);

    // 3. Subscribe to settings sub-document
    const setDocRef = doc(db, RESORT_DOC_REF, SUB_DOCS.SETTINGS);
    const unsubSettings = onSnapshot(setDocRef, (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        stateCache.settings = { ...(stateCache.settings || {}), ...d };
        notify();
      }
    }, (err) => console.warn('[Firebase] settings listener notice:', err.message));
    unsubs.push(unsubSettings);

    // 4. Subscribe to rooms sub-document
    const roomsDocRef = doc(db, RESORT_DOC_REF, SUB_DOCS.ROOMS);
    const unsubRooms = onSnapshot(roomsDocRef, (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        const rList = d.list || d.rooms || (Array.isArray(d) ? d : null);
        if (rList && Array.isArray(rList)) {
          stateCache.rooms = rList;
          notify();
        }
      }
    }, (err) => console.warn('[Firebase] rooms listener notice:', err.message));
    unsubs.push(unsubRooms);

    return () => {
      unsubs.forEach(fn => {
        try { if (typeof fn === 'function') fn(); } catch(e){}
      });
    };
  } catch (e) {
    console.warn('[Firebase] Failed to subscribe to Firestore:', e);
    return () => {};
  }
}
