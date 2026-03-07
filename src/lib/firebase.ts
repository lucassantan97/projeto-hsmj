import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyCw5jukXxEWXi8Oe6bm0LKisBWqUwCSzrk',
  authDomain: 'studio-2573154388-af57e.firebaseapp.com',
  projectId: 'studio-2573154388-af57e',
  storageBucket: 'studio-2573154388-af57e.firebasestorage.app',
  messagingSenderId: '668721844660',
  appId: '1:668721844660:web:e7340b697a1ec839ee22e1',
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app);