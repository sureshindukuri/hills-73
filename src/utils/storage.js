import { pushCloudUpdate, fetchLatestCloudState, fileToDataUrl } from './cloudSync';
import { saveToFirebaseCloud, uploadMediaToFirebaseStorage } from '../firebase/firestoreSync';

/**
 * Storage Utility with IndexedDB for high-capacity local media
 * and automatic Real-Time Cloud Sync for all cross-device Admin updates.
 */

const DB_NAME = '73HillsResortDB';
const DB_VERSION = 2;
const GALLERY_STORE = 'gallery_media';
const SECTION_MEDIA_STORE = 'section_media';
const SECTION_MEDIA_CACHE_KEY = '73hills_section_media_cache_v2';
const LAST_LOCAL_UPDATE_KEY = '73hills_last_local_update';

export function touchLocalUpdate() {
  try {
    localStorage.setItem(LAST_LOCAL_UPDATE_KEY, Date.now().toString());
  } catch (e) {}
}

export function getLocalUpdateTimestamp() {
  try {
    return Number(localStorage.getItem(LAST_LOCAL_UPDATE_KEY)) || 0;
  } catch (e) {
    return 0;
  }
}

// 4K Enhanced Sanctuary & Cultural Moments Gallery
export const DEFAULT_GALLERY_ITEMS = [
  {
    id: 'gallery-1',
    title: 'Organic Strawberry & Flora Harvest',
    category: 'Nature',
    type: 'image',
    url: '/assets/gallery/gallery_strawberry_plantation.jpg',
    isDefault: true,
    uploadedAt: '2026-09-09'
  },
  {
    id: 'gallery-2',
    title: 'Sandalwood Sanctuary & Forest Walk',
    category: 'Nature',
    type: 'image',
    url: '/assets/gallery/gallery_sandalwood_forest_tour.jpg',
    isDefault: true,
    uploadedAt: '2026-09-09'
  },
  {
    id: 'gallery-3',
    title: '73 Hills Grand Gathering & Event Lawn',
    category: 'Celebrations',
    type: 'image',
    url: '/assets/gallery/gallery_resort_community_gathering.jpg',
    isDefault: true,
    uploadedAt: '2026-09-09'
  },
  {
    id: 'gallery-4',
    title: 'Sankranthi Sambaralu Festive Tradition',
    category: 'Celebrations',
    type: 'image',
    url: '/assets/gallery/gallery_sankranthi_festival_celebration.jpg',
    isDefault: true,
    uploadedAt: '2026-09-09'
  },
  {
    id: 'gallery-5',
    title: 'Folk Heritage & Haridasu Performance',
    category: 'Celebrations',
    type: 'image',
    url: '/assets/gallery/gallery_haridasu_cultural_heritage.jpg',
    isDefault: true,
    uploadedAt: '2026-09-09'
  }
];

// Open or create IndexedDB
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(GALLERY_STORE)) {
        db.createObjectStore(GALLERY_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(SECTION_MEDIA_STORE)) {
        db.createObjectStore(SECTION_MEDIA_STORE, { keyPath: 'sectionKey' });
      }
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onerror = (event) => {
      console.error('IndexedDB Error:', event.target.error);
      reject(event.target.error);
    };
  });
}

// Convert File to ObjectURL safely
function createBlobUrl(blob) {
  try {
    return URL.createObjectURL(blob);
  } catch (e) {
    console.error('Error creating blob URL:', e);
    return null;
  }
}

// Default Section Media Fallbacks
export const DEFAULT_SECTION_MEDIA = {
  about: {
    sectionKey: 'about',
    mediaType: 'video',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-a-luxury-resort-in-the-forest-42407-large.mp4',
    title: '73 Hills 73 Acres Resort Full Aerial & Ground Tour',
    isDefault: true,
    thumbnailUrl: '/assets/about_sandalwood_path.png'
  },
  hero: {
    sectionKey: 'hero',
    mediaType: 'image',
    url: '/assets/hero_aerial_73hills.jpg',
    title: '73 Hills 73 Acres Aerial Sanctuary',
    isDefault: true
  },
  celebrations: {
    sectionKey: 'celebrations',
    mediaType: 'image',
    url: '/assets/celebration_estate_aerial.jpg',
    title: '73 Hills 73 Acres Grand Celebration Grounds',
    isDefault: true
  }
};

/**
 * Synchronously get stored section media from localStorage cache with default fallback
 */
