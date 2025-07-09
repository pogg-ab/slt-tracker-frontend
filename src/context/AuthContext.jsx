// src/context/AuthContext.jsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { loginUser, getMyProfile, registerDevice } from '../services/api'; // 1. Import registerDevice
import { requestForToken } from '../firebase-client'; // 2. Import the token request function

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchAndSetUser = async () => {
        try {
            const response = await getMyProfile();
            setUser(response.data);
            setIsAuthenticated(true);
            return response.data; // Return user data for use in other functions
        } catch (error) {
            console.error("Failed to fetch user profile:", error);
            logout(); // If profile fetch fails, token is invalid, so log out.
            return null;
        }
    };

    useEffect(() => {
        const checkLoggedInUser = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const decoded = jwtDecode(token);
                    if (decoded.exp * 1000 > Date.now()) {
                        await fetchAndSetUser(); 
                    } else {
                        logout();
                    }
                } catch (error) {
                    logout();
                }
            }
            setLoading(false);
        };
        checkLoggedInUser();
    }, []);

    // === THIS IS THE FULLY UPDATED LOGIN FUNCTION ===
    const login = async (credentials) => {
        // Step 1: Call the API to get a JWT token
        const response = await loginUser(credentials);
        localStorage.setItem('token', response.data.token);
        
        // Step 2: After setting the token, fetch the new user's profile and permissions
        // This also sets the user in our context state
        const loggedInUser = await fetchAndSetUser();
        
        // Step 3: (THE NEW PART) After profile is set, register the device for notifications
        if (loggedInUser) {
            try {
                console.log("Requesting notification permission and FCM token...");
                const fcm_token = await requestForToken(); // Gets the unique token for this browser/device

                if (fcm_token) {
                    // If we get a token, send it to our backend to be saved
                    await registerDevice({ fcm_token });
                    console.log("Device token successfully registered with backend.");
                }
            } catch (error) {
                console.error("Could not register device for notifications:", error);
            }
        }
        
        // Step 4: Return the user object so the LoginPage can use it for redirection
        return loggedInUser;
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        setIsAuthenticated(false);
    };

    const hasPermission = (requiredPermission) => {
        if (!user || !user.permissions) {
            return false;
        }
        return user.permissions.includes(requiredPermission);
    };

    const value = {
        user,
        isAuthenticated,
        loading,
        login,
        logout,
        hasPermission
    };

    return (
        <AuthContext.Provider value={value}>
            {/* Render children only after the initial loading check is complete */}
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};