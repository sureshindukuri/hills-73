import { db } from './config';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const CHUNKS_COLLECTION = 'resort_media_chunks';
const CHUNK_SIZE_BYTES = 500 * 1024; // 500 KB binary chunk (becomes ~667 KB Base64, safely below 1 MB Firestore limit)

// In-memory object URL cache to prevent repeated downloads
const memoryBlobCache = new Map();

const IDB_NAME = '73HillsStreamCacheDB';
const IDB_STORE = 'video_blobs';

function openStreamIDB() {
  return new Promise((resolve) => {
    if (typeof indexedDB === 'undefined') return resolve(null);
    try {
      const req = indexedDB.open(IDB_NAME, 1);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(IDB_STORE)) {
          db.createObjectStore(IDB_STORE, { keyPath: 'key' });
        }
      };
      req.onsuccess = (e) => resolve(e.target.result);
      req.onerror = () => resolve(null);
    } catch (e) {
      resolve(null);
    }
  });
}

async function getCachedStreamBlob(key) {
  try {
    const db = await openStreamIDB();
    if (!db) return null;
    return new Promise((resolve) => {
      const tx = db.transaction(IDB_STORE, 'readonly');
      const store = tx.objectStore(IDB_STORE);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result ? req.result.blob : null);
      req.onerror = () => resolve(null);
    });
  } catch (e) {
    return null;
  }
}

async function setCachedStreamBlob(key, blob) {
  try {
    const db = await openStreamIDB();
    if (!db) return;
    const tx = db.transaction(IDB_STORE, 'readwrite');
    const store = tx.objectStore(IDB_STORE);
    store.put({ key, blob, updatedAt: Date.now() });
  } catch (e) {}
}

/**
 * Convert ArrayBuffer to Base64 string safely
 */
function bufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Convert Base64 string back to Uint8Array
 */
