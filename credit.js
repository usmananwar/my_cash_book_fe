import { getJwtToken, fetchWithAuth, handleAuthRedirect, API_BASE } from './common.js';
const jwtToken = getJwtToken();

if (!jwtToken) {
    window.location.href = 'index.html';
}

const creditForm = document.getElementById('creditForm');
creditForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const amount = document.getElementById('creditAmount').value;
    const desc = document.getElementById('creditDesc').value;
    const res = await fetchWithAuth(`${API_BASE}/cashbook/credit?amount=${amount}&description=${desc}`, {
        method: 'POST'
    });
    if (await handleAuthRedirect(res)) return;
    if (res.ok) {
        // Credit entry added! You may show a message in the UI here.
        window.location.href = 'dashboard.html';
    } else {
        // Credit failed. You may show a message in the UI here.
    }
});
