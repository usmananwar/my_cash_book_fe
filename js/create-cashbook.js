import { getJwtToken, fetchWithAuth, API_BASE, showNotification, fetchWithAuthAndNotify, logoutAndRedirect, requireLogin, navigate } from './common.js';
requireLogin();

// DOM Elements
const createCashbookForm = document.getElementById('createCashbookForm');
const cashbookNameInput = document.getElementById('cashbookName');
const cashbookDescriptionInput = document.getElementById('cashbookDescription');
const createBtn = document.getElementById('createBtn');

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    cashbookNameInput.focus();
});

function setupEventListeners() {
    createCashbookForm.onsubmit = handleCreateCashbook;
    
    // Character count for inputs
    cashbookNameInput.addEventListener('input', function() {
        const remaining = 50 - this.value.length;
        if (remaining <= 10) {
            this.style.borderColor = remaining <= 0 ? '#ef4444' : '#f59e0b';
        } else {
            this.style.borderColor = '#e1e5e9';
        }
    });
    
    cashbookDescriptionInput.addEventListener('input', function() {
        const remaining = 100 - this.value.length;
        if (remaining <= 20) {
            this.style.borderColor = remaining <= 0 ? '#ef4444' : '#f59e0b';
        } else {
            this.style.borderColor = '#e1e5e9';
        }
    });
}

async function handleCreateCashbook(e) {
    e.preventDefault();
    
    const name = cashbookNameInput.value.trim();
    const description = cashbookDescriptionInput.value.trim();
    
    if (!name) {
        showNotification('Please enter a cashbook name', 'error');
        cashbookNameInput.focus();
        return;
    }
    
    if (name.length < 2) {
        showNotification('Cashbook name must be at least 2 characters long', 'error');
        cashbookNameInput.focus();
        return;
    }
    
    // Disable form during submission
    createBtn.classList.add('loading');
    createBtn.disabled = true;
    
    try {
        const payload = {
            name: name,
            description: description || null
        };
        
        const response = await fetchWithAuth(`${API_BASE}/cashbook/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        
        if (response.ok) {
            const result = await response.json();
            showNotification(`Cashbook "${name}" created successfully! 📚`, 'success');
            
            // Clear form
            createCashbookForm.reset();
            
            // Redirect to dashboard after a short delay
            setTimeout(() => {
                navigate('dashboard.html');
            }, 2000);
        } else {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.message || 'Failed to create cashbook. Please try again.';
            showNotification(errorMessage, 'error');
        }
    } catch (error) {
        console.error('Error creating cashbook:', error);
        showNotification('Network error. Please check your connection and try again.', 'error');
    } finally {
        createBtn.classList.remove('loading');
        createBtn.disabled = false;
    }
}

// Utility function to validate cashbook name
function isValidCashbookName(name) {
    // Check for valid characters (letters, numbers, spaces, and common punctuation)
    const validPattern = /^[a-zA-Z0-9\s\-_\.,'&()]+$/;
    return validPattern.test(name);
}

// Add real-time validation
cashbookNameInput.addEventListener('input', function() {
    const name = this.value.trim();
    
    if (name && !isValidCashbookName(name)) {
        this.style.borderColor = '#ef4444';
        showNotification('Cashbook name contains invalid characters', 'error');
    } else if (name && name.length >= 2) {
        this.style.borderColor = '#10b981';
    }
});
