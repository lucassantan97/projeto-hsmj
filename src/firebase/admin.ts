import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
// This ensures that the SDK is initialized only once.
if (!admin.apps.length) {
  try {
    // The service account credentials are provided via environment variables.
    // This is a secure way to handle credentials on the server.
    const serviceAccount: admin.ServiceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      // The private key needs to have its newlines properly escaped in the .env file.
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (error: any) {
    console.error('Firebase admin initialization error', error.stack);
  }
}

// Export the initialized Firestore instance for use in server-side functions (e.g., API routes).
export const adminDb = admin.firestore();
