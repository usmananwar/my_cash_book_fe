import { API_BASE } from './common.js';

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js')
      .then(reg => {
        console.log('Service Worker registered:', reg);
      })
      .catch(err => {
        console.error('Service Worker registration failed:', err);
      });
  });
}
let jwtToken = null;

// PWA Install button logic
let deferredPrompt;
const installBtn = document.getElementById('installBtn');
if (installBtn) {
  installBtn.style.display = 'none';
}

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  if (installBtn) {
    installBtn.style.display = 'block';
    installBtn.addEventListener('click', async () => {
      installBtn.style.display = 'none';
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      deferredPrompt = null;
      console.log('User response to the install prompt:', outcome);
    });
  }
});

// Registration
const registerForm = document.getElementById('registerForm');
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const user = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value
    };
    const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
    });
    if (res.ok) {
        // Registration successful. You may show a message in the UI here.
        registerForm.reset();
    } else {
        // Registration failed. You may show a message in the UI here.
    }
});

// Login
const loginForm = document.getElementById('loginForm');
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const user = {
        email: document.getElementById('loginEmail').value,
        password: document.getElementById('loginPassword').value
    };
    const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
    });
    if (res.ok) {
        const data = await res.json();
        jwtToken = data.token || data.jwt || data;
        document.getElementById('auth').style.display = 'none';
        document.getElementById('main').style.display = 'block';
        loadBalance();
        loadTransactions();
    } else {
        // Login failed. You may show a message in the UI here.
    }
});

// Logout
const logoutBtn = document.getElementById('logoutBtn');
logoutBtn.addEventListener('click', () => {
    jwtToken = null;
    document.getElementById('auth').style.display = 'block';
    document.getElementById('main').style.display = 'none';
});

// Add Credit
const creditForm = document.getElementById('creditForm');
creditForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const amount = document.getElementById('creditAmount').value;
    const desc = document.getElementById('creditDesc').value;
    const res = await fetch(`${API_BASE}/cashbook/credit?amount=${amount}&description=${desc}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${jwtToken}` }
    });
    if (res.ok) {
        loadBalance();
        loadTransactions();
        creditForm.reset();
    } else {
        // Credit failed. You may show a message in the UI here.
    }
});

// Add Debit
const debitForm = document.getElementById('debitForm');
debitForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const amount = document.getElementById('debitAmount').value;
    const desc = document.getElementById('debitDesc').value;
    const res = await fetch(`${API_BASE}/cashbook/debit?amount=${amount}&description=${desc}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${jwtToken}` }
    });
    if (res.ok) {
        loadBalance();
        loadTransactions();
        debitForm.reset();
    } else {
        // Debit failed. You may show a message in the UI here.
    }
});

// Load Balance
async function loadBalance() {
    const res = await fetch(`${API_BASE}/cashbook/balance`, {
        headers: { 'Authorization': `Bearer ${jwtToken}` }
    });
    if (res.ok) {
        const balance = await res.json();
        document.getElementById('balance').textContent = balance.toFixed(2);
    }
}

// Load Transactions
async function loadTransactions() {
    const res = await fetch(`${API_BASE}/cashbook/transactions`, {
        headers: { 'Authorization': `Bearer ${jwtToken}` }
    });
    if (res.ok) {
        const transactions = await res.json();
        const tbody = document.querySelector('#transactionsTable tbody');
        tbody.innerHTML = '';
        transactions.forEach(tx => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${tx.id}</td><td>${tx.type}</td><td>${tx.amount}</td><td>${tx.balanceAfter}</td><td>${tx.description}</td>`;
            tbody.appendChild(tr);
        });
    }
}
