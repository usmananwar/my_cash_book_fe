import { API_BASE, showNotification, setButtonLoading, navigate, parseErrorResponse } from './common.js';

const registerForm = document.getElementById('registerForm');
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitButton = e.target.querySelector('button[type="submit"]');
    setButtonLoading(submitButton, true);
    
    const user = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value
    };
    
    try {
        const res = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user)
        });
        
        if (res.ok) {
            showNotification('Registration successful! Please login to continue. 🎉', 'success');
            navigate('/', 2000);
        } else {
            const errorMessage = await parseErrorResponse(
                res,
                'Registration failed. Please try again.'
            );
            
            showNotification(errorMessage, 'error');
        }
    } catch (error) {
        console.error('Error registring user:', error);
        showNotification('Network error. Please check your connection.', 'error');
    } finally {
        setButtonLoading(submitButton, false);
    }
});
