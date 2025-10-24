import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser } from '../services/api';
import { jwtDecode } from 'jwt-decode'; // We will install this next

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            try {
                const decodedUser = jwtDecode(token);
                setUser(decodedUser);
            } catch (e) {
                // Invalid token, clear it
                localStorage.removeItem('token');
                setToken(null);
                setUser(null);
            }
        }
        setLoading(false);
    }, [token]);

    const login = async (credentials) => {
        const response = await loginUser(credentials);
        const newToken = response.data.token;
        localStorage.setItem('token', newToken);
        const decodedUser = jwtDecode(newToken);
        setUser(decodedUser);
        setToken(newToken);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        setToken(null);
    };

    const authContextValue = {
        user,
        token,
        login,
        logout,
        isAuthenticated: !!token,
    };

    return (
        <AuthContext.Provider value={authContextValue}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};