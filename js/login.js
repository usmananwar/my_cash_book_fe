import { API_BASE, showNotification, fetchWithAuthAndNotify, setButtonLoading, navigate } from './common.js';

const loginForm = document.getElementById('loginForm');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitButton = e.target.querySelector('button[type="submit"]');
    setButtonLoading(submitButton, true);
    
    const user = {
        email: document.getElementById('loginEmail').value,
        password: document.getElementById('loginPassword').value
    };
    
    try {
        const res = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user)
        });
        
        if (res.ok) {
            const data = await res.json();
            localStorage.setItem('jwtToken', data.token || data.jwt || data);
            showNotification('Login successful! Welcome back! 🎉', 'success');
            navigate('dashboard.html');
        } else {
            let errorMessage = 'Login failed. Please check your credentials.';
            
            if (res.status === 401) {
                errorMessage = 'Invalid email or password.';
            } else if (res.status === 429) {
                errorMessage = 'Too many login attempts. Please try again later.';
            } else {
                try {
                    const errorData = await res.json();
                    errorMessage = errorData.message || errorData.error || errorMessage;
                } catch (e) {
                    // Use default message
                }
            }
            
            showNotification(errorMessage, 'error');
        }
    } catch (error) {
        console.error('Error trying to login:', error);
        showNotification('Network error. Please check your connection.', 'error');
    } finally {
        setButtonLoading(submitButton, false);
    }
});
