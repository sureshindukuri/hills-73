import { pushCloudUpdate, fetchLatestCloudState, fileToDataUrl } from './cloudSync';
import { saveToFirebaseCloud } from '../firebase/firestoreSync';

/**
 * Storage Utility with IndexedDB for high-capacity local media
 * and automatic Real-Time Cloud Sync for all cross-device Admin updates.
 */

const DB_NAME = '73HillsResortDB';
const DB_VERSION = 2;
const GALLERY_STORE = 'gallery_media';
const SECTION_MEDIA_STORE = 'section_media';

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
 * Save Section-Specific Media (Logo, Hero, About, Celebrations, etc.)
 * Automatically broadcasts and syncs to all devices via Cloud Sync.
 */
export async function saveSectionMedia(sectionKey, fileOrUrl, meta = {}) {
  try {
    const db = await openDB();
    const transaction = db.transaction(SECTION_MEDIA_STORE, 'readwrite');
    const store = transaction.objectStore(SECTION_MEDIA_STORE);

    let record;
    let cloudUrl = null;

    if (typeof fileOrUrl === 'string') {
      const isVideo = fileOrUrl.includes('youtube.com') || fileOrUrl.includes('youtu.be') || fileOrUrl.includes('vimeo.com') || fileOrUrl.endsWith('.mp4') || fileOrUrl.endsWith('.webm') || meta.mediaType === 'video';
      record = {
        sectionKey,
        customUrl: fileOrUrl,
        mediaType: isVideo ? 'video' : 'image',
        fileName: meta.title || fileOrUrl.split('/').pop() || 'Custom Video Link',
        updatedAt: new Date().toISOString(),
        isDefault: false,
        ...meta
      };
      cloudUrl = fileOrUrl;
    } else {
      // Device file / blob: convert to dataUrl for cross-device cloud persistence
      try {
        cloudUrl = await fileToDataUrl(fileOrUrl);
      } catch(e) {
        console.warn('Could not create dataUrl:', e);
      }

      record = {
        sectionKey,
        fileName: fileOrUrl.name,
        fileType: fileOrUrl.type,
        mediaType: fileOrUrl.type.startsWith('video/') ? 'video' : 'image',
        fileBlob: fileOrUrl,
        customUrl: cloudUrl || null,
        updatedAt: new Date().toISOString(),
        isDefault: false,
        ...meta
      };
    }

    const savedRecord = await new Promise((resolve, reject) => {
      const request = store.put(record);
      request.onsuccess = () => {
        const url = record.customUrl || (record.fileBlob ? createBlobUrl(record.fileBlob) : null);
        resolve({ ...record, url });
      };
      request.onerror = (err) => reject(err);
    });

    // Sync to Cloud so all devices receive the new video/image
    try {
      const allCurrent = await getAllSectionMedia();
      const updatedCloudMap = {
        ...allCurrent,
        [sectionKey]: {
          sectionKey,
          customUrl: savedRecord.customUrl || savedRecord.url,
          url: savedRecord.customUrl || savedRecord.url,
          mediaType: savedRecord.mediaType,
          fileName: savedRecord.fileName,
          title: savedRecord.title || meta.title,
          updatedAt: savedRecord.updatedAt,
          isDefault: false
        }
      };
      pushCloudUpdate('sectionMedia', updatedCloudMap);
      saveToFirebaseCloud('sectionMedia', updatedCloudMap);
    } catch(e) {
      console.warn('[Storage] Cloud sync broadcast error:', e);
    }

    return savedRecord;
  } catch (error) {
    console.error(`Error saving section media (${sectionKey}):`, error);
    throw error;
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
          const url = result.customUrl || (result.fileBlob ? createBlobUrl(result.fileBlob) : null);
          resolve({ ...result, url });
        } else {
          resolve(DEFAULT_SECTION_MEDIA[sectionKey] || null);
        }
      };
      request.onerror = () => resolve(DEFAULT_SECTION_MEDIA[sectionKey] || null);
    });
  } catch (e) {
    console.warn(`Error getting section media (${sectionKey}):`, e);
    return DEFAULT_SECTION_MEDIA[sectionKey] || null;
  }
}

/**
 * Get all Section Media items as a key-value dictionary
 */
export async function getAllSectionMedia() {
  try {
    const db = await openDB();
    const transaction = db.transaction(SECTION_MEDIA_STORE, 'readonly');
    const store = transaction.objectStore(SECTION_MEDIA_STORE);

    return new Promise((resolve) => {
      const request = store.getAll();
      request.onsuccess = (event) => {
        const results = event.target.result || [];
        const mediaMap = { ...DEFAULT_SECTION_MEDIA };
        results.forEach(item => {
          if (item && item.sectionKey) {
            const url = item.customUrl || (item.fileBlob ? createBlobUrl(item.fileBlob) : item.url);
            mediaMap[item.sectionKey] = {
              ...item,
              url
            };
          }
        });
        resolve(mediaMap);
      };
      request.onerror = () => resolve(DEFAULT_SECTION_MEDIA);
    });
  } catch (e) {
    console.warn('Error fetching all section media:', e);
    return DEFAULT_SECTION_MEDIA;
  }
}

