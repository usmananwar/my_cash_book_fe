import { getJwtToken, fetchWithAuth, API_BASE, showNotification, fetchWithAuthAndNotify, logoutAndRedirect, requireLogin, navigate, formatDateWithTime, parseErrorResponse, initializePWAInstall } from './common.js';
requireLogin();

// Initialize PWA install functionality
initializePWAInstall();

// DOM Elements
const logoutBtn = document.getElementById('logoutBtn');
const profileBtn = document.getElementById('profileBtn');
const cashbooksBtn = document.getElementById('cashbooksBtn');
const createCashbookBtn = document.getElementById('createCashbookBtn');
const quickIncomeBtn = document.getElementById('quickIncomeBtn');
const quickExpenseBtn = document.getElementById('quickExpenseBtn');
const fabBtn = document.getElementById('fabBtn');
const quickAddSection = document.getElementById('quickAddSection');
const closeFormBtn = document.getElementById('closeFormBtn');
const quickAddForm = document.getElementById('quickAddForm');
const formTitle = document.getElementById('formTitle');
const submitBtn = document.getElementById('submitBtn');
const filterBtn = document.getElementById('filterBtn');
const filterOptions = document.getElementById('filterOptions');
const filterTabs = document.querySelectorAll('.filter-tab');
const balanceDisplay = document.getElementById('balanceDisplay');
const toggleBalance = document.getElementById('toggleBalance');
const eyeIcon = document.getElementById('eyeIcon');
const monthlyIncome = document.getElementById('monthlyIncome');
const monthlyExpense = document.getElementById('monthlyExpense');
const transactionsContainer = document.getElementById('transactionsContainer');
const loadMoreContainer = document.getElementById('loadMoreContainer');
const loadMoreBtn = document.getElementById('loadMoreBtn');
const timeOfDay = document.getElementById('timeOfDay');
const exportBtn = document.getElementById('exportBtn');

// State
let currentTransactionType = 'credit';
let balanceVisible = true;
let currentFilter = 'all';
/** Next page index to request when appending (after initial page 0). */
let nextTransactionPage = 0;
const pageSize = 10;
let loading = false;
let hasMore = true;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    setTimeGreeting();
    loadBalance();
    loadMonthlyStats();
    loadTransactions();
    setupEventListeners();
});

function setTimeGreeting() {
    const hour = new Date().getHours();
    let greeting = 'Morning';
    if (hour >= 12 && hour < 17) greeting = 'Afternoon';
    else if (hour >= 17) greeting = 'Evening';
    timeOfDay.textContent = greeting;
}

function setupEventListeners() {
    // Logout
    logoutBtn.onclick = logoutAndRedirect;
    
    // Navigation
    profileBtn.onclick = () => navigate('profile.html');
    cashbooksBtn.onclick = () => navigate('cashbooks.html');
    
    // Create Cashbook
  //  createCashbookBtn.onclick = () => navigate('create-cashbook.html');
    
    // Quick action buttons
    quickIncomeBtn.onclick = () => showQuickAddForm('credit');
    quickExpenseBtn.onclick = () => showQuickAddForm('debit');
    
    // FAB - show expense form by default
    fabBtn.onclick = () => showQuickAddForm('debit');
    
    // Form controls
    closeFormBtn.onclick = hideQuickAddForm;
    quickAddForm.onsubmit = handleQuickAdd;
    
    // Click outside to close form
    quickAddSection.onclick = (e) => {
        if (e.target === quickAddSection) {
            hideQuickAddForm();
        }
    };
    
    // Balance toggle
    toggleBalance.onclick = toggleBalanceVisibility;
    
    // Filter controls
    filterBtn.onclick = toggleFilterOptions;
    filterTabs.forEach(tab => {
        tab.onclick = () => setFilter(tab.dataset.filter);
    });
    
    // Load more
    loadMoreBtn.onclick = loadMoreTransactions;

    if (exportBtn) {
        exportBtn.onclick = exportFile;
    }
}

function showQuickAddForm(type) {
    currentTransactionType = type;
    const isIncome = type === 'credit';
    
    formTitle.textContent = isIncome ? 'Add Income' : 'Add Expense';
    submitBtn.innerHTML = `<i class="fas fa-check"></i> Add ${isIncome ? 'Income' : 'Expense'}`;
    
    // Update form styling based on type
    if (isIncome) {
        submitBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
    } else {
        submitBtn.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
    }
    
    // Reset form
    quickAddForm.reset();
    
    // Show form
    quickAddSection.style.display = 'flex';
    document.getElementById('quickAmount').focus();
}

function hideQuickAddForm() {
    quickAddSection.style.display = 'none';
}

