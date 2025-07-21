import { getJwtToken, fetchWithAuth, API_BASE, showNotification, fetchWithAuthAndNotify, logoutAndRedirect, requireLogin, navigate } from './common.js';
requireLogin();

// DOM Elements
const logoutBtn = document.getElementById('logoutBtn');
const createNewCashbookBtn = document.getElementById('createNewCashbookBtn');
const quickCreateBtn = document.getElementById('quickCreateBtn');
const fabBtn = document.getElementById('fabBtn');
const gridViewBtn = document.getElementById('gridViewBtn');
const listViewBtn = document.getElementById('listViewBtn');
const createCashbookModal = document.getElementById('createCashbookModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const createCashbookForm = document.getElementById('createCashbookForm');
const cashbookNameInput = document.getElementById('cashbookName');
const cashbookDescriptionInput = document.getElementById('cashbookDescription');
const cashbookColorInput = document.getElementById('cashbookColor');
const createBtn = document.getElementById('createBtn');
const loadingState = document.getElementById('loadingState');
const emptyState = document.getElementById('emptyState');
const cashbooksGrid = document.getElementById('cashbooksGrid');
const cashbooksList = document.getElementById('cashbooksList');

// State
let currentView = 'grid';
let cashbooks = [];

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    loadCashbooks();
});

function setupEventListeners() {
    // Logout
    logoutBtn.onclick = logoutAndRedirect;
    
    // Create cashbook buttons
    createNewCashbookBtn.onclick = showCreateForm;
    quickCreateBtn.onclick = showCreateForm;
    fabBtn.onclick = showCreateForm;
    
    // View toggle
    gridViewBtn.onclick = () => setView('grid');
    listViewBtn.onclick = () => setView('list');
    
    // Modal controls
    closeModalBtn.onclick = hideCreateForm;
    createCashbookModal.onclick = (e) => {
        if (e.target === createCashbookModal) {
            hideCreateForm();
        }
    };
    
    // Form submission
    createCashbookForm.onsubmit = handleCreateCashbook;
    
    // Input validation
    cashbookNameInput.addEventListener('input', validateInput);
    cashbookDescriptionInput.addEventListener('input', validateInput);
}

function setView(view) {
    currentView = view;
    
    // Update button states
    gridViewBtn.classList.toggle('active', view === 'grid');
    listViewBtn.classList.toggle('active', view === 'list');
    
    // Update display
    cashbooksGrid.style.display = view === 'grid' ? 'grid' : 'none';
    cashbooksList.style.display = view === 'list' ? 'block' : 'none';
    
    // Re-render cashbooks in new view
    if (cashbooks.length > 0) {
        renderCashbooks();
    }
}

function showCreateForm() {
    createCashbookModal.style.display = 'flex';
    cashbookNameInput.focus();
    createCashbookForm.reset();
}

function hideCreateForm() {
    createCashbookModal.style.display = 'none';
}

function validateInput() {
    const name = cashbookNameInput.value.trim();
    
    if (name && name.length >= 2) {
        cashbookNameInput.style.borderColor = '#10b981';
    } else if (name) {
        cashbookNameInput.style.borderColor = '#f59e0b';
    } else {
        cashbookNameInput.style.borderColor = '#e1e5e9';
    }
}

async function loadCashbooks() {
    try {
        showLoadingState();
        
        // Show dummy data for demonstration
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate loading delay
        
        cashbooks = [
            {
                id: 1,
                name: "Personal Expenses",
                description: "Track my daily personal spending and income",
                color: "blue",
                balance: 2450.75,
                totalTransactions: 124,
                lastUsed: "2025-07-20T14:30:00Z",
                createdAt: "2025-06-15T09:00:00Z"
            },
            {
                id: 2,
                name: "Business Account",
                description: "Company expenses and revenue tracking",
                color: "green",
                balance: 15750.00,
                totalTransactions: 89,
                lastUsed: "2025-07-19T16:45:00Z",
                createdAt: "2025-06-01T10:30:00Z"
            },
            {
                id: 3,
                name: "Vacation Fund",
                description: "Saving for the upcoming Europe trip",
                color: "purple",
                balance: 890.25,
                totalTransactions: 23,
                lastUsed: "2025-07-18T12:15:00Z",
                createdAt: "2025-05-20T14:00:00Z"
            },
            {
                id: 4,
                name: "Home Renovation",
                description: "Kitchen and bathroom renovation expenses",
                color: "orange",
                balance: -1250.50,
                totalTransactions: 45,
                lastUsed: "2025-07-17T09:30:00Z",
                createdAt: "2025-04-10T11:45:00Z"
            },
            {
                id: 5,
                name: "Investment Portfolio",
                description: "Stock market investments and dividends",
                color: "teal",
                balance: 8900.00,
                totalTransactions: 67,
                lastUsed: "2025-07-16T13:20:00Z",
                createdAt: "2025-03-15T16:00:00Z"
            },
            {
                id: 6,
                name: "Emergency Fund",
                description: "Emergency savings for unexpected expenses",
                color: "red",
                balance: 5000.00,
                totalTransactions: 12,
                lastUsed: "2025-07-15T10:45:00Z",
                createdAt: "2025-02-01T08:30:00Z"
            }
        ];
        
        if (cashbooks.length === 0) {
            showEmptyState();
        } else {
            renderCashbooks();
        }
        
        // Uncomment below for real API integration
        /*
        const response = await fetchWithAuth(`${API_BASE}/cashbooks`);
        
        if (response.ok) {
            cashbooks = await response.json();
            
            if (cashbooks.length === 0) {
                showEmptyState();
            } else {
                renderCashbooks();
            }
        } else {
            throw new Error('Failed to load cashbooks');
        }
        */
    } catch (error) {
        console.error('Error loading cashbooks:', error);
        showNotification('Failed to load cashbooks. Please refresh the page.', 'error');
        showEmptyState();
    }
}

