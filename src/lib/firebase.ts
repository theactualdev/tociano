import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, updateDoc, deleteDoc, getDocs, query, where } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Helper functions for Firestore operations
export const updateUserSettings = async (userId: string, settings: any) => {
  const userSettingsRef = doc(db, 'users', userId, 'settings', 'preferences');
  await setDoc(userSettingsRef, settings, { merge: true });
};

export const getUserSettings = async (userId: string) => {
  const userSettingsRef = doc(db, 'users', userId, 'settings', 'preferences');
  const settingsDoc = await getDocs(query(collection(db, 'users', userId, 'settings')));
  return settingsDoc.docs[0]?.data() || {};
};

export { app, auth, db, storage };