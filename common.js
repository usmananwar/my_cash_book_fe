// common.js

// API Base URL - automatically detects environment
export const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'https://192.168.0.17:8080/api'  // Development
    : 'http://24.52.208.248:9747/api';  // Production - Update this with your actual backend URL

export function getJwtToken() {
    return localStorage.getItem('jwtToken');
}

export async function fetchWithAuth(url, options = {}) {
    const token = getJwtToken();
    options.headers = options.headers || {};
    if (token) {
        options.headers['Authorization'] = 'Bearer ' + token;
    }
    return fetch(url, options);
}

// Redirect to login if response is 401 Unauthorized
export async function handleAuthRedirect(res) {
    if (res.status === 401) {
        // Login session expired. You may show a message in the UI here.
        window.location.href = 'index.html';
        return true;
    }
    return false;
}
