import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

/**
 * Firebase Configuration for 73 Hills Resort & Real Estate
 * Paste your Firebase Project Credentials below or pass them via environment variables.
 */
export const firebaseConfig = {
  apiKey: "AIzaSyCwjcsr6NVrWWZw0NWeU9KKdA924gc24O8",
  authDomain: "hills73-9ed52.firebaseapp.com",
  projectId: "hills73-9ed52",
  storageBucket: "hills73-9ed52.firebasestorage.app",
  messagingSenderId: "340098624726",
  appId: "1:340098624726:web:a9efdb31ec693ccf26ad77",
  measurementId: "G-1D9N3FLF4N"
};

// Initialize Firebase safely
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const db = getFirestore(app);

/**
 * List of Authorized Owner & Admin Email Addresses.
 * Only Google accounts or Firebase Auth users with these emails will be allowed into the Admin Panel.
 * Any other Google account will be automatically rejected, signed out, and denied access.
 */
export const AUTHORIZED_ADMIN_EMAILS = [
  'sureshindukuri02@gmail.com'
];

