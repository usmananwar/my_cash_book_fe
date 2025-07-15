// common.js

export const API_BASE = 'https://192.168.0.17:8080/api';

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