function base64ToUint8Array(base64) {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Save a video file directly into Firestore in parallel chunks.
 * Zero external dependencies, zero Cloudinary setup, zero Firebase Storage billing.
 * 
 * @param {File|Blob} file - Browser File/Blob object
 * @param {string} mediaKey - 'about' | 'hero' | 'gallery'
 * @param {Function} onProgress - Optional callback (0-100)
 * @returns {Promise<object>} Metadata record to store in live_state
 */
export async function saveVideoToFirestore(file, mediaKey = 'about', onProgress = null) {
  if (!file) throw new Error('No video file selected.');

  const totalSize = file.size;
  const totalChunks = Math.ceil(totalSize / CHUNK_SIZE_BYTES);
  const mimeType = file.type || 'video/mp4';
  const timestamp = Date.now();

  if (typeof onProgress === 'function') onProgress(10);

  // Read entire file ArrayBuffer once for blazing fast in-memory slicing
  const fullBuffer = await file.arrayBuffer();

  const chunkTasks = [];
  for (let i = 0; i < totalChunks; i++) {
    const start = i * CHUNK_SIZE_BYTES;
    const end = Math.min(start + CHUNK_SIZE_BYTES, totalSize);
    const sliceBuffer = fullBuffer.slice(start, end);
    const base64Data = bufferToBase64(sliceBuffer);

    const task = async () => {
      const chunkDocRef = doc(db, CHUNKS_COLLECTION, `${mediaKey}_chunk_${i}`);
      await setDoc(chunkDocRef, {
        mediaKey,
        index: i,
        total: totalChunks,
        data: base64Data,
        mimeType,
        updatedAt: timestamp
      });
      if (typeof onProgress === 'function') {
        const pct = Math.min(95, Math.round(15 + ((i + 1) / totalChunks) * 80));
        onProgress(pct);
      }
    };
    chunkTasks.push(task);
  }

  // Upload in parallel batches of 10
  const BATCH_SIZE = 10;
  for (let i = 0; i < chunkTasks.length; i += BATCH_SIZE) {
    const batch = chunkTasks.slice(i, i + BATCH_SIZE).map(fn => fn());
    await Promise.all(batch);
  }

  if (typeof onProgress === 'function') onProgress(100);

  const metaRecord = {
    sectionKey: mediaKey,
    mediaType: 'video',
    videoType: 'firestore_stream',
    mediaKey: mediaKey,
    totalChunks,
    totalSize,
    mimeType,
    fileName: file.name || `${mediaKey}_resort_tour.mp4`,
    title: '73 Acres Sandalwood Sanctuary Tour',
    updatedAt: new Date(timestamp).toISOString(),
    isDefault: false
  };

  // Cache locally in memory and IndexedDB
  const blobUrl = URL.createObjectURL(file);
  memoryBlobCache.set(`${mediaKey}_${metaRecord.updatedAt}`, blobUrl);
  memoryBlobCache.set(mediaKey, blobUrl);
  await setCachedStreamBlob(mediaKey, file);
  await setCachedStreamBlob(`${mediaKey}_${metaRecord.updatedAt}`, file);

  return metaRecord;
}

/**
 * Load and assemble video chunks from Firestore into a playable browser Blob URL.
 * Automatically caches in memory and IndexedDB so it plays instantly without re-fetching.
 * 
 * @param {object} meta - Section media metadata containing totalChunks, mediaKey, etc.
 * @returns {Promise<string>} Playable Object URL
 */
export async function loadVideoFromFirestore(meta) {
  if (!meta || meta.videoType !== 'firestore_stream') return null;

  const mediaKey = meta.mediaKey || meta.sectionKey || 'about';
  const cacheKey = `${mediaKey}_${meta.updatedAt || 'default'}`;

  if (memoryBlobCache.has(cacheKey)) {
    return memoryBlobCache.get(cacheKey);
  }
  if (memoryBlobCache.has(mediaKey)) {
    return memoryBlobCache.get(mediaKey);
  }

  // Check persistent IndexedDB cache
  const cachedBlob = await getCachedStreamBlob(cacheKey) || await getCachedStreamBlob(mediaKey);
  if (cachedBlob) {
    try {
      const idbBlobUrl = URL.createObjectURL(cachedBlob);
      memoryBlobCache.set(cacheKey, idbBlobUrl);
      memoryBlobCache.set(mediaKey, idbBlobUrl);
      return idbBlobUrl;
    } catch (e) {}
  }

  try {
    const totalChunks = meta.totalChunks || 1;
    const mimeType = meta.mimeType || 'video/mp4';

    const chunkDocs = [];
    const BATCH_SIZE = 10;

    for (let i = 0; i < totalChunks; i += BATCH_SIZE) {
      const batchPromises = [];
      const end = Math.min(i + BATCH_SIZE, totalChunks);
      for (let j = i; j < end; j++) {
        const chunkDocRef = doc(db, CHUNKS_COLLECTION, `${mediaKey}_chunk_${j}`);
        batchPromises.push(
          getDoc(chunkDocRef).then((snap) => {
            if (!snap.exists()) {
              throw new Error(`Missing video chunk ${j}`);
            }
            return snap.data();
          })
        );
      }
      const batchResults = await Promise.all(batchPromises);
      chunkDocs.push(...batchResults);
    }

    chunkDocs.sort((a, b) => a.index - b.index);

    const binaryChunks = chunkDocs.map(c => base64ToUint8Array(c.data));
    const blob = new Blob(binaryChunks, { type: mimeType });
    const blobUrl = URL.createObjectURL(blob);

    memoryBlobCache.set(cacheKey, blobUrl);
    memoryBlobCache.set(mediaKey, blobUrl);
    await setCachedStreamBlob(cacheKey, blob);
    await setCachedStreamBlob(mediaKey, blob);
    return blobUrl;
  } catch (err) {
    console.warn('[FirestoreVideo] Failed to load video from Firestore chunks:', err);
    return null;
  }
}
