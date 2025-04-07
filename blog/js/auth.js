// Authentication utilities
import { ADMIN_CONFIG } from './auth-config.js';

// SHA-256 hash function
async function sha256(message) {
    // Encode as UTF-8
    const msgBuffer = new TextEncoder().encode(message);
    // Hash the message
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    // Convert to hex string
    return Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

// Verify the admin password
export async function verifyPassword(password) {
    const hash = await sha256(password);
    return hash === ADMIN_CONFIG.passwordHash;
}

// Check if current access is valid
export function hasValidAccess() {
    // Get the URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const accessKey = urlParams.get('key');
    
    // Check if the key matches
    return accessKey === ADMIN_CONFIG.accessKey;
}

// Generate the admin URL
export function getAdminUrl() {
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}?key=${ADMIN_CONFIG.accessKey}`;
}