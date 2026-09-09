import { signInWithPopup, signOut as fbSignOut, onAuthStateChanged } from 'firebase/auth';
import { auth, googleProvider, AUTHORIZED_ADMIN_EMAILS, db } from './config';
import { doc, getDoc } from 'firebase/firestore';

/**
 * Sign In With Google & Verify Owner Authorization
 * Returns { user, isAuthorized, error }
 */
export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    const userEmail = (user.email || '').toLowerCase().trim();

    // Check if authorized in local list or firestore admin collection
    let isAuthorized = AUTHORIZED_ADMIN_EMAILS.map(e => e.toLowerCase().trim()).includes(userEmail);

    // Also check Firestore 'admins' collection if configured
    if (!isAuthorized) {
      try {
        const adminDoc = await getDoc(doc(db, 'authorized_admins', userEmail));
        if (adminDoc.exists()) {
          isAuthorized = true;
        }
      } catch (e) {
        // Firestore rules or offline fallback
      }
    }

    if (!isAuthorized) {
      // Sign out unauthorized user immediately
      await fbSignOut(auth);
      return {
        user: null,
        isAuthorized: false,
        error: `Access Denied: The Google account "${userEmail}" is not authorized as an Owner/Admin of 73 Hills.`
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
      error: error.message || 'Google Sign-In failed. Please try again.'
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
      const email = (user.email || '').toLowerCase().trim();
      const isAuth = AUTHORIZED_ADMIN_EMAILS.map(e => e.toLowerCase().trim()).includes(email) || 
                     sessionStorage.getItem('73hills_admin_auth') === 'true';
      callback(isAuth ? user : null);
    } else {
      callback(null);
    }
  });
}
