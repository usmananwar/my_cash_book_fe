import { API_BASE } from './common.js';

const registerForm = document.getElementById('registerForm');
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const user = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value
    };
    const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
    });
    if (res.ok) {
        // Registration successful! You may show a message in the UI here.
        window.location.href = 'index.html';
    } else {
        // Registration failed. You may show a message in the UI here.
    }
});
