import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY?.trim(),
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN?.trim(),
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID?.trim(),
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET?.trim(),
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID?.trim(),
  appId: process.env.REACT_APP_FIREBASE_APP_ID?.trim(),
};

const firebaseEnvReady = [
  firebaseConfig.apiKey,
  firebaseConfig.authDomain,
  firebaseConfig.projectId,
  firebaseConfig.storageBucket,
  firebaseConfig.messagingSenderId,
  firebaseConfig.appId,
].every(Boolean);

let firebaseApp = null;
let firebaseAuth = null;
let firebaseInitError = null;

if (firebaseEnvReady) {
  try {
    firebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
    firebaseAuth = getAuth(firebaseApp);
    setPersistence(firebaseAuth, browserLocalPersistence).catch((error) => {
      console.warn('Could not set Firebase persistence:', error?.message || error);
    });
  } catch (error) {
    firebaseInitError = error;
    console.error('Firebase initialization failed:', error);
  }
} else {
  firebaseInitError = new Error(
    'Missing Firebase configuration. Fill REACT_APP_FIREBASE_* values in frontend/.env or frontend/.env.development.'
  );
  if (process.env.NODE_ENV !== 'production') {
    console.warn('Firebase initialization skipped because required Firebase environment variables are missing.');
    console.debug('Firebase env loaded:', {
      apiKey: Boolean(firebaseConfig.apiKey),
      authDomain: Boolean(firebaseConfig.authDomain),
      projectId: Boolean(firebaseConfig.projectId),
      storageBucket: Boolean(firebaseConfig.storageBucket),
      messagingSenderId: Boolean(firebaseConfig.messagingSenderId),
      appId: Boolean(firebaseConfig.appId),
    });
  }
}

const googleAuthProvider = new GoogleAuthProvider();
googleAuthProvider.setCustomParameters({ prompt: 'select_account' });

export { firebaseAuth, googleAuthProvider, firebaseInitError, firebaseConfig };

