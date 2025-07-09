// src/firebase-client.js

import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";

// Your web app's Firebase configuration from your screenshot
const firebaseConfig = {
  apiKey: "AIzaSyCYU310eBEYNR5YnzuZHVNuOuR6f8tEI-0",
  authDomain: "slt-tracker-app.firebaseapp.com",
  projectId: "slt-tracker-app",
  storageBucket: "slt-tracker-app.firebasestorage.app",
  messagingSenderId: "241433869778",
  appId: "1:241433869778:web:80413d4fd3d7bf60589c0b",
  measurementId: "G-J8J73WG2GM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export const requestForToken = async () => {
  try {
    // =============================================================================
    // === PASTE YOUR VAPID KEY FROM THE CLOUD MESSAGING SETTINGS HERE ===
    // =============================================================================
    const vapidKey = "BErggY4DiUDbhIVdcw1Zsn1LOgZ_pRlMmTCUOYVFkKWYAtY6udweVNR3RyRCpa3bFNp8y_PzzoKYF-hy_POznn8"; // <-- PASTE YOURS HERE
    // =============================================================================

    console.log("Requesting notification permission...");
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
        console.log("Notification permission granted.");
        const currentToken = await getToken(messaging, { vapidKey: vapidKey });
        if (currentToken) {
          console.log('FCM registration token received:', currentToken);
          return currentToken;
        } else {
          console.log('No registration token available. It is generally generated after granting permission.');
          return null;
        }
    } else {
        console.warn("Notification permission denied.");
        return null;
    }
  } catch (err) {
    console.error('An error occurred while retrieving token. ', err);
    return null;
  }
};