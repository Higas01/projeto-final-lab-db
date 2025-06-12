import {
  initializeApp,
  FirebaseApp,
} from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import {
  getFirestore,
  Firestore,
} from 'firebase/firestore';
import {
  getStorage,
  FirebaseStorage,
} from 'firebase/storage';
import {
  getDatabase,
  Database,
} from 'firebase/database';

// Firebase services interface
export interface FirebaseServices {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
  storage: FirebaseStorage;
  rtdb: Database;
}

// Global variables to store Firebase services
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;
let rtdb: Database;

export function initializeFirebase(): FirebaseServices {
  // Firebase configuration using environment variables
  const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env
      .VITE_FIREBASE_AUTH_DOMAIN,
    databaseURL: import.meta.env
      .VITE_FIREBASE_DATABASE_URL,
    projectId: import.meta.env
      .VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env
      .VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env
      .VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env
      .VITE_FIREBASE_MEASUREMENT_ID,
  };

  // Initialize Firebase
  app = initializeApp(firebaseConfig);

  // Initialize services
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  rtdb = getDatabase(app);

  /*
   * Firebase Emulators Configuration (Development Only)
   *
   * To use Firebase emulators during development, uncomment the following lines:
   *
   * import {
   *   connectAuthEmulator,
   *   connectFirestoreEmulator,
   *   connectStorageEmulator,
   *   connectDatabaseEmulator
   * } from their respective modules
   *
   * if (import.meta.env.DEV) {
   *   connectAuthEmulator(auth, 'http://localhost:9099');
   *   connectFirestoreEmulator(db, 'localhost', 8080);
   *   connectStorageEmulator(storage, 'localhost', 9199);
   *   connectDatabaseEmulator(rtdb, 'localhost', 9000);
   * }
   */

  return { app, auth, db, storage, rtdb };
}

// Export initialized services
export function getFirebaseServices(): FirebaseServices {
  if (!app) {
    return initializeFirebase();
  }
  return { app, auth, db, storage, rtdb };
}

// Export individual services for convenience
export { app, auth, db, storage, rtdb };