export function getStoredSectionMediaSync() {
  try {
    const cached = localStorage.getItem(SECTION_MEDIA_CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      return {
        ...DEFAULT_SECTION_MEDIA,
        ...parsed
      };
    }
  } catch (e) {}
  return DEFAULT_SECTION_MEDIA;
}

/**
 * Save Section-Specific Media (Logo, Hero, About, Celebrations, etc.)
 * Permanently uploads to Firebase Storage so all devices worldwide can view it,
 * caches locally, and syncs across Firestore.
 */
export async function saveSectionMedia(sectionKey, fileOrUrl, meta = {}, onProgress = null) {
  touchLocalUpdate();
  try {
    let finalUrl = null;
    let isVideo = false;
    let fileName = meta.title || 'Resort Media';

    if (typeof fileOrUrl === 'string') {
      isVideo = fileOrUrl.includes('youtube.com') || fileOrUrl.includes('youtu.be') || fileOrUrl.includes('vimeo.com') || fileOrUrl.endsWith('.mp4') || fileOrUrl.endsWith('.webm') || meta.mediaType === 'video';
      finalUrl = fileOrUrl;
      fileName = meta.title || fileOrUrl.split('/').pop() || 'Custom Video Link';
    } else {
      isVideo = fileOrUrl.type ? fileOrUrl.type.startsWith('video/') : false;
      fileName = fileOrUrl.name || 'uploaded_media';
      
      // Upload directly to Firebase Storage for permanent worldwide CDN URL
      try {
        const cloudCdnUrl = await uploadMediaToFirebaseStorage(fileOrUrl, 'section_' + sectionKey, onProgress);
        if (cloudCdnUrl) {
          finalUrl = cloudCdnUrl;
        }
      } catch (uploadErr) {
        console.warn('[Storage] Firebase Storage direct upload notice:', uploadErr);
      }

      // Fallback if offline or upload in progress
      if (!finalUrl) {
        if (isVideo) {
          finalUrl = createBlobUrl(fileOrUrl) || '';
        } else {
          try {
            finalUrl = await fileToDataUrl(fileOrUrl, 1200, 0.75);
          } catch (e) {
            finalUrl = createBlobUrl(fileOrUrl) || '';
          }
        }
      }
    }

    const savedRecord = {
      sectionKey,
      fileName,
      mediaType: isVideo ? 'video' : 'image',
      customUrl: finalUrl,
      url: finalUrl,
      title: meta.title || fileName,
      updatedAt: new Date().toISOString(),
      isDefault: false,
      ...meta
    };

    // 1. Save synchronously to localStorage cache for instant zero-latency UI rendering
    try {
      const currentCache = getStoredSectionMediaSync();
      const updatedCache = {
        ...currentCache,
        [sectionKey]: savedRecord
      };
      localStorage.setItem(SECTION_MEDIA_CACHE_KEY, JSON.stringify(updatedCache));
    } catch (cacheErr) {
      console.warn('[Storage] Local storage cache notice:', cacheErr);
    }

    // 2. Save locally in IndexedDB with raw blob if present
    try {
      const db = await openDB();
      const transaction = db.transaction(SECTION_MEDIA_STORE, 'readwrite');
      const store = transaction.objectStore(SECTION_MEDIA_STORE);
      await new Promise((resolve) => {
        const idbRecord = typeof fileOrUrl === 'object' ? { ...savedRecord, fileBlob: fileOrUrl } : savedRecord;
        const req = store.put(idbRecord);
        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
      });
    } catch (idbErr) {
      console.warn('[Storage] IndexedDB put notice:', idbErr);
    }

    // 3. Broadcast and sync to Cloud & Firebase in real-time
    try {
      const allCurrent = await getAllSectionMedia();
      const cleanCurrent = {};
      Object.entries(allCurrent).forEach(([k, v]) => {
        if (v && v.sectionKey) {
          cleanCurrent[k] = {
            sectionKey: v.sectionKey,
            mediaType: v.mediaType || 'image',
            fileName: v.fileName || '',
            title: v.title || '',
            customUrl: v.customUrl || (v.url && !v.url.startsWith('blob:') ? v.url : null),
            url: (v.url && !v.url.startsWith('blob:') ? v.url : null) || v.customUrl || null,
            updatedAt: v.updatedAt || new Date().toISOString(),
            isDefault: !!v.isDefault
          };
        }
      });

      const updatedCloudMap = {
        ...cleanCurrent,
        [sectionKey]: {
          sectionKey,
          mediaType: savedRecord.mediaType,
          fileName: savedRecord.fileName,
          title: savedRecord.title,
          customUrl: savedRecord.url,
          url: savedRecord.url,
          updatedAt: savedRecord.updatedAt,
          isDefault: false
        }
      };

      await saveToFirebaseCloud('sectionMedia', updatedCloudMap);
      pushCloudUpdate('sectionMedia', updatedCloudMap);
    } catch (syncErr) {
      console.warn('[Storage] Cloud sync error:', syncErr);
    }

    return savedRecord;
  } catch (error) {
    console.error(`Error saving section media (${sectionKey}):`, error);
    const fallbackUrl = typeof fileOrUrl === 'string' ? fileOrUrl : createBlobUrl(fileOrUrl);
    return {
      sectionKey,
      mediaType: (fileOrUrl.type && fileOrUrl.type.startsWith('video/')) ? 'video' : 'image',
      url: fallbackUrl,
      customUrl: fallbackUrl,
      isDefault: false,
      ...meta
    };
  }
}

