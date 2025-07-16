// src/components/common/NotificationHandler.jsx
import React, { useEffect } from 'react';
import { requestForToken, onMessageListener } from '../../firebase';
import { registerDevice } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const NotificationHandler = () => {
    const { user } = useAuth(); // Get the logged-in user

    // This useEffect handles the main logic of getting and saving the token.
    useEffect(() => {
        const setupNotifications = async () => {
            // Don't do anything if there is no logged-in user.
            if (!user) {
                return;
            }

            console.log("Attempting to activate notifications for user:", user.name);

            try {
                // Case 1: Permission is already granted.
                if (Notification.permission === 'granted') {
                    console.log('Permission already granted. Requesting FCM token...');
                    const fcmToken = await requestForToken();
                    
                    if (fcmToken) {
                        console.log('FCM Token received on frontend:', fcmToken);
                        try {
                            console.log('Sending this token to the backend...');
                            await registerDevice({ fcm_token: fcmToken });
                            console.log('✅ SUCCESS: Device token has been successfully registered with the backend.');
                        } catch (backendError) {
                            console.error('❌ BACKEND ERROR: Failed to register device token with the backend.', backendError.response?.data || backendError.message);
                        }
                    } else {
                        console.warn('Warning: Notification permission is granted, but no FCM token was received from Firebase.');
                    }
                
                // Case 2: Permission has not been granted or denied yet.
                } else if (Notification.permission !== 'denied') {
                    console.log('Requesting user permission for notifications...');
                    // This will trigger the browser's pop-up.
                    const permission = await Notification.requestPermission();
                    
                    if (permission === 'granted') {
                        console.log('Permission newly granted by user. Requesting FCM token...');
                        const fcmToken = await requestForToken();
                        if (fcmToken) {
                            console.log('FCM Token received on frontend:', fcmToken);
                            try {
                                console.log('Sending this token to the backend...');
                                await registerDevice({ fcm_token: fcmToken });
                                console.log('✅ SUCCESS: New device token has been registered with the backend.');
                            } catch (backendError) {
                                console.error('❌ BACKEND ERROR: Failed to register new device token.', backendError.response?.data || backendError.message);
                            }
                        }
                    } else {
                        console.log('User denied notification permission.');
                    }
                }
                // Case 3: Permission was previously denied. We don't do anything.
                else {
                    console.log("Notification permission was previously denied. Doing nothing.");
                }

            } catch (error) {
                console.error('❌ A top-level error occurred during notification setup:', error);
            }
        };

        setupNotifications();
    }, [user]); // The dependency array ensures this runs only when the user logs in/out.


    // This useEffect sets up the listener for messages that arrive while the app is in the foreground.
    useEffect(() => {
        onMessageListener()
            .then(payload => {
                console.log('Foreground message received:', payload);
                // Display a browser notification
                new Notification(payload.notification.title, {
                    body: payload.notification.body,
                    icon: '/logo.png',
                });
            })
            .catch(err => console.error('Failed to set up foreground message listener:', err));
    }, []);

    // This component renders no visible UI.
    return null;
};

export default NotificationHandler;