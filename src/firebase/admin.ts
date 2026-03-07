import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

if (!projectId) {
  throw new Error('FIREBASE_PROJECT_ID não definida');
}

if (!clientEmail) {
  throw new Error('FIREBASE_ADMIN_CLIENT_EMAIL não definida');
}

if (!privateKey) {
  throw new Error('FIREBASE_ADMIN_PRIVATE_KEY não definida');
}

const app =
  getApps().length > 0
    ? getApps()[0]
    : initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });

export const adminDb = getFirestore(app);