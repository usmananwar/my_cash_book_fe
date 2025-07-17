
// API Base URL - automatically detects environment
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const isDevelopment = isLocalhost || window.location.hostname.includes('localhost');

export const API_BASE = isDevelopment
    ? 'https://192.168.0.17:8080/api'  // Development
    : 'https://pindrow.site/api';  // Production - Using HTTP to avoid SSL certificate issues with IP

// Alternative: You can also use environment detection for multiple environments
// export const API_BASE = (() => {
//     if (isDevelopment) return 'https://192.168.0.17:8080/api';
//     if (window.location.hostname.includes('render.com')) return 'https://your-backend.onrender.com/api';
//     return 'http://24.52.208.248:9747/api'; // Fallback
// })();

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