/**
 * Retrieve Section-Specific Media from IndexedDB / Cloud Cache
 */
export async function getSectionMedia(sectionKey) {
  try {
    const db = await openDB();
    const transaction = db.transaction(SECTION_MEDIA_STORE, 'readonly');
    const store = transaction.objectStore(SECTION_MEDIA_STORE);

    return new Promise((resolve) => {
      const request = store.get(sectionKey);
      request.onsuccess = (event) => {
        const result = event.target.result;
        if (result) {
          const url = result.customUrl || result.url || (result.fileBlob ? createBlobUrl(result.fileBlob) : null);
          resolve({ ...result, url });
        } else {
          const syncCache = getStoredSectionMediaSync();
          resolve(syncCache[sectionKey] || DEFAULT_SECTION_MEDIA[sectionKey] || null);
        }
      };
      request.onerror = () => {
        const syncCache = getStoredSectionMediaSync();
        resolve(syncCache[sectionKey] || DEFAULT_SECTION_MEDIA[sectionKey] || null);
      };
    });
  } catch (e) {
    console.warn(`Error getting section media (${sectionKey}):`, e);
    const syncCache = getStoredSectionMediaSync();
    return syncCache[sectionKey] || DEFAULT_SECTION_MEDIA[sectionKey] || null;
  }
}

/**
 * Get all Section Media items as a key-value dictionary
 */
export async function getAllSectionMedia() {
  const syncCache = getStoredSectionMediaSync();
  try {
    const db = await openDB();
    const transaction = db.transaction(SECTION_MEDIA_STORE, 'readonly');
    const store = transaction.objectStore(SECTION_MEDIA_STORE);

    return new Promise((resolve) => {
      const request = store.getAll();
      request.onsuccess = (event) => {
        const results = event.target.result || [];
        const mediaMap = { ...DEFAULT_SECTION_MEDIA, ...syncCache };
        results.forEach(item => {
          if (item && item.sectionKey) {
            const url = item.customUrl || item.url || (item.fileBlob ? createBlobUrl(item.fileBlob) : null);
            mediaMap[item.sectionKey] = {
              ...item,
              url: url || mediaMap[item.sectionKey]?.url
            };
          }
        });
        resolve(mediaMap);
      };
      request.onerror = () => resolve(syncCache);
    });
  } catch (e) {
    console.warn('Error fetching all section media:', e);
    return syncCache;
  }
}

/**
 * Delete a Section-Specific Media record (Resets section to default asset)
 */
export async function deleteSectionMedia(sectionKey) {
  touchLocalUpdate();
  try {
    // 1. Remove from localStorage cache
    try {
      const currentCache = getStoredSectionMediaSync();
      delete currentCache[sectionKey];
      localStorage.setItem(SECTION_MEDIA_CACHE_KEY, JSON.stringify(currentCache));
    } catch (e) {}

    // 2. Remove from IndexedDB
    const db = await openDB();
    const transaction = db.transaction(SECTION_MEDIA_STORE, 'readwrite');
    const store = transaction.objectStore(SECTION_MEDIA_STORE);

    await new Promise((resolve) => {
      const request = store.delete(sectionKey);
      request.onsuccess = () => resolve(true);
      request.onerror = () => resolve(false);
    });

    // 3. Cloud Sync deletion
    try {
      const allCurrent = await getAllSectionMedia();
      const updated = { ...allCurrent };
      delete updated[sectionKey];
      await saveToFirebaseCloud('sectionMedia', updated);
      pushCloudUpdate('sectionMedia', updated);
    } catch(e) {}

    return true;
  } catch (error) {
    console.error(`Failed to delete section media (${sectionKey}):`, error);
    return false;
  }
}

