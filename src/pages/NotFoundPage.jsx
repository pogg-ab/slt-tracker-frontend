// src/pages/NotFoundPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            textAlign: 'center',
            fontFamily: 'sans-serif'
        }}>
            <h1 style={{ fontSize: '6rem', margin: 0 }}>404</h1>
            <h2 style={{ margin: '0 0 1rem 0' }}>Page Not Found</h2>
            <p style={{ color: '#666', marginBottom: '2rem' }}>
                Sorry, the page you are looking for does not exist.
            </p>
            <Link to="/" style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#007BFF',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '8px',
                fontWeight: 'bold'
            }}>
                Go to Homepage
            </Link>
        </div>
    );
};

export default NotFoundPage;