// debit.js
import { getJwtToken, fetchWithAuth, handleAuthRedirect, API_BASE } from './common.js';
const jwtToken = getJwtToken();

if (!jwtToken) {
    window.location.href = 'index.html';
}

const debitForm = document.getElementById('debitForm');
debitForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const amount = document.getElementById('debitAmount').value;
    const desc = document.getElementById('debitDesc').value;
    const res = await fetchWithAuth(`${API_BASE}/cashbook/debit?amount=${amount}&description=${desc}`, {
        method: 'POST'
    });
    if (await handleAuthRedirect(res)) return;
    if (res.ok) {
        // Debit entry added! You may show a message in the UI here.
        window.location.href = 'dashboard.html';
    } else {
        // Debit failed. You may show a message in the UI here.
    }
});
