import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

/**
 * Firebase Configuration for 73 Hills Resort & Real Estate
 * Paste your Firebase Project Credentials below or pass them via environment variables.
 */
export const firebaseConfig = {
  apiKey: "AIzaSyBdZtdXdtFMvXagVohjOEtC7Zc9mmtZjtk",
  authDomain: "hill-c5066.firebaseapp.com",
  projectId: "hill-c5066",
  storageBucket: "hill-c5066.firebasestorage.app",
  messagingSenderId: "640249066143",
  appId: "1:640249066143:web:6d4658499aa286b72428aa",
  measurementId: "G-J6265T8YMM"
};

// Initialize Firebase safely
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const db = getFirestore(app);
export const storage = getStorage(app);

/**
 * List of Authorized Owner & Admin Email Addresses.
 * Only Google accounts or Firebase Auth users with these emails will be allowed into the Admin Panel.
 * Any other Google account will be automatically rejected, signed out, and denied access.
 */
export const AUTHORIZED_ADMIN_EMAILS = [
  'sureshindukuri02@gmail.com'
];