/**
 * Save custom media item to Gallery with Cloud Sync
 */
export async function saveMediaItem(mediaMeta, file, onProgress = null) {
  touchLocalUpdate();
  try {
    const isVideo = file.type ? file.type.startsWith('video/') : false;
    let permanentUrl = null;

    // Upload to Firebase Storage for permanent public URL
    try {
      permanentUrl = await uploadMediaToFirebaseStorage(file, 'gallery', onProgress);
    } catch (e) {
      console.warn('[Storage] Firebase gallery upload notice:', e);
    }

    if (!permanentUrl) {
      if (isVideo) {
        permanentUrl = createBlobUrl(file) || '';
      } else {
        try {
          permanentUrl = await fileToDataUrl(file, 1200, 0.75);
        } catch (e) {
          permanentUrl = createBlobUrl(file) || '';
        }
      }
    }

    const record = {
      id: mediaMeta.id || 'media-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      title: mediaMeta.title || file.name || 'Gallery Item',
      category: mediaMeta.category || 'General',
      type: isVideo ? 'video' : 'image',
      fileName: file.name || 'media_file',
      customUrl: permanentUrl,
      url: permanentUrl,
      uploadedAt: new Date().toISOString().split('T')[0],
      isDefault: false
    };

    // 1. Save to IndexedDB
    try {
      const db = await openDB();
      const transaction = db.transaction(GALLERY_STORE, 'readwrite');
      const store = transaction.objectStore(GALLERY_STORE);
      await new Promise((resolve) => {
        const idbRecord = { ...record, fileBlob: file };
        const request = store.put(idbRecord);
        request.onsuccess = () => resolve(true);
        request.onerror = () => resolve(false);
      });
    } catch (idbErr) {
      console.warn('[Storage] IndexedDB gallery put notice:', idbErr);
    }

    // 2. Real-time Cloud Sync
    try {
      const allGallery = await getAllGalleryItems();
      const cleanGallery = allGallery.map(item => ({
        id: item.id,
        title: item.title,
        category: item.category,
        type: item.type,
        url: item.id === record.id ? record.url : (item.customUrl || (item.url && !item.url.startsWith('blob:') ? item.url : null)),
        uploadedAt: item.uploadedAt,
        isDefault: !!item.isDefault
      }));

      await saveToFirebaseCloud('gallery', cleanGallery);
      pushCloudUpdate('gallery', cleanGallery);
    } catch (e) {}

    return record;
  } catch (error) {
    console.error('Error saving media to Gallery:', error);
    return {
      id: 'media-' + Date.now(),
      title: mediaMeta.title || file.name,
      category: mediaMeta.category || 'General',
      type: file.type?.startsWith('video/') ? 'video' : 'image',
      url: createBlobUrl(file),
      isDefault: false
    };
  }
}

/**
 * Fetch all gallery media items
 */
export async function getAllGalleryItems() {
  try {
    const db = await openDB();
    const transaction = db.transaction(GALLERY_STORE, 'readonly');
    const store = transaction.objectStore(GALLERY_STORE);

    return new Promise((resolve) => {
      const request = store.getAll();
      request.onsuccess = (event) => {
        const customItems = (event.target.result || []).map(item => {
          const url = item.customUrl || item.url || (item.fileBlob ? createBlobUrl(item.fileBlob) : null);
          return {
            ...item,
            url
          };
        });
        resolve([...DEFAULT_GALLERY_ITEMS, ...customItems]);
      };
      request.onerror = () => {
        resolve(DEFAULT_GALLERY_ITEMS);
      };
    });
  } catch (e) {
    console.warn('Falling back to default gallery items:', e);
    return DEFAULT_GALLERY_ITEMS;
  }
}

/**
 * Delete a gallery media item by ID
 */