async function handleQuickAdd(e) {
    e.preventDefault();
    
    const amount = document.getElementById('quickAmount').value;
    const description = document.getElementById('quickDescription').value;
    
    if (!amount || !description) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    submitBtn.classList.add('loading');
    
    try {

        // Get selected cashbookId from localStorage
        const selectedCashbookId = localStorage.getItem('selectedCashbookId');
        if (!selectedCashbookId) {
            showNotification('No cashbook selected.', 'error');
            return;
        }

        const q = new URLSearchParams({
            cashbookId: selectedCashbookId,
            amount: String(amount),
            description: description
        });
        const res = await fetchWithAuthAndNotify(
            `${API_BASE}/cashbook/${currentTransactionType}?${q.toString()}`,
            { method: 'POST' },
            `${currentTransactionType === 'credit' ? 'Income' : 'Expense'} of $${amount} added successfully! ${currentTransactionType === 'credit' ? '💰' : '💸'}`,
            `Failed to add ${currentTransactionType}. Please try again.`
        );
        
        if (res.ok) {
            hideQuickAddForm();
            loadBalance();
            loadMonthlyStats();
            refreshTransactions();
        }
    } catch (error) {
        console.error('Error adding transaction:', error);
        showNotification('Network error. Please check your connection.', 'error');
    } finally {
        submitBtn.classList.remove('loading');
    }
}

function toggleBalanceVisibility() {
    balanceVisible = !balanceVisible;
    
    if (balanceVisible) {
        eyeIcon.className = 'fas fa-eye';
        balanceDisplay.classList.remove('hidden');
        loadBalance(); // Reload balance to show actual value
    } else {
        eyeIcon.className = 'fas fa-eye-slash';
        balanceDisplay.classList.add('hidden');
        balanceDisplay.textContent = '••••••';
    }
}

function toggleFilterOptions() {
    const isVisible = filterOptions.style.display !== 'none';
    filterOptions.style.display = isVisible ? 'none' : 'block';
}

function setFilter(filter) {
    currentFilter = filter;
    
    // Update active tab
    filterTabs.forEach(tab => {
        tab.classList.toggle('active', tab.dataset.filter === filter);
    });
    
    // Hide filter options
    filterOptions.style.display = 'none';
    
    // Refresh transactions
    refreshTransactions();
}

function refreshTransactions() {
    nextTransactionPage = 0;
    hasMore = true;
    transactionsContainer.innerHTML = '';
    loadTransactions();
}

async function loadBalance() {
    try {
        // Get selected cashbookId from localStorage
        const selectedCashbookId = localStorage.getItem('selectedCashbookId');
        if (!selectedCashbookId) {
            showNotification('No cashbook selected.', 'error');
            return;
        }

        const res = await fetchWithAuth(`${API_BASE}/cashbook/balance?cashbookId=${selectedCashbookId}`);
        if (res.ok) {
            const data = await res.json();
            const balance = data.balance || data;
            
            if (balanceVisible) {
                balanceDisplay.textContent = `$${parseFloat(balance).toFixed(2)}`;
                balanceDisplay.classList.remove('hidden');
            }
        } else {
            const errorMessage = await parseErrorResponse(res, 'Failed to load balance');
            showNotification(errorMessage, 'error');
        }
    } catch (error) {
        console.error('Error loading balance:', error);
        showNotification('Network error. Please check your connection.', 'error');
    }
}

async function loadMonthlyStats() {
    try {
        // You might need to implement these endpoints or calculate from transactions
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        
        // For now, we'll calculate from transactions
        // const res = await fetchWithAuth(`${API_BASE}/cashbook/transactions?page=0&size=100`);
        // if (res.ok) {
        //     const data = await res.json();
        //     const transactions = data.content || data;
            
        //     let income = 0;
        //     let expense = 0;
            
        //     transactions.forEach(tx => {
        //         const txDate = new Date(tx.timestamp || tx.createdDate);
        //         if (txDate >= firstDay && txDate <= lastDay) {
        //             if (tx.type === 'credit') {
        //                 income += parseFloat(tx.amount);
        //             } else {
        //                 expense += parseFloat(tx.amount);
        //             }
        //         }
        //     });
            
        //     monthlyIncome.textContent = `+$${income.toFixed(2)}`;
        //     monthlyExpense.textContent = `-$${expense.toFixed(2)}`;
        // }
    } catch (error) {
        console.error('Error loading monthly stats:', error);
    }
}

