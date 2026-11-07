import { Platform } from 'react-native';

const developmentApiUrl = Platform.select({
  android: 'http://10.0.2.2:3000',
  ios: 'http://localhost:3000',
  default: 'http://localhost:3000',
});
const googleWebClientId: string =
  '1001729880037-npfs9vmk7vfiqickndvjcr38cirecnpd.apps.googleusercontent.com';

export const appConfig = {
  apiBaseUrl: __DEV__ ? developmentApiUrl ?? 'http://localhost:3000' : 'https://vanirgroup.com',
  firebase: {
    apiKey: 'AIzaSyAszyNw2a7_bv02cf0FBXiPXwt3E2-CXdY',
    authDomain: 'gen-lang-client-0364375301.firebaseapp.com',
    projectId: 'gen-lang-client-0364375301',
    storageBucket: 'gen-lang-client-0364375301.firebasestorage.app',
    messagingSenderId: '1001729880037',
    appId: '1:1001729880037:web:0cf4200a2a48e96547090c',
    measurementId: 'G-5ETHDXPS4L',
    googleWebClientId,
  },
} as const;

export const isGoogleSignInConfigured =
  appConfig.firebase.googleWebClientId !== 'REPLACE_WITH_FIREBASE_WEB_CLIENT_ID';