export async function deleteMediaItem(id) {
  touchLocalUpdate();
  try {
    const db = await openDB();
    const transaction = db.transaction(GALLERY_STORE, 'readwrite');
    const store = transaction.objectStore(GALLERY_STORE);
    
    await new Promise((resolve) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve(true);
      request.onerror = () => resolve(false);
    });

    try {
      const allGallery = await getAllGalleryItems();
      const cleanGallery = allGallery.map(item => ({
        id: item.id,
        title: item.title,
        category: item.category,
        type: item.type,
        url: item.customUrl || (item.url && !item.url.startsWith('blob:') ? item.url : null),
        uploadedAt: item.uploadedAt,
        isDefault: !!item.isDefault
      }));

      await saveToFirebaseCloud('gallery', cleanGallery);
      pushCloudUpdate('gallery', cleanGallery);
    } catch(e) {}

    return true;
  } catch (error) {
    console.error('Failed to delete media:', error);
    return false;
  }
}

// LocalStorage keys for Rooms, Bookings, and Site Content
const ROOMS_KEY = '73hills_rooms_v1';
const BOOKINGS_KEY = '73hills_bookings_v1';
const SETTINGS_KEY = '73hills_settings_v1';

export const DEFAULT_ROOMS = [
  {
    id: 'room-1',
    name: 'Red Sandalwood Villa',
    subtitle: '73 Acres Forest Facing Luxury Suite',
    price: 4999,
    baseGuests: 2,
    extraGuestPrice: 800,
    maxGuests: 6,
    rating: 4.9,
    capacity: '2 - 6 Guests',
    size: '1,200 sq.ft',
    image: '/assets/hero_resort_villa.png',
    features: ['Private Plunge Pool', 'King Plush Bed', 'Forest View Balcony', '24/7 Butler Service', 'Complimentary Sandalwood Spa'],
    description: 'Immerse yourself in ultimate tranquility. Built with handcrafted teak wood and surrounded by towering 73 acres of rare Red Sandalwood trees.'
  },
  {
    id: 'room-2',
    name: 'Hilltop Teak Cottage',
    subtitle: 'Panoramas of Yerravaram Hills',
    price: 3499,
    baseGuests: 2,
    extraGuestPrice: 600,
    maxGuests: 4,
    rating: 4.8,
    capacity: '2 - 4 Guests',
    size: '850 sq.ft',
    image: '/assets/gallery_interior_room.png',
    features: ['Panoramic Deck', 'Soaking Bathtub', 'Organic Coffee Bar', 'Hi-Speed WiFi', 'Fireplace'],
    description: 'Designed for intimate luxury. Located on the highest ridge of 73 Hills offering sunrise views over nature and fresh sandalwood fragrance.'
  },
  {
    id: 'room-3',
    name: 'Royal Heritage Pavilion',
    subtitle: 'Family & Group Executive Estate',
    price: 8999,
    baseGuests: 4,
    extraGuestPrice: 1000,
    maxGuests: 10,
    rating: 5.0,
    capacity: '4 - 10 Guests',
    size: '2,400 sq.ft',
    image: '/assets/celebration_wedding_lawn.png',
    features: ['Private Garden Lawn', '2 Master Bedrooms', 'Dining Pavilion', 'Personal Chef', 'Private Chauffeur'],
    description: 'The pinnacle of grandeur. Spanning a private compound with private gardens, outdoor firepit, and direct access to sandalwood walking trails.'
  }
];

export function getStoredRooms() {
  const stored = localStorage.getItem(ROOMS_KEY);
  if (stored) {
    try { 
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch(e) {}
  }
  return DEFAULT_ROOMS;
}

export function saveStoredRooms(rooms) {
  touchLocalUpdate();
  localStorage.setItem(ROOMS_KEY, JSON.stringify(rooms));
  saveToFirebaseCloud('rooms', rooms);
  pushCloudUpdate('rooms', rooms);
}

export const DEFAULT_BOOKINGS = [];

export function getStoredBookings() {
  const stored = localStorage.getItem(BOOKINGS_KEY);
  if (stored !== null) {
    try { 
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    } catch(e) {}
  }
  return [];
}

export function saveStoredBookings(bookings) {
  touchLocalUpdate();
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
  saveToFirebaseCloud('bookings', bookings);
  pushCloudUpdate('bookings', bookings);
}

export function clearStoredBookings() {
  touchLocalUpdate();
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify([]));
  saveToFirebaseCloud('bookings', []);
  pushCloudUpdate('bookings', []);
}

