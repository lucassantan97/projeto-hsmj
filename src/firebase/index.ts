'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase() {
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  return getSdks(app);
}

export function getSdks(FirebaseApp) {
  const firestore = getFirestore(FirebaseApp);
  const auth = getAuth(FirebaseApp);
  return { firebaseApp: FirebaseApp, auth, firestore };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';