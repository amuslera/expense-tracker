/**
 * Simple password protection for expense tracker
 * Uses SHA-256 hashing for security
 */

(function() {
    'use strict';

    // Password hash (SHA-256 of "admin")
    // To change password, generate new hash in console:
    // Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode('yourpassword')))).map(b => b.toString(16).padStart(2, '0')).join('')
    const PASSWORD_HASH = '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918'; // "admin"

    const AUTH_STORAGE_KEY = 'expense_tracker_auth';
    const AUTH_EXPIRY_HOURS = 24; // Session expires after 24 hours

    /**
     * Check if user is authenticated
     */
    function isAuthenticated() {
        const authData = localStorage.getItem(AUTH_STORAGE_KEY);
        if (!authData) return false;

        try {
            const { hash, timestamp } = JSON.parse(authData);
            const expiryTime = timestamp + (AUTH_EXPIRY_HOURS * 60 * 60 * 1000);

            // Check if hash matches and hasn't expired
            if (hash === PASSWORD_HASH && Date.now() < expiryTime) {
                return true;
            }
        } catch (e) {
            console.error('Auth validation error:', e);
        }

        // Clear invalid auth data
        localStorage.removeItem(AUTH_STORAGE_KEY);
        return false;
    }

    /**
     * Hash password using SHA-256
     */
    async function hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
    }

    /**
     * Attempt login with password
     */
    async function login(password) {
        const hash = await hashPassword(password);

        if (hash === PASSWORD_HASH) {
            // Store auth data
            const authData = {
                hash: hash,
                timestamp: Date.now()
            };
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
            return true;
        }

        return false;
    }

    /**
     * Logout user
     */
    function logout() {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        location.reload();
    }

    /**
     * Show login modal
     */
    function showLoginModal() {
        const modal = document.createElement('div');
        modal.className = 'auth-modal';
        modal.innerHTML = `
            <div class="auth-modal__overlay"></div>
            <div class="auth-modal__content">
                <div class="auth-modal__header">
                    <div class="auth-modal__icon">
                        <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
                            <circle cx="30" cy="30" r="28" fill="url(#gradient)" />
                            <text x="30" y="40" font-size="32" text-anchor="middle" fill="white" font-weight="bold">$</text>
                            <defs>
                                <linearGradient id="gradient" x1="0" y1="0" x2="60" y2="60">
                                    <stop offset="0%" stop-color="#FF512F" />
                                    <stop offset="25%" stop-color="#F09819" />
                                    <stop offset="50%" stop-color="#FFD60A" />
                                    <stop offset="75%" stop-color="#00D2FF" />
                                    <stop offset="100%" stop-color="#3A7BD5" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                    <h2 class="auth-modal__title">Expense Tracker</h2>
                    <p class="auth-modal__subtitle">Enter password to continue</p>
                </div>
                <form class="auth-modal__form" id="authForm">
                    <div class="auth-modal__input-group">
                        <input
                            type="password"
                            id="authPassword"
                            class="auth-modal__input"
                            placeholder="Password"
                            autocomplete="current-password"
                            required
                        />
                    </div>
                    <div class="auth-modal__error" id="authError" style="display: none;">
                        ❌ Incorrect password. Please try again.
                    </div>
                    <button type="submit" class="auth-modal__button">
                        Unlock
                    </button>
                </form>
                <div class="auth-modal__footer"></div>
            </div>
        `;

        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';

        // Focus password input
        const passwordInput = document.getElementById('authPassword');
        setTimeout(() => passwordInput.focus(), 100);

        // Handle form submission
        const form = document.getElementById('authForm');
        const errorDiv = document.getElementById('authError');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const password = passwordInput.value;
            const submitButton = form.querySelector('button[type="submit"]');

            // Disable button and show loading
            submitButton.disabled = true;
            submitButton.textContent = 'Checking...';
            errorDiv.style.display = 'none';

            // Attempt login
            const success = await login(password);

            if (success) {
                // Success - remove modal and reload
                submitButton.textContent = '✓ Success!';
                submitButton.style.background = 'var(--color-success, #10B981)';

                setTimeout(() => {
                    modal.remove();
                    document.body.style.overflow = '';
                    location.reload();
                }, 500);
            } else {
                // Failed - show error
                submitButton.disabled = false;
                submitButton.textContent = 'Unlock';
                errorDiv.style.display = 'block';
                passwordInput.value = '';
                passwordInput.focus();

                // Shake animation
                modal.querySelector('.auth-modal__content').style.animation = 'shake 0.3s';
                setTimeout(() => {
                    modal.querySelector('.auth-modal__content').style.animation = '';
                }, 300);
            }
        });
    }

    /**
     * Initialize auth on page load
     */
    function init() {
        if (!isAuthenticated()) {
            // Show login modal
            setTimeout(showLoginModal, 100);
        } else {
            // User is authenticated - show content
            document.body.style.opacity = '1';

            // Add logout button to header if it exists
            const header = document.querySelector('.header');
            if (header && !document.getElementById('logoutBtn')) {
                const logoutBtn = document.createElement('button');
                logoutBtn.id = 'logoutBtn';
                logoutBtn.className = 'btn-icon btn-icon--sm';
                logoutBtn.innerHTML = `
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                        <polyline points="16 17 21 12 16 7"></polyline>
                        <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                `;
                logoutBtn.title = 'Logout';
                logoutBtn.onclick = logout;
                logoutBtn.style.position = 'absolute';
                logoutBtn.style.top = '1rem';
                logoutBtn.style.right = '1rem';
                header.style.position = 'relative';
                header.appendChild(logoutBtn);
            }
        }
    }

    // Export API
    window.ExpenseAuth = {
        isAuthenticated,
        login,
        logout,
        init
    };

    // Auto-initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