export const DEFAULT_POLICIES_FALLBACK = {
  brandName: '73 HILLS',
  brandSubtitle: 'RESORT & REAL ESTATE',
  heroTitle: 'A Luxury Escape Rooted in Nature',
  heroSubtitle: '73 Acres of pure serenity with Red Sandalwood & Sandalwood trees, crafted for relaxation, celebrations, and unforgettable memories.',
  phone1: '+91 9948445143',
  phone2: '+91 9948445143',
  email: 'hello@73hills.com',
  location: 'HQ3Q+HP3, Yerravaram, Andhra Pradesh 531055',
  aboutHeadline: 'Where Nature Meets Luxury',
  aboutParagraph: '73 Hills is a premium resort and real estate property sprawled across 73 acres of fragrance, greenery and tranquility. Home to Red Sandalwood and Sandalwood trees, this is more than a stay — it\'s an experience that stays with you forever.',
  celebrationHeadline: 'Make Every Moment Unforgettable',
  celebrationParagraph: 'Whether you are planning an intimate candle-lit wedding under sparkling sandalwood canopy, an executive corporate retreat, or a milestone family reunion, 73 Hills provides 73 acres of magical natural backdrop.',
  
  // Rules, Policies & Printable Receipt Settings
  checkInTime: '02:00 PM',
  checkOutTime: '11:00 AM',
  gstin: '37AAACH7373H1Z2',
  cancellationPolicy: 'Free cancellation up to 48 hours before scheduled check-in date. Cancellations made within 48 hours are subject to a 1-night retention tariff charge.',
  privacyPolicy: 'At 73 Hills Resort, your privacy is strictly protected. Guest identity records and payment data are encrypted under 256-bit SSL protocols and will never be shared with third parties. All digital transactions are authenticated via secure Indian banking channels.',
  houseRules: [
    'Government-issued Photo ID (Aadhaar, Passport, or Driving License) is mandatory for all checking-in adult guests.',
    '73 Hills is an eco-preserved Sandalwood biological sanctuary. Smoking and open fires are strictly prohibited near sandalwood groves.',
    'Quiet forest hours are observed between 10:30 PM and 6:30 AM to honor the natural serenity.',
    'Swimming pool timings: 06:30 AM to 07:30 PM with standard swimwear mandatory.'
  ],
  receiptFooterNote: 'Thank you for choosing 73 Hills Resort. We look forward to offering you an unforgettable luxury sanctuary experience!'
};

export function getSiteSettings() {
  const stored = localStorage.getItem(SETTINGS_KEY);
  if (stored) {
    try { 
      const parsed = JSON.parse(stored);
      return {
        ...DEFAULT_POLICIES_FALLBACK,
        ...parsed
      };
    } catch(e) {}
  }
  return DEFAULT_POLICIES_FALLBACK;
}

export function saveSiteSettings(settings) {
  touchLocalUpdate();
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  saveToFirebaseCloud('settings', settings);
  pushCloudUpdate('settings', settings);
}

/**
 * Synchronize local storage & IndexedDB with the latest Cloud state.
 * Called when any device loads or receives live cloud broadcast.
 */
export async function syncFromCloudToLocal() {
  try {
    const cloudState = await fetchLatestCloudState();
    if (!cloudState) return null;

    const localTimestamp = getLocalUpdateTimestamp();
    const cloudTimestamp = Number(cloudState.lastUpdated) || 0;

    // If local update is newer than cloud, do not blindly overwrite!
    if (localTimestamp > cloudTimestamp) {
      return null;
    }

    if (cloudState.settings) {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(cloudState.settings));
    }
    if (cloudState.rooms && Array.isArray(cloudState.rooms) && cloudState.rooms.length > 0) {
      localStorage.setItem(ROOMS_KEY, JSON.stringify(cloudState.rooms));
    }
    if (cloudState.bookings && Array.isArray(cloudState.bookings)) {
      localStorage.setItem(BOOKINGS_KEY, JSON.stringify(cloudState.bookings));
    }
    if (cloudState.sectionMedia) {
      try {
        const db = await openDB();
        const transaction = db.transaction(SECTION_MEDIA_STORE, 'readwrite');
        const store = transaction.objectStore(SECTION_MEDIA_STORE);
        Object.entries(cloudState.sectionMedia).forEach(([key, record]) => {
          if (record && record.sectionKey && (record.url || record.customUrl)) {
            store.put(record);
          }
        });
      } catch(e) {}
    }

    return cloudState;
  } catch(e) {
    console.warn('[Storage] Error during cloud sync to local:', e);
    return null;
  }
}
