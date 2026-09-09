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
    console.warn('[CloudSync] Could not fetch from cloud, reading local cache:', error.message);
    try {
      const cached = localStorage.getItem(LOCAL_CACHE_KEY);
      if (cached) return JSON.parse(cached);
    } catch (e) {}
    return null;
  }
}

/**
 * Push an updated section to Cloud so all devices receive it instantly
 * @param {string} key - 'settings' | 'sectionMedia' | 'rooms' | 'gallery' | 'bookings'
 * @param {any} value - updated data for this key
 */
export async function pushCloudUpdate(key, value) {
  try {
    // 1. Get current cloud state or fallback
    let currentState = {};
    try {
      const res = await fetch(CLOUD_SYNC_ENDPOINT, { cache: 'no-cache' });
      if (res.ok) {
        const json = await res.json();
        if (json && json.data) currentState = json.data;
      }
    } catch (e) {
      try {
        const cached = localStorage.getItem(LOCAL_CACHE_KEY);
        if (cached) currentState = JSON.parse(cached);
      } catch (e2) {}
    }

    // 2. Merge update
    const updatedState = {
      ...currentState,
      [key]: value,
      lastUpdated: Date.now()
    };

    // 3. Save locally
    try {
      localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify(updatedState));
    } catch (e) {}

    // 4. Push to Cloud
    const putRes = await fetch(CLOUD_SYNC_ENDPOINT, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        name: '73hills_production_state',
        data: updatedState
      })
    });

    if (!putRes.ok) {
      console.warn('[CloudSync] Cloud PUT status:', putRes.status);
    }

    // 5. Broadcast to local tabs & components
    notifySubscribers(updatedState);

    return { success: true, updatedState };
  } catch (err) {
    console.error('[CloudSync] Failed to push update to cloud:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Convert and compress an image/media file into an optimized Data URL for cloud persistence
 */
export function fileToDataUrl(file, maxDimension = 1600, quality = 0.82) {
  return new Promise((resolve, reject) => {
    if (!file) return resolve(null);

    // If it is an image, compress it with an off-screen canvas to stay well within Firestore & Cloud limits
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
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    } else {
      // For videos, svgs or documents
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    }
  });
}
