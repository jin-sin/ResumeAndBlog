// Secure Authentication Utilities
import { API_BASE_URL } from './api.js';

// Auth token storage key
const AUTH_TOKEN_KEY = 'blog_auth_token';

// Login with server-side authentication
export async function login(username, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            mode: 'cors',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ username, password }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Authentication failed');
        }

        const data = await response.json();
        
        // Store token securely
        localStorage.setItem(AUTH_TOKEN_KEY, data.token);
        
        return {
            success: true,
            user: data.user
        };
    } catch (error) {
        console.error('Login error:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Verify current session
export async function verifySession() {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    
    if (!token) {
        return { success: false };
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/verify`, {
            method: 'POST',
            mode: 'cors',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ token }),
        });

        if (!response.ok) {
            // Clear invalid token
            localStorage.removeItem(AUTH_TOKEN_KEY);
            return { success: false };
        }

        const data = await response.json();
        return {
            success: true,
            user: data.user
        };
    } catch (error) {
        console.error('Session verification error:', error);
        return { success: false };
    }
}

// Logout from the server
export async function logout() {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    
    if (!token) {
        return { success: true };
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/logout`, {
            method: 'POST',
            mode: 'cors',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ token }),
        });

        // Clear token regardless of server response
        localStorage.removeItem(AUTH_TOKEN_KEY);
        
        return { success: true };
    } catch (error) {
        console.error('Logout error:', error);
        // Clear token anyway
        localStorage.removeItem(AUTH_TOKEN_KEY);
        return { success: true };
    }
}

// Get the current auth token
export function getAuthToken() {
    return localStorage.getItem(AUTH_TOKEN_KEY);
}

// Check if user is authenticated
export function isAuthenticated() {
    return !!localStorage.getItem(AUTH_TOKEN_KEY);
}

// Add authorization headers to API requests
export function addAuthHeader(headers = {}) {
    const token = getAuthToken();
    if (token) {
        return {
            ...headers,
            'Authorization': `Bearer ${token}`
        };
    }
    return headers;
}

// Generate the admin URL (legacy support)
export function getAdminUrl() {
    return window.location.origin + '/blog/admin.html';
}