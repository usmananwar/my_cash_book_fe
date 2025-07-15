import { API_BASE } from './common.js';

const loginForm = document.getElementById('loginForm');
// Helper to get JWT token from localStorage
function getJwtToken() {
    return localStorage.getItem('jwtToken');
}

// Helper to make authenticated requests
async function fetchWithAuth(url, options = {}) {
    const token = getJwtToken();
    options.headers = options.headers || {};
    if (token) {
        options.headers['Authorization'] = 'Bearer ' + token;
    }
    return fetch(url, options);
}
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const user = {
        email: document.getElementById('loginEmail').value,
        password: document.getElementById('loginPassword').value
    };
    const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
    });
    if (res.ok) {
        const data = await res.json();
        localStorage.setItem('jwtToken', data.token || data.jwt || data);
        window.location.href = 'dashboard.html';
    } else {
        // Login failed. You may show a message in the UI here.
    }
});
