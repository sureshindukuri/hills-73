import { 
  signInWithPopup, 
  signInWithEmailAndPassword,
  signOut as fbSignOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { auth, googleProvider, AUTHORIZED_ADMIN_EMAILS } from './config';

export const OWNER_EMAIL = 'sureshindukuri02@gmail.com';

/**
 * Strictly verify if an email address belongs to the authorized owner.
 * Synchronous and instant - impossible for unauthorized users to slip through.
 */
export function isEmailAuthorized(email) {
  if (!email || typeof email !== 'string') return false;
  const cleanEmail = email.toLowerCase().trim();
  return cleanEmail === OWNER_EMAIL.toLowerCase().trim() || 
         AUTHORIZED_ADMIN_EMAILS.map(e => e.toLowerCase().trim()).includes(cleanEmail);
}

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
  return error?.message || 'Authentication failed. Please verify your credentials.';
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
 * Sign in with Firebase Email & Password (strictly owner only)
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

    // Pre-flight check: Deny unauthorized email immediately before network call
    if (!isEmailAuthorized(cleanEmail)) {
      clearAdminSession();
      return {
        user: null,
        isAuthorized: false,
        error: `ACCESS DENIED: The email "${cleanEmail}" is not authorized. Only registered administrators can access this portal.`
      };
    }

    // Authenticate directly with Firebase Authentication
    const result = await signInWithEmailAndPassword(auth, cleanEmail, password);
    const user = result.user;
    const userEmail = (user.email || '').toLowerCase().trim();

    // Post-flight check
    if (!isEmailAuthorized(userEmail)) {
      await fbSignOut(auth);
      clearAdminSession();
      return {
        user: null,
        isAuthorized: false,
        error: 'ACCESS DENIED: This account does not have administrative privileges.'
      };
    }

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
 * Sign In With Google & Verify Strict Owner Authorization
 * Returns { user, isAuthorized, error }
 */
export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    const userEmail = (user.email || '').toLowerCase().trim();

    // STRICT OWNER CHECK: Deny any other Google account immediately
    if (!isEmailAuthorized(userEmail)) {
      // Sign out unauthorized user from Firebase immediately
      await fbSignOut(auth);
      clearAdminSession();
      return {
        user: null,
        isAuthorized: false,
        error: `ACCESS DENIED: "${userEmail}" is NOT authorized. Only the official 73 Hills Owner (${OWNER_EMAIL}) has access to the Admin Panel.`
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
 * Listen for auth state changes with strict owner email validation
 */
export function onAdminAuthStateChanged(callback) {
  return onAuthStateChanged(auth, (user) => {
    if (user) {
      const email = (user.email || '').toLowerCase().trim();
      if (isEmailAuthorized(email)) {
        sessionStorage.setItem('73hills_admin_auth', 'true');
        sessionStorage.setItem('73hills_admin_email', email);
        sessionStorage.setItem('73hills_admin_name', user.displayName || email.split('@')[0]);
        sessionStorage.setItem('73hills_admin_photo', user.photoURL || '');
        callback(user);
      } else {
        // Unknown or unauthorized account: force signout immediately
        fbSignOut(auth).catch(() => {});
        clearAdminSession();
        callback(null);
      }
    } else {
      const hasLocalSession = sessionStorage.getItem('73hills_admin_auth') === 'true';
      const localEmail = (sessionStorage.getItem('73hills_admin_email') || '').toLowerCase().trim();

      if (hasLocalSession && isEmailAuthorized(localEmail)) {
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



