import { getJwtToken, fetchWithAuth, API_BASE, showNotification, fetchWithAuthAndNotify, logoutAndRedirect, requireLogin, navigate, formatDateWithTime } from './common.js';
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
const deleteCashbookModal = document.getElementById('deleteCashbookModal');
const closeDeletModalBtn = document.getElementById('closeDeletModalBtn');
const confirmDeleteCashbookBtn = document.getElementById('confirmDeleteCashbookBtn');
const cancelDeleteCashbookBtn = document.getElementById('cancelDeleteCashbookBtn');

// State
let currentView = 'grid';
let cashbooks = [];
let cashbookToDelete = null;
let cashbookToEdit = null;

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
    
    // Delete modal controls
    closeDeletModalBtn.onclick = hideDeleteModal;
    cancelDeleteCashbookBtn.onclick = hideDeleteModal;
    confirmDeleteCashbookBtn.onclick = confirmDeleteCashbook;
    deleteCashbookModal.onclick = (e) => {
        if (e.target === deleteCashbookModal) {
            hideDeleteModal();
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
    cashbookToEdit = null; // Clear edit mode
    createCashbookModal.style.display = 'flex';
    cashbookNameInput.focus();
    createCashbookForm.reset();
    
    // Update modal title and button text for create mode
    document.querySelector('#createCashbookModal .modal-header h3').textContent = 'Create New Cashbook';
    createBtn.innerHTML = '<i class="fas fa-plus"></i> Create Cashbook';
}

function showEditForm(cashbook) {
    console.log('showEditForm called with:', cashbook);
    cashbookToEdit = cashbook;
    createCashbookModal.style.display = 'flex';
    
    // Populate form with cashbook data
    cashbookNameInput.value = cashbook.name;
    cashbookDescriptionInput.value = cashbook.description || '';
    cashbookColorInput.value = cashbook.color || 'blue';
    
    // Update modal title and button text for edit mode
    document.querySelector('#createCashbookModal .modal-header h3').textContent = 'Edit Cashbook';
    createBtn.innerHTML = '<i class="fas fa-save"></i> Update Cashbook';
    
    cashbookNameInput.focus();
}

function hideCreateForm() {
    createCashbookModal.style.display = 'none';
}

function showDeleteModal(cashbookId) {
    cashbookToDelete = cashbookId;
    deleteCashbookModal.style.display = 'flex';
}

function hideDeleteModal() {
    deleteCashbookModal.style.display = 'none';
    cashbookToDelete = null;
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
        cashbooks = [];        
        const response = await fetchWithAuth(`${API_BASE}/cashbook/cashbooks`);
        
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
    
    const lastUsed = formatDateWithTime(cashbook.updatedDate);
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
    
    const lastUsed = formatDateWithTime(cashbook.lastUsed);
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
    // Remove any existing menu
    const existingMenu = document.getElementById('cashbookMenuPopup');
    if (existingMenu) existingMenu.remove();

    // Create menu popup
    const menu = document.createElement('div');
    menu.id = 'cashbookMenuPopup';
    menu.style.position = 'absolute';
    menu.style.zIndex = '1000';
    menu.style.background = '#fff';
    menu.style.border = '1px solid #e1e5e9';
    menu.style.boxShadow = '0 2px 8px rgba(0,0,0,0.12)';
    menu.style.padding = '8px 16px';
    menu.style.borderRadius = '8px';
    menu.style.top = `${event.clientY}px`;
    menu.style.left = `${event.clientX}px`;

    // Add edit link
    const editLink = document.createElement('a');
    editLink.href = '#';
    editLink.textContent = 'Edit';
    editLink.style.color = '#6b7280';
    editLink.style.display = 'block';
    editLink.style.margin = '8px 0';
    editLink.style.textDecoration = 'none';
    editLink.onclick = (e) => {
        e.preventDefault();
        menu.remove();
        // Find the cashbook and show edit form
        const cashbook = cashbooks.find(cb => cb.id == cashbookId); // Use == for loose comparison
        console.log('Found cashbook for editing:', cashbook, 'ID:', cashbookId);
        if (cashbook) {
            showEditForm(cashbook);
        } else {
            console.error('Cashbook not found with ID:', cashbookId);
            showNotification('Error: Cashbook not found', 'error');
        }
    };
    menu.appendChild(editLink);

    // Add delete link
    const deleteLink = document.createElement('a');
    deleteLink.href = '#';
    deleteLink.textContent = 'Delete';
    deleteLink.style.color = '#ef4444';
    deleteLink.style.display = 'block';
    deleteLink.style.margin = '8px 0';
    deleteLink.onclick = (e) => {
        e.preventDefault();
        menu.remove();
        // Show confirmation modal instead of browser confirm
        showDeleteModal(cashbookId);
    };
    menu.appendChild(deleteLink);

    // Remove menu on click outside
    setTimeout(() => {
        document.addEventListener('click', function handler(e) {
            if (!menu.contains(e.target)) {
                menu.remove();
                document.removeEventListener('click', handler);
            }
        });
    }, 0);

    document.body.appendChild(menu);
}

async function confirmDeleteCashbook() {
    if (!cashbookToDelete) return;
    
    confirmDeleteCashbookBtn.classList.add('loading');
    confirmDeleteCashbookBtn.disabled = true;
    
    try {
        const response = await fetchWithAuth(`${API_BASE}/cashbook/delete?cashbookId=${cashbookToDelete}`, {
            method: 'DELETE'
        });
        if (response.ok) {
            showNotification('Cashbook deleted successfully!', 'success');
            hideDeleteModal();
            loadCashbooks();
        } else {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.message || 'Failed to delete cashbook.';
            showNotification(errorMessage, 'error');
        }
    } catch (error) {
        showNotification('Network error. Please try again.', 'error');
    } finally {
        confirmDeleteCashbookBtn.classList.remove('loading');
        confirmDeleteCashbookBtn.disabled = false;
    }
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
        
        let response;
        let successMessage;
        
        if (cashbookToEdit) {
            // Update existing cashbook
            response = await fetchWithAuth(`${API_BASE}/cashbook/update?cashbookId=${cashbookToEdit.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            successMessage = `Cashbook "${name}" updated successfully! 📚`;
        } else {
            // Create new cashbook
            response = await fetchWithAuth(`${API_BASE}/cashbook/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            successMessage = `Cashbook "${name}" created successfully! 📚`;
        }
        
        if (response.ok) {
            const result = await response.json();
            showNotification(successMessage, 'success');
            
            hideCreateForm();
            loadCashbooks(); // Reload the list
        } else {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.message || `Failed to ${cashbookToEdit ? 'update' : 'create'} cashbook. Please try again.`;
            showNotification(errorMessage, 'error');
        }
    } catch (error) {
        console.error(`Error ${cashbookToEdit ? 'updating' : 'creating'} cashbook:`, error);
        showNotification('Network error. Please check your connection and try again.', 'error');
    } finally {
        createBtn.classList.remove('loading');
        createBtn.disabled = false;
    }
}

// Make functions available globally for onclick handlers
window.showCreateForm = showCreateForm;
window.showEditForm = showEditForm;
window.openCashbook = openCashbook;
window.showCashbookMenu = showCashbookMenu;
