import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

/**
 * Firebase Configuration for 73 Hills Resort & Real Estate
 * Paste your Firebase Project Credentials below or pass them via environment variables.
 */
export const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyYOUR_API_KEY_HERE",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "hills-73.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "hills-73",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "hills-73.appspot.com",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:123456789012:web:abcdef1234567890"
};

// Initialize Firebase safely
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const db = getFirestore(app);

/**
 * List of Authorized Owner & Admin Email Addresses.
 * Only Google accounts with these emails will be allowed into the Admin Panel.
 * Any other Google account will be automatically rejected and denied access.
 */
export const AUTHORIZED_ADMIN_EMAILS = [
  'ajayg@example.com', // Replace with your exact owner email
  'sureshindukuri@gmail.com',
  '73hillsresort@gmail.com',
  'hello@73hills.com'
];
