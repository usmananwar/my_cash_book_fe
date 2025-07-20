import { API_BASE, showNotification, fetchWithAuthAndNotify, navigate, requireLogin } from './common.js';

// Ensure user is logged in
requireLogin();

const cashbookList = document.getElementById('cashbook-list');
const addBtn = document.getElementById('add-cashbook-btn');
const modal = document.getElementById('add-cashbook-modal');
const closeModal = document.getElementById('close-modal');
const addForm = document.getElementById('add-cashbook-form');
const cashbookNameInput = document.getElementById('cashbook-name');

// Fetch and display cashbooks
async function loadCashbooks() {
    cashbookList.innerHTML = '';
    const cashbooks = [
        
    ];
    cashbookList.innerHTML = '';
    // Create card elements for each cashbook
    cashbooks.forEach(cb => {
        const card = document.createElement('div');
        card.className = 'card';
        card.textContent = cb.name;
        card.addEventListener('click', () => {
            localStorage.setItem('selectedCashbookId', cb.id);
            navigate('cashbook.html');
        });
        cashbookList.appendChild(card);
    });
    // Add the add-cashbook button as a card
    const addBtn = document.createElement('button');
    addBtn.id = 'add-cashbook-btn';
    addBtn.className = 'add-btn';
    addBtn.textContent = '+';
    cashbookList.appendChild(addBtn);
}


closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
});
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}

addForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = cashbookNameInput.value.trim();
    if (!name) return;
    try {
        const res = await fetchWithAuthAndNotify(`${API_BASE}/cashbooks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name })
        });
        if (!res.ok) throw new Error('Failed to create cashbook');
        showNotification('Cashbook created!', 'success');
        modal.style.display = 'none';
        cashbookNameInput.value = '';
        loadCashbooks();
    } catch (err) {
        showNotification('Error creating cashbook', 'error');
    }
});

loadCashbooks();