function showLoadingState() {
    loadingState.style.display = 'block';
    emptyState.style.display = 'none';
    cashbooksGrid.style.display = 'none';
    cashbooksList.style.display = 'none';
}

function showEmptyState() {
    loadingState.style.display = 'none';
    emptyState.style.display = 'block';
    cashbooksGrid.style.display = 'none';
    cashbooksList.style.display = 'none';
}

function renderCashbooks() {
    loadingState.style.display = 'none';
    emptyState.style.display = 'none';
    
    if (currentView === 'grid') {
        cashbooksGrid.style.display = 'grid';
        cashbooksList.style.display = 'none';
        renderGridView();
    } else {
        cashbooksGrid.style.display = 'none';
        cashbooksList.style.display = 'block';
        renderListView();
    }
}

function renderGridView() {
    cashbooksGrid.innerHTML = '';
    
    cashbooks.forEach(cashbook => {
        const cashbookCard = createCashbookCard(cashbook);
        cashbooksGrid.appendChild(cashbookCard);
    });
}

function renderListView() {
    cashbooksList.innerHTML = '';
    
    cashbooks.forEach(cashbook => {
        const cashbookItem = createCashbookListItem(cashbook);
        cashbooksList.appendChild(cashbookItem);
    });
}

function createCashbookCard(cashbook) {
    const card = document.createElement('div');
    card.className = `cashbook-card ${cashbook.color || 'blue'}`;
    
    const lastUsed = cashbook.lastUsed ? new Date(cashbook.lastUsed).toLocaleDateString() : 'Never';
    const transactionCount = cashbook.totalTransactions || 0;
    const balance = cashbook.balance || 0;
    
    card.innerHTML = `
        <div class="cashbook-header">
            <div class="cashbook-icon">
                <i class="fas fa-book"></i>
            </div>
            <div class="cashbook-menu">
                <button class="menu-btn" onclick="showCashbookMenu(event, '${cashbook.id}')">
                    <i class="fas fa-ellipsis-v"></i>
                </button>
            </div>
        </div>
        <div class="cashbook-content">
            <h3>${cashbook.name}</h3>
            <p class="cashbook-description">${cashbook.description || 'No description'}</p>
            <div class="cashbook-stats">
                <div class="stat">
                    <span class="stat-value ${balance >= 0 ? 'positive' : 'negative'}">$${Math.abs(balance).toFixed(2)}</span>
                    <span class="stat-label">Balance</span>
                </div>
                <div class="stat">
                    <span class="stat-value">${transactionCount}</span>
                    <span class="stat-label">Transactions</span>
                </div>
            </div>
            <div class="cashbook-footer">
                <span class="last-used">Last used: ${lastUsed}</span>
            </div>
        </div>
    `;
    
    card.onclick = () => openCashbook(cashbook.id);
    
    return card;
}

function createCashbookListItem(cashbook) {
    const item = document.createElement('div');
    item.className = 'cashbook-list-item';
    
    const lastUsed = cashbook.lastUsed ? new Date(cashbook.lastUsed).toLocaleDateString() : 'Never';
    const transactionCount = cashbook.totalTransactions || 0;
    const balance = cashbook.balance || 0;
    
    item.innerHTML = `
        <div class="cashbook-list-icon ${cashbook.color || 'blue'}">
            <i class="fas fa-book"></i>
        </div>
        <div class="cashbook-list-content">
            <div class="cashbook-list-header">
                <h4>${cashbook.name}</h4>
                <span class="balance ${balance >= 0 ? 'positive' : 'negative'}">$${Math.abs(balance).toFixed(2)}</span>
            </div>
            <p class="description">${cashbook.description || 'No description'}</p>
            <div class="cashbook-list-meta">
                <span>${transactionCount} transactions</span>
                <span>Last used: ${lastUsed}</span>
            </div>
        </div>
        <div class="cashbook-list-actions">
            <button class="action-btn" onclick="showCashbookMenu(event, '${cashbook.id}')">
                <i class="fas fa-ellipsis-v"></i>
            </button>
        </div>
    `;
    
    item.onclick = (e) => {
        if (!e.target.closest('.action-btn')) {
            openCashbook(cashbook.id);
        }
    };
    
    return item;
}

function openCashbook(cashbookId) {
    // Store the selected cashbook ID and navigate to dashboard
    localStorage.setItem('selectedCashbookId', cashbookId);
    navigate('dashboard.html');
}

function showCashbookMenu(event, cashbookId) {
    event.stopPropagation();
    // TODO: Implement context menu for edit/delete actions
    console.log('Show menu for cashbook:', cashbookId);
}

async function handleCreateCashbook(e) {
    e.preventDefault();
    
    const name = cashbookNameInput.value.trim();
    const description = cashbookDescriptionInput.value.trim();
    const color = cashbookColorInput.value;
    
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
    
    createBtn.classList.add('loading');
    createBtn.disabled = true;
    
    try {
        const payload = {
            name: name,
            description: description || null,
            color: color
        };
        
        const response = await fetchWithAuth(`${API_BASE}/cashbook/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        
        if (response.ok) {
            const newCashbook = await response.json();
            showNotification(`Cashbook "${name}" created successfully! 📚`, 'success');
            
            hideCreateForm();
            loadCashbooks(); // Reload the list
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

// Make functions available globally for onclick handlers
window.showCreateForm = showCreateForm;
window.openCashbook = openCashbook;
window.showCashbookMenu = showCashbookMenu;
