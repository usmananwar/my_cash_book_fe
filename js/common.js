// Navigation helper
export function navigate(page, delay = 0) {
    const path = page.startsWith('/') ? page : `/html/${page}`;
    if (delay > 0) {
        setTimeout(() => {
            window.location.href = path;
        }, delay);
    } else {
        window.location.href = path;
    }
}
// Check JWT token and redirect to login if missing
export function requireLogin() {
    const jwtToken = getJwtToken();
    if (!jwtToken) {
        showNotification('Please login to continue.', 'error');
        setTimeout(() => {
            navigate('/');
        }, 2000);
        return false;
    }
    return true;
}
// Logout helper function
export function logoutAndRedirect() {
    localStorage.removeItem('jwtToken');
    showNotification('Logged out successfully! 👋', 'info');
    setTimeout(() => {
        navigate('/');
    }, 1000);
}
// API Base URL - automatically detects environment
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const isDevelopment = isLocalhost || window.location.hostname.includes('localhost');

export const API_BASE = isDevelopment
    ? 'http://localhost:9747/api'  // Development
    : 'https://api.pindrow.site/api';  // Production via Cloudflare proxy

// Alternative: You can also use environment detection for multiple environments
// export const API_BASE = (() => {
//     if (isDevelopment) return 'https://192.168.0.17:8080/api';
//     if (window.location.hostname.includes('render.com')) return 'https://your-backend.onrender.com/api';
//     return 'http://24.52.208.248:9747/api'; // Fallback
// })();

export function getJwtToken() {
    return localStorage.getItem('jwtToken');
}

export async function fetchWithAuth(url, options = {}) {
    const token = getJwtToken();
    options.headers = options.headers || {};
    if (token) {
        options.headers['Authorization'] = 'Bearer ' + token;
    }
    return fetch(url, options);
}

// Redirect to login if response is 401 Unauthorized
export async function handleAuthRedirect(res) {
    if (res.status === 401) {
        // Login session expired. You may show a message in the UI here.
        navigate('index.html');
        return true;
    }
    return false;
}

// Notification System
export function showNotification(message, type = 'info', duration = 5000) {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button class="close-btn" onclick="this.parentElement.remove()">×</button>
    `;

    // Add to DOM
    document.body.appendChild(notification);

    // Show notification
    setTimeout(() => notification.classList.add('show'), 100);

    // Auto remove after duration
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, duration);
}

// Enhanced fetchWithAuth with notifications
export async function fetchWithAuthAndNotify(url, options = {}, successMessage = null, errorMessage = null, showLoading = true) {
    const token = getJwtToken();
    options.headers = options.headers || {};
    if (token) {
        options.headers['Authorization'] = 'Bearer ' + token;
    }

    // Show loading notification
    if (showLoading) {
        showNotification('<span class="loading"></span>Processing...', 'info', 60000);
    }

    try {
        const response = await fetch(url, options);
        
        // Remove loading notification
        if (showLoading) {
            document.querySelectorAll('.notification').forEach(n => n.remove());
        }

        if (response.ok) {
            if (successMessage) {
                showNotification(successMessage, 'success');
            }
            return response;
        } else {
            // Handle different error status codes
            let message = errorMessage || 'An error occurred';
            
            if (response.status === 401) {
                message = 'Session expired. Please login again.';
                setTimeout(() => {
                    localStorage.removeItem('jwtToken');
                    navigate('index.html');
                }, 2000);
            } else if (response.status === 403) {
                message = 'Access denied. You don\'t have permission.';
            } else if (response.status === 404) {
                message = 'Resource not found.';
            } else if (response.status === 500) {
                message = 'Server error. Please try again later.';
            } else {
                try {
                    const errorData = await response.json();
                    message = errorData.message || errorData.error || message;
                } catch (e) {
                    // Use default message if JSON parsing fails
                }
            }
            
            showNotification(message, 'error');
            return response;
        }
    } catch (error) {
        colnsole.error(error);
        // Remove loading notification
        if (showLoading) {
            document.querySelectorAll('.notification').forEach(n => n.remove());
        }
        
        showNotification('Network error. Please check your connection.', 'error');
        throw error;
    }
}

// Button loading state helpers
export function setButtonLoading(button, isLoading = true) {
    if (isLoading) {
        button.classList.add('loading');
        button.disabled = true;
        button.dataset.originalText = button.textContent;
    } else {
        button.classList.remove('loading');
        button.disabled = false;
        if (button.dataset.originalText) {
            button.textContent = button.dataset.originalText;
        }
    }
}
