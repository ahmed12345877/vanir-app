import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { auth, hasFirebaseConfig } from './firebase';

function requireAuth() {
  if (!hasFirebaseConfig || !auth) {
    throw new Error('Firebase auth is not configured for this environment.');
  }

  return auth;
}

export async function signIn(email: string, password: string): Promise<User> {
  const credential = await signInWithEmailAndPassword(requireAuth(), email, password);
  return credential.user;
}

export async function signInGoogle(): Promise<User> {
  const provider = new GoogleAuthProvider();
  const credential = await signInWithPopup(requireAuth(), provider);
  return credential.user;
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(requireAuth());
}

export function onAuthChanged(callback: (user: User | null) => void) {
  if (!hasFirebaseConfig || !auth) {
    callback(null);
    return () => undefined;
  }

  return onAuthStateChanged(auth, callback);
}

export { auth, hasFirebaseConfig };
