import { API_BASE, showNotification, setButtonLoading, navigate } from './common.js';

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
            let errorMessage = 'Registration failed. Please try again.';
            
            if (res.status === 400) {
                errorMessage = 'Invalid input. Please check your details.';
            } else if (res.status === 409) {
                errorMessage = 'Email already exists. Please use a different email.';
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
        console.error('Error registring user:', error);
        showNotification('Network error. Please check your connection.', 'error');
    } finally {
        setButtonLoading(submitButton, false);
    }
});
