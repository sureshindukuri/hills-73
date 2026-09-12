import { db } from './config';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const CHUNKS_COLLECTION = 'resort_media_chunks';
const CHUNK_SIZE_BYTES = 500 * 1024; // 500 KB binary chunk (becomes ~667 KB Base64, safely below 1 MB Firestore limit)

// In-memory object URL cache to prevent repeated downloads
const memoryBlobCache = new Map();

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
 * @param {File} file - Browser File object
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

  // Read all chunks from file
  const chunkPromises = [];
  for (let i = 0; i < totalChunks; i++) {
    const start = i * CHUNK_SIZE_BYTES;
    const end = Math.min(start + CHUNK_SIZE_BYTES, totalSize);
    const slice = file.slice(start, end);

    const promise = new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error(`Failed to read chunk ${i}`));
      reader.onload = async () => {
        try {
          const base64Data = bufferToBase64(reader.result);
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
          resolve(true);
        } catch (err) {
          reject(err);
        }
      };
      reader.readAsArrayBuffer(slice);
    });

    chunkPromises.push(promise);
  }

  // Upload chunks in parallel batches of 5 to maximize throughput
  const BATCH_SIZE = 5;
  for (let i = 0; i < chunkPromises.length; i += BATCH_SIZE) {
    const batch = chunkPromises.slice(i, i + BATCH_SIZE);
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
    fileName: file.name,
    title: '73 Acres Sandalwood Sanctuary Tour',
    updatedAt: new Date(timestamp).toISOString(),
    isDefault: false
  };

  // Cache locally
  const blobUrl = URL.createObjectURL(file);
  memoryBlobCache.set(`${mediaKey}_${metaRecord.updatedAt}`, blobUrl);

  return metaRecord;
}

/**
 * Load and assemble video chunks from Firestore into a playable browser Blob URL.
 * Automatically caches in memory so it plays instantly without re-fetching.
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

  try {
    const totalChunks = meta.totalChunks || 1;
    const mimeType = meta.mimeType || 'video/mp4';

    const chunkPromises = [];
    for (let i = 0; i < totalChunks; i++) {
      const chunkDocRef = doc(db, CHUNKS_COLLECTION, `${mediaKey}_chunk_${i}`);
      chunkPromises.push(
        getDoc(chunkDocRef).then((snap) => {
          if (!snap.exists()) {
            throw new Error(`Missing video chunk ${i}`);
          }
          return snap.data();
        })
      );
    }

    const chunkDocs = await Promise.all(chunkPromises);
    chunkDocs.sort((a, b) => a.index - b.index);

    const binaryChunks = chunkDocs.map(c => base64ToUint8Array(c.data));
    const blob = new Blob(binaryChunks, { type: mimeType });
    const blobUrl = URL.createObjectURL(blob);

    memoryBlobCache.set(cacheKey, blobUrl);
    return blobUrl;
  } catch (err) {
    console.warn('[FirestoreVideo] Failed to load video from Firestore chunks:', err);
    return null;
  }
}
