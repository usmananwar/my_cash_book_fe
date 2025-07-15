import { getJwtToken, fetchWithAuth, API_BASE } from './common.js';
const jwtToken = getJwtToken();


if (!jwtToken) {
    window.location.href = 'index.html';
}

const creditBtn = document.getElementById('creditBtn');
const debitBtn = document.getElementById('debitBtn');
const formSection = document.getElementById('formSection');
const logoutBtn = document.getElementById('logoutBtn');

creditBtn.onclick = () => {
    window.location.href = 'credit.html';
};
debitBtn.onclick = () => {
    window.location.href = 'debit.html';
};
logoutBtn.onclick = () => {
    localStorage.removeItem('jwtToken');
    window.location.href = 'index.html';
};

function showForm(type) {
    formSection.innerHTML = `
        <form id="${type}Form">
            <input type="number" id="${type}Amount" placeholder="${type.charAt(0).toUpperCase() + type.slice(1)} Amount" required>
            <input type="text" id="${type}Desc" placeholder="Description" required>
            <button type="submit">Add ${type.charAt(0).toUpperCase() + type.slice(1)}</button>
        </form>
    `;
    document.getElementById(`${type}Form`).onsubmit = async (e) => {
        e.preventDefault();
        const amount = document.getElementById(`${type}Amount`).value;
        const desc = document.getElementById(`${type}Desc`).value;
        const res = await fetchWithAuth(`${API_BASE}/cashbook/${type}?amount=${amount}&description=${desc}`, {
            method: 'POST'
        });
        if (res.ok) {
            loadTransactions();
            formSection.innerHTML = '';
            formSection.style.display = 'none';
        } else {
            // Operation failed. You may show a message in the UI here.
        }
    };
}


// Pagination state
let currentPage = 0;
const pageSize = 7;
let loading = false;
let hasMore = true;

async function loadTransactions(page = 0, append = false) {
    if (loading || !hasMore) return;
    loading = true;
    const res = await fetchWithAuth(`${API_BASE}/cashbook/transactions?page=${page}&size=${pageSize}`);
    if (res.ok) {
        const data = await res.json();
        // If backend returns a Page object, use content; else fallback to array
        const transactions = data.content || data;
        const tbody = document.querySelector('#transactionsTable tbody');
        if (!append) {
            tbody.innerHTML = '';
        }
        transactions.forEach(tx => {
            const tr = document.createElement('tr');
            let ts = tx.timestamp || tx.createdDate || '';
            if (ts) {
                try {
                    const d = new Date(ts);
                    ts = d.toLocaleDateString();
                } catch (e) {}
            }
            tr.innerHTML = `<td>${tx.description}</td><td>${tx.type}</td><td>${tx.amount}</td><td>${ts}</td>`;
            tr.onclick = () => {
                window.location.href = `edit-transaction.html?id=${tx.id}`;
            };
            tbody.appendChild(tr);
        });
        // If backend returns a Page object, check if last page
        if (data.totalPages !== undefined) {
            hasMore = currentPage + 1 < data.totalPages;
        } else {
            hasMore = transactions.length === pageSize;
        }
        if (!hasMore) {
            // Add 'No more rows' message as a full-width row
            const tr = document.createElement('tr');
            tr.innerHTML = `<td colspan="4" style="text-align:center;color:#888;">No more rows</td>`;
            tbody.appendChild(tr);
        }
        if (hasMore) currentPage++;
    } else {
        hasMore = false;
        // Show 'No more rows' if fetch fails and table is empty
        const tbody = document.querySelector('#transactionsTable tbody');
        if (!tbody.innerHTML.trim()) {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td colspan="4" style="text-align:center;color:#888;">No more rows</td>`;
            tbody.appendChild(tr);
        }
    }
    loading = false;
}

async function loadBalance() {
    const res = await fetchWithAuth(`${API_BASE}/cashbook/balance`);
    if (res.ok) {
        const balance = await res.json();
        document.getElementById('balanceDisplay').innerHTML = `Balance: <span style="color:#2e7d32;">${balance}</span>`;
    }
}


loadBalance();
loadTransactions();

// Infinite scroll for transactions table
const table = document.getElementById('transactionsTable');
table.parentElement.addEventListener('scroll', async function () {
    const container = this;
    if (container.scrollTop + container.clientHeight >= container.scrollHeight - 10) {
        await loadTransactions(currentPage, true);
    }
});
