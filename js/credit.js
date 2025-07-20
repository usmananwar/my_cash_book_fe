import { getJwtToken, fetchWithAuthAndNotify, handleAuthRedirect, API_BASE, showNotification, setButtonLoading, requireLogin, navigate } from './common.js';
requireLogin();

const creditForm = document.getElementById('creditForm');
creditForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitButton = e.target.querySelector('button[type="submit"]');
    setButtonLoading(submitButton, true);
    
    const amount = document.getElementById('creditAmount').value;
    const desc = document.getElementById('creditDesc').value;
    
    try {
        const res = await fetchWithAuthAndNotify(
            `${API_BASE}/cashbook/credit?amount=${amount}&description=${desc}`,
            { method: 'POST' },
            `Credit of $${amount} added successfully! 💰`,
            'Failed to add credit. Please try again.'
        );
        
        if (await handleAuthRedirect(res)) return;
        
        if (res.ok) {
            navigate('dashboard.html', 1500);
        }
    } catch (error) {
        showNotification('Network error. Please check your connection.', 'error');
    } finally {
        setButtonLoading(submitButton, false);
    }
});
