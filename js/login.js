import { API_BASE, showNotification, fetchWithAuthAndNotify, setButtonLoading, navigate, parseErrorResponse } from './common.js';

const loginForm = document.getElementById('loginForm');
const registerLink = document.getElementById('registerLink');

// Handle register link click
registerLink.addEventListener('click', (e) => {
    e.preventDefault();
    navigate('register.html');
});

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
            navigate('cashbooks.html');
        } else {
            const errorMessage = await parseErrorResponse(
                res, 
                'Login failed. Please check your credentials.'
            );
            
            showNotification(errorMessage, 'error');
        }
    } catch (error) {
        console.error('Error trying to login:', error);
        showNotification('Network error. Please check your connection.', 'error');
    } finally {
        setButtonLoading(submitButton, false);
    }
});
