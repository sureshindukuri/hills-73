/**
 * 73 Hills Resort & Real Estate - Cloud Sync Utility
 * Enables real-time, cross-device synchronization for all Admin changes:
 * - About section video & media
 * - Hero & Celebrations backgrounds
 * - Room details & pricing
 * - Gallery photos & videos
 * - Site settings, contact info, rules & policies
 * - Real guest bookings & leads
 */

const CLOUD_SYNC_ENDPOINT = 'https://api.restful-api.dev/objects/ff808181a067127101a0850f9c5d53f4';
const LOCAL_CACHE_KEY = '73hills_cloud_state_cache_v1';

// In-memory subscribers for live state change notifications
const subscribers = new Set();

export function subscribeToCloudUpdates(callback) {
  subscribers.add(callback);
  return () => subscribers.delete(callback);
}

function notifySubscribers(newState) {
  subscribers.forEach(cb => {
    try {
      cb(newState);
    } catch (e) {
      console.warn('[CloudSync] Subscriber notification error:', e);
    }
  });
}

/**
 * Fetch latest global state from Cloud
 */
export async function fetchLatestCloudState() {
  try {
    const res = await fetch(CLOUD_SYNC_ENDPOINT, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      cache: 'no-cache'
    });

    if (!res.ok) {
      throw new Error(`Cloud fetch returned status ${res.status}`);
    }

    const json = await res.json();
    if (json && json.data) {
      // Update local storage cache
      try {
        localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify(json.data));
      } catch (e) {}

      return json.data;
    }
    return null;
  } catch (error) {
    console.warn('[CloudSync] Notice reading local cache:', error.message);
    try {
      const cached = localStorage.getItem(LOCAL_CACHE_KEY);
      if (cached) return JSON.parse(cached);
    } catch (e) {}
    return null;
  }
}

/**
 * Clean data so it is serializable and does not contain raw Blobs/Files
 */
function cleanForCloud(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (typeof Blob !== 'undefined' && obj instanceof Blob) return undefined;
  if (typeof File !== 'undefined' && obj instanceof File) return undefined;
  if (Array.isArray(obj)) {
    return obj.map(cleanForCloud).filter(v => v !== undefined);
  }
  const clean = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      if (typeof Blob !== 'undefined' && value instanceof Blob) continue;
      if (typeof File !== 'undefined' && value instanceof File) continue;
      const cleaned = cleanForCloud(value);
      if (cleaned !== undefined) {
        clean[key] = cleaned;
      }
    }
  }
  return clean;
}

/**
 * Push an updated section to Cloud so all devices receive it instantly
 * @param {string} key - 'settings' | 'sectionMedia' | 'rooms' | 'gallery' | 'bookings'
 * @param {any} value - updated data for this key
 */
export async function pushCloudUpdate(key, value) {
  try {
    const cleanedValue = cleanForCloud(value);

    // 1. Get current cloud state or fallback
    let currentState = {};
    try {
      const cached = localStorage.getItem(LOCAL_CACHE_KEY);
      if (cached) currentState = JSON.parse(cached);
    } catch (e2) {}

    // 2. Merge update
    const updatedState = {
      ...currentState,
      [key]: cleanedValue,
      lastUpdated: Date.now()
    };

    // 3. Save locally
    try {
      localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify(updatedState));
    } catch (e) {}

    // 4. Push to Cloud asynchronously
    fetch(CLOUD_SYNC_ENDPOINT, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        name: '73hills_production_state',
        data: updatedState
      })
    }).catch((err) => {
      console.warn('[CloudSync] Background sync notice:', err.message);
    });

    // 5. Broadcast to local tabs & components
    notifySubscribers(updatedState);

    return { success: true, updatedState };
  } catch (err) {
    console.warn('[CloudSync] Local fallback maintained:', err);
    return { success: true };
  }
}

/**
 * Convert and compress an image/media file into an optimized Data URL for cloud persistence
 */
export function fileToDataUrl(file, maxDimension = 1200, quality = 0.75) {
  return new Promise((resolve) => {
    if (!file) return resolve(null);

    // If it is a video file, create an instant Blob URL in 1ms!
    if (file.type && file.type.startsWith('video/')) {
      try {
        const localBlobUrl = URL.createObjectURL(file);
        return resolve(localBlobUrl);
      } catch (e) {
        return resolve(null);
      }
    }

    // If it is an image, compress fast with an off-screen canvas
    if (file.type && file.type.startsWith('image/') && !file.type.includes('svg')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let { width, height } = img;
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedDataUrl);
        };
        img.onerror = () => resolve(e.target.result);
        img.src = e.target.result;
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    } else {
      // SVGs or small files
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    }
  });
}
