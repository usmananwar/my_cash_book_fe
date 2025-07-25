import { fetchWithAuth, API_BASE, showNotification, fetchWithAuthAndNotify, setButtonLoading, navigate, parseErrorResponse } from './common.js';
const transactionId = new URLSearchParams(window.location.search).get('id');

if (!transactionId) {
    showNotification('Transaction ID is missing.', 'error');
    navigate('dashboard.html', 2000);
}

const editAmount = document.getElementById('editAmount');
const editDescription = document.getElementById('editDescription');
const editType = document.getElementById('editType');
const editTransactionForm = document.getElementById('editTransactionForm');

async function loadTransactionDetails() {
    try {
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
            const errorMessage = await parseErrorResponse(res, 'Failed to load transaction details');
            showNotification(errorMessage, 'error');
            navigate('dashboard.html', 2000);
        }
    } catch (error) {
        console.error('Error loading transaction:', error);
        showNotification('Network error. Please check your connection.', 'error');
        navigate('dashboard.html', 2000);
    }
}

editTransactionForm.onsubmit = async (e) => {
    e.preventDefault();
    
    const submitButton = e.target.querySelector('button[type="submit"]');
    setButtonLoading(submitButton, true);
    
    const updatedTransaction = {
        amount: editAmount.value,
        description: editDescription.value,
        type: editType.value
    };
    
    try {
        const res = await fetchWithAuthAndNotify(
            `${API_BASE}/cashbook/transaction/${transactionId}`,
            {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedTransaction)
            },
            'Transaction updated successfully! ✅',
            'Failed to update transaction. Please try again.'
        );
        
        if (res.ok) {
            navigate('dashboard.html', 1500);
        }
    } catch (error) {
        showNotification('Network error. Please check your connection.', 'error');
    } finally {
        setButtonLoading(submitButton, false);
    }
};

loadTransactionDetails();
// Delete Transaction logic
const deleteBtn = document.getElementById('deleteTransactionBtn');
const deleteModal = document.getElementById('deleteModal');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');

if (deleteBtn && deleteModal && confirmDeleteBtn && cancelDeleteBtn) {
    deleteBtn.onclick = () => {
        deleteModal.style.display = 'flex';
    };
    cancelDeleteBtn.onclick = () => {
        deleteModal.style.display = 'none';
    };
    confirmDeleteBtn.onclick = async () => {
        setButtonLoading(confirmDeleteBtn, true);
        try {
            const res = await fetchWithAuthAndNotify(
                `${API_BASE}/cashbook/transaction/${transactionId}`,
                {
                    method: 'DELETE',
                },
                'Transaction deleted successfully! ✅',
                'Failed to delete transaction. Please try again.'
            );
            if (res.ok) {
                deleteModal.style.display = 'none';
                navigate('dashboard.html', 1500);
            }
        } catch (error) {
            console.error('Error deleting transaction:', error);
            showNotification('Network error. Please check your connection.', 'error');
        } finally {
            setButtonLoading(confirmDeleteBtn, false);
        }
    };
}
