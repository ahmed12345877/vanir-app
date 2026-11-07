import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { appConfig, isGoogleSignInConfigured } from '../config/appConfig';
import { postJson } from './api';

let googleConfigured = false;

function configureGoogleSignin() {
  if (googleConfigured) {
    return;
  }

  if (!isGoogleSignInConfigured) {
    return;
  }

  GoogleSignin.configure({
    webClientId: appConfig.firebase.googleWebClientId,
    offlineAccess: false,
  });

  googleConfigured = true;
}

async function syncServerSession(user: FirebaseAuthTypes.User) {
  try {
    const idToken = await user.getIdToken();
    await postJson('/api/auth/user-login', { idToken });
  } catch {
    // Pure client Firebase Auth mode: server sync is non-blocking
  }
}

export const firebaseProjectConfig = appConfig.firebase;

export const firebaseAuth = auth;

export async function signInWithEmail(email: string, password: string) {
  const cleanEmail = email.trim().toLowerCase();
  try {
    const credential = await auth().signInWithEmailAndPassword(cleanEmail, password);
    await syncServerSession(credential.user);
    return credential.user;
  } catch (err: any) {
    // If the account doesn't exist yet on Firebase, seamlessly create and authenticate it
    if (
      err.code === 'auth/user-not-found' ||
      err.code === 'auth/invalid-credential'
    ) {
      try {
        const createCred = await auth().createUserWithEmailAndPassword(cleanEmail, password);
        await syncServerSession(createCred.user);
        return createCred.user;
      } catch {
        // If creation fails (e.g. weak password), rethrow original error
        throw err;
      }
    }
    throw err;
  }
}

export async function signUpWithEmail(
  email: string,
  password: string,
  displayName?: string,
) {
  const cleanEmail = email.trim().toLowerCase();
  const credential = await auth().createUserWithEmailAndPassword(cleanEmail, password);

  if (displayName?.trim()) {
    await credential.user.updateProfile({ displayName: displayName.trim() });
  }

  await syncServerSession(credential.user);
  return credential.user;
}

export async function signInWithGoogle() {
  configureGoogleSignin();
  await GoogleSignin.hasPlayServices();
  const result = (await GoogleSignin.signIn()) as { data?: { idToken?: string }; idToken?: string };
  const idToken = result.data?.idToken ?? result.idToken;

  if (!idToken) {
    throw new Error('Google Sign-In failed to obtain ID Token from Google Play Services.');
  }

  const googleCredential = auth.GoogleAuthProvider.credential(idToken);
  const credential = await auth().signInWithCredential(googleCredential);
  await syncServerSession(credential.user);
  return credential.user;
}

export async function signInWithFacebook() {
  const provider = new auth.OAuthProvider('facebook.com');
  provider.addScope('email');
  provider.addScope('public_profile');

  const credential = await auth().signInWithProvider(provider);
  await syncServerSession(credential.user);
  return credential.user;
}

export async function restoreServerSession(user: FirebaseAuthTypes.User) {
  await syncServerSession(user);
}

export async function signOutEverywhere() {
  await GoogleSignin.signOut().catch(() => undefined);
  await auth().signOut();
}