/**
 * Delete a Section-Specific Media record (Resets section to default asset)
 */
export async function deleteSectionMedia(sectionKey) {
  try {
    const db = await openDB();
    const transaction = db.transaction(SECTION_MEDIA_STORE, 'readwrite');
    const store = transaction.objectStore(SECTION_MEDIA_STORE);

    await new Promise((resolve, reject) => {
      const request = store.delete(sectionKey);
      request.onsuccess = () => resolve(true);
      request.onerror = (err) => reject(err);
    });

    // Cloud Sync deletion
    try {
      const allCurrent = await getAllSectionMedia();
      const updated = { ...allCurrent };
      delete updated[sectionKey];
      pushCloudUpdate('sectionMedia', updated);
      saveToFirebaseCloud('sectionMedia', updated);
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
export async function saveMediaItem(mediaMeta, file) {
  try {
    const db = await openDB();
    const transaction = db.transaction(GALLERY_STORE, 'readwrite');
    const store = transaction.objectStore(GALLERY_STORE);
    
    let dataUrl = null;
    try {
      dataUrl = await fileToDataUrl(file);
    } catch(e) {}

    const record = {
      id: mediaMeta.id || 'media-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      title: mediaMeta.title || file.name,
      category: mediaMeta.category || 'General',
      type: file.type.startsWith('video/') ? 'video' : 'image',
      fileName: file.name,
      fileBlob: file,
      customUrl: dataUrl || null,
      uploadedAt: new Date().toISOString().split('T')[0],
      isDefault: false
    };

    const saved = await new Promise((resolve, reject) => {
      const request = store.put(record);
      request.onsuccess = () => {
        const url = record.customUrl || createBlobUrl(file);
        resolve({ ...record, url });
      };
      request.onerror = (err) => reject(err);
    });

    // Sync Gallery to Cloud & Firebase
    try {
      const allGallery = await getAllGalleryItems();
      pushCloudUpdate('gallery', allGallery);
      saveToFirebaseCloud('gallery', allGallery);
    } catch(e) {}

    return saved;
  } catch (error) {
    console.error('Error saving media to IndexedDB:', error);
    throw error;
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
          const url = item.customUrl || (item.fileBlob ? createBlobUrl(item.fileBlob) : item.url);
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
  try {
    const db = await openDB();
    const transaction = db.transaction(GALLERY_STORE, 'readwrite');
    const store = transaction.objectStore(GALLERY_STORE);
    
    await new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve(true);
      request.onerror = (err) => reject(err);
    });

    try {
      const allGallery = await getAllGalleryItems();
      pushCloudUpdate('gallery', allGallery);
      saveToFirebaseCloud('gallery', allGallery);
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
    try { return JSON.parse(stored); } catch(e) {}
  }
  return DEFAULT_ROOMS;
}

export function saveStoredRooms(rooms) {
  localStorage.setItem(ROOMS_KEY, JSON.stringify(rooms));
  pushCloudUpdate('rooms', rooms);
  saveToFirebaseCloud('rooms', rooms);
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
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
  pushCloudUpdate('bookings', bookings);
  saveToFirebaseCloud('bookings', bookings);
}

export function clearStoredBookings() {
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify([]));
  pushCloudUpdate('bookings', []);
  saveToFirebaseCloud('bookings', []);
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
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  pushCloudUpdate('settings', settings);
  saveToFirebaseCloud('settings', settings);
}

/**
 * Synchronize local storage & IndexedDB with the latest Cloud state.
 * Called when any device loads or receives live cloud broadcast.
 */
export async function syncFromCloudToLocal() {
  try {
    const cloudState = await fetchLatestCloudState();
    if (!cloudState) return null;

    if (cloudState.settings) {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(cloudState.settings));
    }
    if (cloudState.rooms) {
      localStorage.setItem(ROOMS_KEY, JSON.stringify(cloudState.rooms));
    }
    if (cloudState.bookings) {
      localStorage.setItem(BOOKINGS_KEY, JSON.stringify(cloudState.bookings));
    }
    if (cloudState.sectionMedia) {
      try {
        const db = await openDB();
        const transaction = db.transaction(SECTION_MEDIA_STORE, 'readwrite');
        const store = transaction.objectStore(SECTION_MEDIA_STORE);
        Object.entries(cloudState.sectionMedia).forEach(([key, record]) => {
          if (record && record.sectionKey) {
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



