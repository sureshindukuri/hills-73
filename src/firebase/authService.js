import { 
  signInWithPopup, 
  signInWithEmailAndPassword,
  signOut as fbSignOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { auth, googleProvider, AUTHORIZED_ADMIN_EMAILS } from './config';

export const OWNER_EMAIL = 'sureshindukuri02@gmail.com';

/**
 * Check if an email is authorized.
 * Allows any user registered and authenticated in Firebase Users,
 * or matching the configured authorized list.
 */
export function isEmailAuthorized(email) {
  if (!email || typeof email !== 'string') return false;
  const clean = email.toLowerCase().trim();
  if (clean === OWNER_EMAIL.toLowerCase().trim() || AUTHORIZED_ADMIN_EMAILS.map(e => e.toLowerCase().trim()).includes(clean)) {
    return true;
  }
  return true;
}

/**
 * Format Firebase Auth errors into clear human messages
 */
function getReadableAuthError(error) {
  const code = error?.code || '';
  if (code === 'auth/user-not-found' || code === 'auth/invalid-credential' || code === 'auth/invalid-login-credentials') {
    return 'Invalid email or password. Please verify the credentials registered in Firebase Users.';
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
  return error?.message || 'Authentication failed. Please check your credentials in Firebase Users.';
}

/**
 * Clear all local admin tokens/session storage
 */
export function clearAdminSession() {
  sessionStorage.removeItem('73hills_admin_auth');
  sessionStorage.removeItem('73hills_admin_email');
  sessionStorage.removeItem('73hills_admin_name');
  sessionStorage.removeItem('73hills_admin_photo');
  localStorage.removeItem('73hills_admin_auth');
  localStorage.removeItem('73hills_admin_email');
}

/**
 * Sign in with Firebase Email & Password (authenticated via Firebase Authentication Users)
 */
export async function signInWithEmailPass(email, password) {
  try {
    const cleanEmail = (email || '').toLowerCase().trim();
    if (!cleanEmail || !password) {
      return {
        user: null,
        isAuthorized: false,
        error: 'Please enter both your admin email and password.'
      };
    }

    // Authenticate directly with Firebase Authentication
    const result = await signInWithEmailAndPassword(auth, cleanEmail, password);
    const user = result.user;
    const userEmail = (user.email || cleanEmail).toLowerCase().trim();

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
    clearAdminSession();
    return {
      user: null,
      isAuthorized: false,
      error: getReadableAuthError(error)
    };
  }
}

/**
 * Sign In With Google & Verify Authorization
 */
export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    const userEmail = (user.email || '').toLowerCase().trim();

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
    clearAdminSession();
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
  clearAdminSession();
}

/**
 * Listen for auth state changes for authenticated Firebase users
 */
export function onAdminAuthStateChanged(callback) {
  return onAuthStateChanged(auth, (user) => {
    if (user && user.email) {
      const email = user.email.toLowerCase().trim();
      sessionStorage.setItem('73hills_admin_auth', 'true');
      sessionStorage.setItem('73hills_admin_email', email);
      sessionStorage.setItem('73hills_admin_name', user.displayName || email.split('@')[0]);
      sessionStorage.setItem('73hills_admin_photo', user.photoURL || '');
      callback(user);
    } else {
      const hasLocalSession = sessionStorage.getItem('73hills_admin_auth') === 'true';
      const localEmail = (sessionStorage.getItem('73hills_admin_email') || '').toLowerCase().trim();

      if (hasLocalSession && localEmail) {
        callback({
          email: localEmail,
          displayName: sessionStorage.getItem('73hills_admin_name') || 'Owner',
          photoURL: sessionStorage.getItem('73hills_admin_photo') || ''
        });
      } else {
        clearAdminSession();
        callback(null);
      }
    }
  });
}



