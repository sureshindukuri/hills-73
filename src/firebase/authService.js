import { 
  signInWithPopup, 
  signInWithEmailAndPassword,
  signOut as fbSignOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { auth, googleProvider, AUTHORIZED_ADMIN_EMAILS, db } from './config';
import { doc, getDoc } from 'firebase/firestore';

/**
 * Strictly verify if an email address belongs to authorized owner list
 */
export async function isEmailAuthorized(email) {
  if (!email) return false;
  const cleanEmail = email.toLowerCase().trim();

  // 1. Check local authorized config list
  if (AUTHORIZED_ADMIN_EMAILS.map(e => e.toLowerCase().trim()).includes(cleanEmail)) {
    return true;
  }

  // 2. Check Firestore 'authorized_admins' collection if extra admins were added
  try {
    const adminDoc = await getDoc(doc(db, 'authorized_admins', cleanEmail));
    if (adminDoc.exists() && adminDoc.data()?.active !== false) {
      return true;
    }
  } catch (e) {
    // Ignore firestore lookup error and fall back to strict local check
  }

  return false;
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
  return error?.message || 'Authentication failed. Please verify your credentials in Firebase.';
}

/**
 * Sign in with Firebase Email & Password (strictly checking authorization)
 */
export async function signInWithEmailPass(email, password) {
  try {
    const cleanEmail = (email || '').toLowerCase().trim();
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

    // STRICT OWNER CHECK: Deny any other user
    const authorized = await isEmailAuthorized(userEmail);
    if (!authorized) {
      await fbSignOut(auth);
      sessionStorage.clear();
      return {
        user: null,
        isAuthorized: false,
        error: `Access Denied: The account "${userEmail}" is NOT authorized to access the Admin Panel. Only the official Owner email is permitted.`
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
    const authorized = await isEmailAuthorized(userEmail);
    if (!authorized) {
      // Sign out unauthorized user immediately
      await fbSignOut(auth);
      sessionStorage.clear();
      return {
        user: null,
        isAuthorized: false,
        error: `Access Denied: The Google account "${userEmail}" is NOT authorized. Only the official 73 Hills Owner email (${AUTHORIZED_ADMIN_EMAILS[0]}) has clearance.`
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
 * Listen for auth state changes with strict owner email validation
 */
export function onAdminAuthStateChanged(callback) {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      const email = (user.email || '').toLowerCase().trim();
      const authorized = await isEmailAuthorized(email);
      if (authorized) {
        sessionStorage.setItem('73hills_admin_auth', 'true');
        sessionStorage.setItem('73hills_admin_email', email);
        sessionStorage.setItem('73hills_admin_name', user.displayName || email.split('@')[0]);
        sessionStorage.setItem('73hills_admin_photo', user.photoURL || '');
        callback(user);
      } else {
        // Unknown or unauthorized account: force logout immediately
        try {
          await fbSignOut(auth);
        } catch (e) {}
        sessionStorage.removeItem('73hills_admin_auth');
        sessionStorage.removeItem('73hills_admin_email');
        sessionStorage.removeItem('73hills_admin_name');
        sessionStorage.removeItem('73hills_admin_photo');
        callback(null);
      }
    } else {
      const hasLocalSession = sessionStorage.getItem('73hills_admin_auth') === 'true';
      const localEmail = (sessionStorage.getItem('73hills_admin_email') || '').toLowerCase().trim();
      const authorized = await isEmailAuthorized(localEmail);

      if (hasLocalSession && authorized) {
        callback({
          email: localEmail,
          displayName: sessionStorage.getItem('73hills_admin_name') || 'Owner',
          photoURL: sessionStorage.getItem('73hills_admin_photo') || ''
        });
      } else {
        sessionStorage.clear();
        callback(null);
      }
    }
  });
}


