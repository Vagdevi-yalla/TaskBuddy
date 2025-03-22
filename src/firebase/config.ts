import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, logEvent } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyBUMu2-SzcUBhxoB35mmIydWZXIua2XgnM",
  authDomain: "task-buddy-5961b.firebaseapp.com",
  projectId: "task-buddy-5961b",
  storageBucket: "task-buddy-5961b.firebasestorage.app",
  messagingSenderId: "1059418534423",
  appId: "1:1059418534423:web:3d7133c2770f5ed0fee252",
  measurementId: "G-7Z9B75YP1S"
}

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

// Analytics helper function
export const logAnalyticsEvent = (eventName: string, eventParams?: Record<string, any>) => {
  try {
    logEvent(analytics, eventName, eventParams);
  } catch (error) {
    console.error('Analytics error:', error);
  }
};