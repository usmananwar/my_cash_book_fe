import { 
    getJwtToken, 
    fetchWithAuth, 
    API_BASE, 
    showNotification, 
    fetchWithAuthAndNotify, 
    logoutAndRedirect, 
    requireLogin, 
    navigate, 
    formatDateWithTime, 
    parseErrorResponse, 
    setButtonLoading 
} from './common.js';

// DOM Elements
const profileForm = document.getElementById('profileForm');
const passwordForm = document.getElementById('passwordForm');
const backBtn = document.getElementById('backBtn');
const logoutBtn = document.getElementById('logoutBtn');
const updateBtn = document.getElementById('updateBtn');
const changePasswordBtn = document.getElementById('changePasswordBtn');

// Form fields
const firstNameInput = document.getElementById('firstName');
const lastNameInput = document.getElementById('lastName');
const emailInput = document.getElementById('email');
const phoneInput = document.getElementById('phone');
const dateOfBirthInput = document.getElementById('dateOfBirth');

// Password fields
const currentPasswordInput = document.getElementById('currentPassword');
const newPasswordInput = document.getElementById('newPassword');
const confirmPasswordInput = document.getElementById('confirmPassword');

// Info elements - removed since Account Information section is removed
// const memberSinceElement = document.getElementById('memberSince');
// const lastLoginElement = document.getElementById('lastLogin');
// const totalCashbooksElement = document.getElementById('totalCashbooks');

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
    if (!requireLogin()) return;
    
    await loadUserProfile();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    backBtn.addEventListener('click', () => navigate('cashbooks.html'));
    logoutBtn.addEventListener('click', logoutAndRedirect);
    profileForm.addEventListener('submit', handleProfileUpdate);
    passwordForm.addEventListener('submit', handlePasswordChange);
    
    // Password confirmation validation
    confirmPasswordInput.addEventListener('input', validatePasswordMatch);
}

// Load user profile data
async function loadUserProfile() {
    try {
        const response = await fetchWithAuth(`${API_BASE}/auth/profile`);
        
        if (response.ok) {
            const userData = await response.json();
            populateProfileForm(userData);
        } else {
            const errorMessage = await parseErrorResponse(response, 'Failed to load profile');
            showNotification(errorMessage, 'error');
        }
    } catch (error) {
        console.error('Error loading profile:', error);
        showNotification('Failed to load profile data', 'error');
    }
}

// Populate form with user data
function populateProfileForm(userData) {
    firstNameInput.value = userData.firstName || '';
    lastNameInput.value = userData.lastName || '';
    emailInput.value = userData.email || '';
    phoneInput.value = userData.phone || '';
    
    // Format date for input field (YYYY-MM-DD)
    if (userData.dateOfBirth) {
        const date = new Date(userData.dateOfBirth);
        dateOfBirthInput.value = date.toISOString().split('T')[0];
    }
}

// Handle profile update
async function handleProfileUpdate(event) {
    event.preventDefault();
    
    const formData = new FormData(profileForm);
    const profileData = {
        firstName: formData.get('firstName').trim(),
        lastName: formData.get('lastName').trim(),
        phone: formData.get('phone').trim(),
        dateOfBirth: formData.get('dateOfBirth') || null
    };
    
    // Validation
    if (!profileData.firstName || !profileData.lastName) {
        showNotification('First name and last name are required', 'error');
        return;
    }
    
    setButtonLoading(updateBtn, true);
    
    try {
        const response = await fetchWithAuthAndNotify(
            `${API_BASE}/auth/profile`,
            {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profileData)
            },
            'Profile updated successfully! ✨',
            null,
            false
        );
        
        if (response.ok) {
            showNotification('Profile updated successfully! ✨', 'success');
        } else {
            const errorMessage = await parseErrorResponse(response, 'Failed to update profile');
            showNotification(errorMessage, 'error');
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        showNotification('Failed to update profile. Please try again.', 'error');
    } finally {
        setButtonLoading(updateBtn, false);
    }
}

// Handle password change
async function handlePasswordChange(event) {
    event.preventDefault();
    
    const currentPassword = currentPasswordInput.value.trim();
    const newPassword = newPasswordInput.value.trim();
    const confirmPassword = confirmPasswordInput.value.trim();
    
    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
        showNotification('All password fields are required', 'error');
        return;
    }
    
    if (newPassword.length < 6) {
        showNotification('New password must be at least 6 characters long', 'error');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showNotification('New passwords do not match', 'error');
        return;
    }
    
    if (currentPassword === newPassword) {
        showNotification('New password must be different from current password', 'error');
        return;
    }
    
    setButtonLoading(changePasswordBtn, true);
    
    try {
        const response = await fetchWithAuthAndNotify(
            `${API_BASE}/user/change-password`,
            {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPassword,
                    newPassword
                })
            },
            'Password changed successfully! 🔐',
            null,
            false
        );
        
        if (response.ok) {
            showNotification('Password changed successfully! 🔐', 'success');
            passwordForm.reset();
        } else {
            const errorMessage = await parseErrorResponse(response, 'Failed to change password');
            showNotification(errorMessage, 'error');
        }
    } catch (error) {
        console.error('Error changing password:', error);
        showNotification('Failed to change password. Please try again.', 'error');
    } finally {
        setButtonLoading(changePasswordBtn, false);
    }
}

// Validate password match
function validatePasswordMatch() {
    const newPassword = newPasswordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    
    if (confirmPassword && newPassword !== confirmPassword) {
        confirmPasswordInput.setCustomValidity('Passwords do not match');
    } else {
        confirmPasswordInput.setCustomValidity('');
    }
}
