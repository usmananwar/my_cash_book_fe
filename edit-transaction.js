import { fetchWithAuth, API_BASE } from './common.js';
const transactionId = new URLSearchParams(window.location.search).get('id');

if (!transactionId) {
    // Transaction ID is missing. You may show a message in the UI here.
    window.location.href = 'dashboard.html';
}

const editAmount = document.getElementById('editAmount');
const editDescription = document.getElementById('editDescription');
const editType = document.getElementById('editType');
const editTransactionForm = document.getElementById('editTransactionForm');

async function loadTransactionDetails() {
    const res = await fetchWithAuth(`${API_BASE}/cashbook/transaction/${transactionId}`);
    if (res.ok) {
        const transaction = await res.json();
        editAmount.value = transaction.amount;
        editDescription.value = transaction.description;

        // Populate dropdown with transaction types
        const transactionTypes = ['Credit', 'Debit'];
        editType.innerHTML = transactionTypes.map(type => `<option value="${type}">${type}</option>`).join('');

        // Set the selected value
        const options = Array.from(editType.options);
        const matchingOption = options.find(option => option.value === transaction.type);
        if (matchingOption) {
            matchingOption.selected = true;
        } else {
            console.error(`No matching option found for transaction type: ${transaction.type}`);
        }
    } else {
        // Failed to load transaction details. You may show a message in the UI here.
        window.location.href = 'dashboard.html';
    }
}

editTransactionForm.onsubmit = async (e) => {
    e.preventDefault();
    const updatedTransaction = {
        amount: editAmount.value,
        description: editDescription.value,
        type: editType.value
    };
    const res = await fetchWithAuth(`${API_BASE}/cashbook/transaction/${transactionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTransaction)
    });
    if (res.ok) {
        // Transaction updated successfully. You may show a message in the UI here.
        window.location.href = 'dashboard.html';
    } else {
        // Failed to update transaction. You may show a message in the UI here.
    }
};


loadTransactionDetails();
