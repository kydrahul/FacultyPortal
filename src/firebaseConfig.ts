// src/firebaseConfig.ts

// Import Firebase core + services you'll use
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Read Firebase configuration from Vite env (VITE_FIREBASE_*)
// Fallback to hardcoded values for deployment (these are public anyway)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyD1TQ3HK2jRy73WizJsK6AXScQshslHvss",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "iiitnr-attendence-app-f604e.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "iiitnr-attendence-app-f604e",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "iiitnr-attendence-app-f604e.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "790561423093",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:790561423093:web:5127a765b55b8870970fbc",
};

// Basic sanity check - log warning instead of throwing error
if (
  !firebaseConfig.apiKey ||
  !firebaseConfig.authDomain ||
  !firebaseConfig.projectId
) {
  console.warn(
    "Some Firebase env vars are missing. The app may not function correctly. Check .env file."
  );
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
