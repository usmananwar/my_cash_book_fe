// debit.js
import { getJwtToken, fetchWithAuthAndNotify, handleAuthRedirect, API_BASE, showNotification, setButtonLoading } from './common.js';
const jwtToken = getJwtToken();

if (!jwtToken) {
    showNotification('Please login to continue.', 'error');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 2000);
}

const debitForm = document.getElementById('debitForm');
debitForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitButton = e.target.querySelector('button[type="submit"]');
    setButtonLoading(submitButton, true);
    
    const amount = document.getElementById('debitAmount').value;
    const desc = document.getElementById('debitDesc').value;
    
    try {
        const res = await fetchWithAuthAndNotify(
            `${API_BASE}/cashbook/debit?amount=${amount}&description=${desc}`,
            { method: 'POST' },
            `Expense of $${amount} added successfully! 💸`,
            'Failed to add expense. Please try again.'
        );
        
        if (await handleAuthRedirect(res)) return;
        
        if (res.ok) {
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
        }
    } catch (error) {
        showNotification('Network error. Please check your connection.', 'error');
    } finally {
        setButtonLoading(submitButton, false);
    }
});
