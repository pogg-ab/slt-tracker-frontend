// public/firebase-messaging-sw.js

// Import the v8 compatibility scripts. This is very reliable.
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');

// THIS IS THE MOST IMPORTANT PART
// It ensures the service worker knows EXACTLY which Firebase project it belongs to.
const firebaseConfig = {
  apiKey: "AIzaSyCYU310eBEYNR5YnzuZHVNuOuR6f8tEI-0",
  authDomain: "slt-tracker-app.firebaseapp.com",
  projectId: "slt-tracker-app",
  storageBucket: "slt-tracker-app.firebasestorage.app",
  messagingSenderId: "241433869778",
  appId: "1:241433869778:web:f21850c900e71a03589c0b",
  measurementId: "G-6J09LJGX4G"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage(function(payload) {
    console.log('[firebase-messaging-sw.js] Received background message: ', payload);
    
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/logo.png'
    };

    return self.registration.showNotification(notificationTitle, notificationOptions);
});