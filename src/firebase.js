// src/firebase.js

// Import all necessary functions from the Firebase SDK
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics"; // <-- THE MISSING IMPORT
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// --- YOUR UNIQUE FIREBASE CONFIGURATION ---
const firebaseConfig = {
  apiKey: "AIzaSyCYU310eBEYNR5YnzuZHVNuOuR6f8tEI-0",
  authDomain: "slt-tracker-app.firebaseapp.com",
  projectId: "slt-tracker-app",
  storageBucket: "slt-tracker-app.appspot.com", // I corrected this from your previous version
  messagingSenderId: "241433869778",
  appId: "1:241433869778:web:f21850c900e71a03589c0b",
  measurementId: "G-6J09LJGX4G"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Initialize Analytics (optional, but good to have if you need it later)
const analytics = getAnalytics(app);


/**
 * Requests permission to receive push notifications and returns the device token.
 * @returns {Promise<string|null>} A promise that resolves to the FCM token, or null if permission is denied.
 */
export const requestForToken = async () => {
  try {
    // You have correctly placed your VAPID key here
    const VAPID_KEY = 'BDiqPgjwLRlbHKlKH3XuF8H9eThzwNhCjSVEJQQ1KdwKh2mkDROZXpJL37lWcyl4cq1jfYim68C5vkAQMfsEvhU';

    const currentToken = await getToken(messaging, { 
      vapidKey: VAPID_KEY 
    });

    if (currentToken) {
      console.log('FCM token received successfully:', currentToken);
      return currentToken;
    } else {
      console.log('No registration token available. Requesting permission...');
      return null;
    }
  } catch (err) {
    console.error('An error occurred while retrieving token.', err);
    return null;
  }
};

/**
 * Sets up a listener for messages that arrive while the app is in the foreground.
 * @returns {Promise<object>} A promise that resolves with the incoming message payload.
 */
export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      console.log('Foreground message received. ', payload);
      resolve(payload);
    });
  });