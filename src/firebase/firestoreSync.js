import { db } from './config';
import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';

const RESORT_DOC_REF = 'resort_content';
const MAIN_STATE_DOC = 'live_state';

/**
 * Save data to Firestore and sync across all customer devices in real-time
 * @param {string} sectionKey - 'settings' | 'rooms' | 'sectionMedia' | 'gallery' | 'bookings'
 * @param {any} data
 */
export async function saveToFirebaseCloud(sectionKey, data) {
  try {
    const docRef = doc(db, RESORT_DOC_REF, MAIN_STATE_DOC);
    await setDoc(docRef, {
      [sectionKey]: data,
      lastUpdated: Date.now()
    }, { merge: true });
    return true;
  } catch (error) {
    console.warn('[Firebase] Firestore save error (falling back to local/cloudSync):', error.message);
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
    console.warn('[Firebase] Firestore fetch error:', error.message);
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
      console.warn('[Firebase] Snapshot listener error:', error.message);
    });
  } catch (e) {
    console.warn('[Firebase] Failed to subscribe to Firestore:', e);
    return () => {};
  }
}
