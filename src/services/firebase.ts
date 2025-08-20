import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Check if Firebase config is properly set
const isFirebaseConfigured = Object.values(firebaseConfig).every(value => 
  value && 
  value !== 'undefined' && 
  !value.includes('your_') && 
  !value.includes('demo-') &&
  !value.includes('_here') &&
  value.trim() !== ''
);

let app: any = null;
let auth: any = null;

if (isFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
  } catch (error) {
    console.warn('Firebase initialization failed:', error);
  }
}

export { app, auth };

export const loginWithEmail = async (email: string, password: string) => {
  if (!auth) {
    throw new Error('Firebase is not configured. Please set up your Firebase environment variables.');
  }
  
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const registerWithEmail = async (email: string, password: string) => {
  if (!auth) {
    throw new Error('Firebase is not configured. Please set up your Firebase environment variables.');
  }
  
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const logout = async () => {
  if (!auth) {
    throw new Error('Firebase is not configured. Please set up your Firebase environment variables.');
  }
  
  try {
    await signOut(auth);
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const onAuthStateChange = (callback: (user: FirebaseUser | null) => void) => {
  if (!auth) {
    // If Firebase is not configured, call callback with null user
    callback(null);
    return () => {}; // Return empty unsubscribe function
  }
  
  return onAuthStateChanged(auth, callback);
};