async function loadTransactions(append = false) {
    if (loading || (!hasMore && append)) return;
    
    loading = true;
    
    try {
        // Get selected cashbookId from localStorage
        const selectedCashbookId = localStorage.getItem('selectedCashbookId');
        if (!selectedCashbookId) {
            showNotification('No cashbook selected.', 'error');
            return;
        }
        const pageToFetch = append ? nextTransactionPage : 0;
        if (!append) {
            nextTransactionPage = 0;
        }

        const res = await fetchWithAuth(
            `${API_BASE}/cashbook/transactions?cashbookId=${selectedCashbookId}&page=${pageToFetch}&size=${pageSize}`
        );
        if (res.ok) {
            const data = await res.json();
            const transactions = Array.isArray(data.content) ? data.content : (Array.isArray(data) ? data : []);
            const pageInfo = data.page;

            if (!append) {
                transactionsContainer.innerHTML = '';
            }
            
            // Filter transactions (API uses Credit/Debit; tabs use credit/debit)
            const filteredTransactions = transactions.filter(tx => {
                if (currentFilter === 'all') return true;
                const want = currentFilter === 'credit' ? 'Credit' : currentFilter === 'debit' ? 'Debit' : currentFilter;
                return tx.type === want;
            });
            
            filteredTransactions.forEach(tx => {
                const transactionElement = createTransactionElement(tx);
                transactionsContainer.appendChild(transactionElement);
            });
            
            if (pageInfo) {
                hasMore = pageInfo.hasNext === true;
                nextTransactionPage = pageInfo.number + 1;
            } else if (data.totalPages !== undefined) {
                hasMore = pageToFetch + 1 < data.totalPages;
                nextTransactionPage = pageToFetch + 1;
            } else {
                hasMore = transactions.length === pageSize;
                nextTransactionPage = pageToFetch + 1;
            }
            
            loadMoreContainer.style.display = hasMore ? 'block' : 'none';
        } else {
            const errorMessage = await parseErrorResponse(res, 'Failed to load transactions');
            showNotification(errorMessage, 'error');
        }
    } catch (error) {
        console.error('Error loading transactions:', error);
        showNotification('Failed to load transactions', 'error');
    } finally {
        loading = false;
    }
}


async function exportFile() {
    try {
        const selectedCashbookId = localStorage.getItem('selectedCashbookId');
        if (!selectedCashbookId) {
            showNotification('No cashbook selected.', 'error');
            return;
        }

        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const res = await fetchWithAuth(`${API_BASE}/cashbook/export?cashbookId=${selectedCashbookId}`, {
            headers: { 'X-Timezone': tz }
        });
        
        if (res.ok) {
            // Get the filename from Content-Disposition header if available
            const contentDisposition = res.headers.get('Content-Disposition');
            let filename = 'export.xlsx'; // default filename
            
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
                if (filenameMatch && filenameMatch[1]) {
                    filename = filenameMatch[1].replace(/['"]/g, '');
                }
            }
            
            // Get the blob from the response
            const blob = await res.blob();
            
            // Create a download link
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            
            // Trigger the download
            document.body.appendChild(link);
            link.click();
            
            // Clean up
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            showNotification('File downloaded successfully!', 'success');
        } else {
            const errorMessage = await parseErrorResponse(res, 'Failed to export file');
            showNotification(errorMessage, 'error');
        }
    } catch (error) {
        console.error('Error exporting file:', error);
        showNotification('Network error. Please check your connection.', 'error');
    }
}



function loadMoreTransactions() {
    loadTransactions(true);
}

function createTransactionElement(tx) {
    const isIncome = tx.type === 'Credit';
    const amount = parseFloat(tx.amount);
    
    // Get balance after transaction
    const balanceAfter = tx.balanceAfter || 0;
    const formattedBalance = `$${parseFloat(balanceAfter).toFixed(2)}`;
    
    // Format the transaction date
    let timestamp = tx.updatedDate;
    let formattedDate = formatDateWithTime(timestamp);
    
    const element = document.createElement('div');
    element.className = 'transaction-item';
    element.innerHTML = `
        <div class="transaction-left">
            <div class="transaction-icon ${isIncome ? 'Credit' : 'Debit'}">
                <i class="fas ${isIncome ? 'fa-arrow-up' : 'fa-arrow-down'}"></i>
            </div>
            <div class="transaction-details">
                <h4>${tx.description}</h4>
                <p>${getCategoryName(tx.category || 'general')}</p>
                <p class="transaction-date-small">${formattedDate}</p>
            </div>
        </div>
        <div class="transaction-right">
            <div class="transaction-amount ${isIncome ? 'income' : 'expense'}">
                $${amount.toFixed(2)}
            </div>
            <div class="transaction-date">${formattedBalance}</div>
        </div>
    `;
    
    element.onclick = () => {
        window.location.href = `edit-transaction.html?id=${tx.id}`;
    };
    
    return element;
}

function getCategoryName(category) {
    const categories = {
        general: 'General',
        food: 'Food & Dining',
        transport: 'Transportation',
        shopping: 'Shopping',
        entertainment: 'Entertainment',
        bills: 'Bills & Utilities',
        salary: 'Salary',
        freelance: 'Freelance',
        investment: 'Investment',
        other: 'Other'
    };
    return categories[category] || 'General';
}
