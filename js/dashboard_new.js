import { getJwtToken, fetchWithAuth, API_BASE, showNotification, fetchWithAuthAndNotify, logoutAndRedirect, requireLogin, navigate } from './common.js';
requireLogin();

// DOM Elements
const logoutBtn = document.getElementById('logoutBtn');
const quickIncomeBtn = document.getElementById('quickIncomeBtn');
const quickExpenseBtn = document.getElementById('quickExpenseBtn');
const quickTransferBtn = document.getElementById('quickTransferBtn');
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

// State
let currentTransactionType = 'credit';
let balanceVisible = true;
let currentFilter = 'all';
let currentPage = 0;
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
    
    // Quick action buttons
    quickIncomeBtn.onclick = () => showQuickAddForm('credit');
    quickExpenseBtn.onclick = () => showQuickAddForm('debit');
    quickTransferBtn.onclick = () => navigate('credit.html'); // For now, redirect to credit page
    
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
    const category = document.getElementById('quickCategory').value;
    
    if (!amount || !description) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    submitBtn.classList.add('loading');
    
    try {
        const res = await fetchWithAuthAndNotify(
            `${API_BASE}/cashbook/${currentTransactionType}?amount=${amount}&description=${description}&category=${category}`,
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
    currentPage = 0;
    hasMore = true;
    transactionsContainer.innerHTML = '';
    loadTransactions();
}

async function loadBalance() {
    try {
        const res = await fetchWithAuth(`${API_BASE}/cashbook/balance`);
        if (res.ok) {
            const data = await res.json();
            const balance = data.balance || data;
            
            if (balanceVisible) {
                balanceDisplay.textContent = `$${parseFloat(balance).toFixed(2)}`;
                balanceDisplay.classList.remove('hidden');
            }
        }
    } catch (error) {
        console.error('Error loading balance:', error);
    }
}

async function loadMonthlyStats() {
    try {
        // You might need to implement these endpoints or calculate from transactions
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        
        // For now, we'll calculate from transactions
        const res = await fetchWithAuth(`${API_BASE}/cashbook/transactions?page=0&size=100`);
        if (res.ok) {
            const data = await res.json();
            const transactions = data.content || data;
            
            let income = 0;
            let expense = 0;
            
            transactions.forEach(tx => {
                const txDate = new Date(tx.timestamp || tx.createdDate);
                if (txDate >= firstDay && txDate <= lastDay) {
                    if (tx.type === 'credit') {
                        income += parseFloat(tx.amount);
                    } else {
                        expense += parseFloat(tx.amount);
                    }
                }
            });
            
            monthlyIncome.textContent = `+$${income.toFixed(2)}`;
            monthlyExpense.textContent = `-$${expense.toFixed(2)}`;
        }
    } catch (error) {
        console.error('Error loading monthly stats:', error);
    }
}

async function loadTransactions(append = false) {
    if (loading || (!hasMore && append)) return;
    
    loading = true;
    
    try {
        const res = await fetchWithAuth(`${API_BASE}/cashbook/transactions?page=${currentPage}&size=${pageSize}`);
        if (res.ok) {
            const data = await res.json();
            const transactions = data.content || data;
            
            if (!append) {
                transactionsContainer.innerHTML = '';
            }
            
            // Filter transactions
            const filteredTransactions = transactions.filter(tx => {
                if (currentFilter === 'all') return true;
                return tx.type === currentFilter;
            });
            
            filteredTransactions.forEach(tx => {
                const transactionElement = createTransactionElement(tx);
                transactionsContainer.appendChild(transactionElement);
            });
            
            // Check if there are more transactions
            if (data.totalPages !== undefined) {
                hasMore = currentPage + 1 < data.totalPages;
            } else {
                hasMore = transactions.length === pageSize;
            }
            
            // Show/hide load more button
            loadMoreContainer.style.display = hasMore ? 'block' : 'none';
            
            if (append && hasMore) {
                currentPage++;
            } else if (!append) {
                currentPage = hasMore ? 1 : 0;
            }
        }
    } catch (error) {
        console.error('Error loading transactions:', error);
        showNotification('Failed to load transactions', 'error');
    } finally {
        loading = false;
    }
}

function loadMoreTransactions() {
    loadTransactions(true);
}

function createTransactionElement(tx) {
    const isIncome = tx.type === 'credit';
    const amount = parseFloat(tx.amount);
    
    let timestamp = tx.timestamp || tx.createdDate || '';
    let formattedDate = '';
    if (timestamp) {
        try {
            const date = new Date(timestamp);
            formattedDate = date.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
            });
        } catch (e) {
            formattedDate = 'Unknown';
        }
    }
    
    const element = document.createElement('div');
    element.className = 'transaction-item';
    element.innerHTML = `
        <div class="transaction-left">
            <div class="transaction-icon ${isIncome ? 'income' : 'expense'}">
                <i class="fas ${isIncome ? 'fa-arrow-down' : 'fa-arrow-up'}"></i>
            </div>
            <div class="transaction-details">
                <h4>${tx.description}</h4>
                <p>${getCategoryName(tx.category || 'general')}</p>
            </div>
        </div>
        <div class="transaction-right">
            <div class="transaction-amount ${isIncome ? 'income' : 'expense'}">
                ${isIncome ? '+' : '-'}$${amount.toFixed(2)}
            </div>
            <div class="transaction-date">${formattedDate}</div>
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
