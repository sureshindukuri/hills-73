import { 
  signInWithPopup, 
  signInWithEmailAndPassword,
  signOut as fbSignOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { auth, googleProvider, AUTHORIZED_ADMIN_EMAILS, db } from './config';
import { doc, getDoc } from 'firebase/firestore';

/**
 * Format Firebase Auth errors into clear human messages
 */
function getReadableAuthError(error) {
  const code = error?.code || '';
  if (code === 'auth/user-not-found' || code === 'auth/invalid-credential' || code === 'auth/invalid-login-credentials') {
    return 'Invalid email or password. Only registered admin users in Firebase have access.';
  }
  if (code === 'auth/wrong-password') {
    return 'Incorrect password. Please verify and try again.';
  }
  if (code === 'auth/invalid-email') {
    return 'Please enter a valid email address format.';
  }
  if (code === 'auth/user-disabled') {
    return 'This admin account has been disabled in Firebase Console.';
  }
  if (code === 'auth/too-many-requests') {
    return 'Access temporarily blocked due to multiple failed attempts. Please try again in a few minutes.';
  }
  if (code === 'auth/popup-closed-by-user') {
    return 'Google Sign-In was cancelled.';
  }
  return error?.message || 'Authentication failed. Please verify your credentials in Firebase.';
}

/**
 * Sign in with Firebase Email & Password (added in Firebase Auth Console)
 */
export async function signInWithEmailPass(email, password) {
  try {
    const cleanEmail = (email || '').trim();
    if (!cleanEmail || !password) {
      return {
        user: null,
        isAuthorized: false,
        error: 'Please enter both your Firebase admin email and password.'
      };
    }

    // Authenticate directly with Firebase Authentication
    const result = await signInWithEmailAndPassword(auth, cleanEmail, password);
    const user = result.user;
    const userEmail = (user.email || '').toLowerCase().trim();

    // Save authorized session
    sessionStorage.setItem('73hills_admin_auth', 'true');
    sessionStorage.setItem('73hills_admin_email', userEmail);
    sessionStorage.setItem('73hills_admin_name', user.displayName || userEmail.split('@')[0]);
    sessionStorage.setItem('73hills_admin_photo', user.photoURL || '');

    return {
      user,
      isAuthorized: true,
      error: null
    };
  } catch (error) {
    console.error('Firebase Email/Password Sign-In Error:', error);
    return {
      user: null,
      isAuthorized: false,
      error: getReadableAuthError(error)
    };
  }
}

/**
 * Sign In With Google & Verify Owner Authorization
 * Returns { user, isAuthorized, error }
 */
export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    const userEmail = (user.email || '').toLowerCase().trim();

    // Check if authorized in local list, firestore doc, or authenticated in Firebase
    let isAuthorized = true;
    if (AUTHORIZED_ADMIN_EMAILS && AUTHORIZED_ADMIN_EMAILS.length > 0) {
      const isListed = AUTHORIZED_ADMIN_EMAILS.map(e => e.toLowerCase().trim()).includes(userEmail);
      if (!isListed) {
        try {
          const adminDoc = await getDoc(doc(db, 'authorized_admins', userEmail));
          if (!adminDoc.exists()) {
            isAuthorized = false;
          }
        } catch (e) {
          // If firestore rule check fails and not in local list, enforce restriction
          isAuthorized = false;
        }
      }
    }

    if (!isAuthorized) {
      // Sign out unauthorized user immediately
      await fbSignOut(auth);
      return {
        user: null,
        isAuthorized: false,
        error: `Access Denied: The Google account "${userEmail}" is not recognized as an authorized Admin. Only users registered in Firebase Authentication or the Admin list have access.`
      };
    }

    // Save authorized session
    sessionStorage.setItem('73hills_admin_auth', 'true');
    sessionStorage.setItem('73hills_admin_email', userEmail);
    sessionStorage.setItem('73hills_admin_name', user.displayName || 'Owner');
    sessionStorage.setItem('73hills_admin_photo', user.photoURL || '');

    return {
      user,
      isAuthorized: true,
      error: null
    };
  } catch (error) {
    console.error('Google Sign-In Error:', error);
    return {
      user: null,
      isAuthorized: false,
      error: getReadableAuthError(error)
    };
  }
}

/**
 * Sign Out
 */
export async function logOutAdmin() {
  try {
    await fbSignOut(auth);
  } catch (e) {}
  sessionStorage.removeItem('73hills_admin_auth');
  sessionStorage.removeItem('73hills_admin_email');
  sessionStorage.removeItem('73hills_admin_name');
  sessionStorage.removeItem('73hills_admin_photo');
}

/**
 * Listen for auth state changes
 */
export function onAdminAuthStateChanged(callback) {
  return onAuthStateChanged(auth, (user) => {
    if (user) {
      callback(user);
    } else {
      const hasLocalSession = sessionStorage.getItem('73hills_admin_auth') === 'true';
      if (hasLocalSession) {
        callback({
          email: sessionStorage.getItem('73hills_admin_email') || 'admin@73hills.com',
          displayName: sessionStorage.getItem('73hills_admin_name') || 'Owner',
          photoURL: sessionStorage.getItem('73hills_admin_photo') || ''
        });
      } else {
        callback(null);
      }
    }
  });
}

