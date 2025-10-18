// Authentication module for the file upload app
// This module only handles UI and calls backend API endpoints
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.isAuthenticated = false;
        this.sessionToken = null;
        
        this.initializeElements();
        this.bindEvents();
        this.checkAuthStatus();
    }

    initializeElements() {
        // Auth forms
        this.authSection = document.getElementById('authSection');
        this.loginForm = document.getElementById('loginForm');
        this.registerForm = document.getElementById('registerForm');
        this.loginFormElement = document.getElementById('loginFormElement');
        this.registerFormElement = document.getElementById('registerFormElement');
        
        // User dashboard
        this.userDashboard = document.getElementById('userDashboard');
        this.userDisplayName = document.getElementById('userDisplayName');
        this.logoutBtn = document.getElementById('logoutBtn');
        
        // Form switches
        this.showRegister = document.getElementById('showRegister');
        this.showLogin = document.getElementById('showLogin');
        
        // Upload section
        this.uploadSection = document.querySelector('.upload-section');
    }

    bindEvents() {
        // Form submissions
        this.loginFormElement.addEventListener('submit', (e) => this.handleLogin(e));
        this.registerFormElement.addEventListener('submit', (e) => this.handleRegister(e));
        
        // Form switches
        this.showRegister.addEventListener('click', (e) => this.showRegisterForm(e));
        this.showLogin.addEventListener('click', (e) => this.showLoginForm(e));
        
        // Logout
        this.logoutBtn.addEventListener('click', () => this.logout());
    }

    checkAuthStatus() {
        // Check for saved session
        const savedSession = localStorage.getItem('sessionToken');
        const savedUser = localStorage.getItem('currentUser');
        
        if (savedSession && savedUser) {
            try {
                this.sessionToken = savedSession;
                this.currentUser = JSON.parse(savedUser);
                this.isAuthenticated = true;
                this.showAuthenticatedState();
            } catch (error) {
                console.error('Error parsing saved user:', error);
                this.clearSession();
            }
        } else {
            this.showUnauthenticatedState();
        }
    }

    showAuthenticatedState() {
        this.authSection.style.display = 'none';
        this.userDashboard.style.display = 'block';
        this.uploadSection.classList.remove('hidden');
        this.userDisplayName.textContent = this.currentUser.username;
    }

    showUnauthenticatedState() {
        this.authSection.style.display = 'block';
        this.userDashboard.style.display = 'none';
        this.uploadSection.classList.add('hidden');
        this.showLoginForm();
    }

    showLoginForm(e) {
        if (e) e.preventDefault();
        this.loginForm.style.display = 'block';
        this.registerForm.style.display = 'none';
        this.clearMessages();
    }

    showRegisterForm(e) {
        if (e) e.preventDefault();
        this.loginForm.style.display = 'none';
        this.registerForm.style.display = 'block';
        this.clearMessages();
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;
        
        if (!username || !password) {
            this.showMessage('Please fill in all fields', 'error');
            return;
        }

        try {
            // Call backend API
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (!response.ok) {
                this.showMessage(data.error || 'Login failed', 'error');
                return;
            }

            // Store session
            this.sessionToken = data.sessionToken;
            this.currentUser = data.user;
            this.isAuthenticated = true;
            
            localStorage.setItem('sessionToken', this.sessionToken);
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            
            this.showAuthenticatedState();
            this.showMessage('Login successful!', 'success');
            
        } catch (error) {
            console.error('Login error:', error);
            this.showMessage('Login failed. Please try again.', 'error');
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        
        const username = document.getElementById('registerUsername').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (!username || !email || !password || !confirmPassword) {
            this.showMessage('Please fill in all fields', 'error');
            return;
        }

        if (password !== confirmPassword) {
            this.showMessage('Passwords do not match', 'error');
            return;
        }

        if (password.length < 6) {
            this.showMessage('Password must be at least 6 characters long', 'error');
            return;
        }

        try {
            // Call backend API
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                this.showMessage(data.error || 'Registration failed', 'error');
                return;
            }

            this.showMessage('Registration successful! Please login.', 'success');
            this.showLoginForm();
            this.clearRegisterForm();
            
        } catch (error) {
            console.error('Registration error:', error);
            this.showMessage('Registration failed. Please try again.', 'error');
        }
    }

    logout() {
        // Call backend API (optional - fire and forget)
        if (this.sessionToken) {
            fetch('/api/auth/logout', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.sessionToken}`
                }
            }).catch(err => console.error('Logout API call failed:', err));
        }

        this.clearSession();
        this.showUnauthenticatedState();
        this.showMessage('Logged out successfully', 'success');
    }

    clearSession() {
        this.currentUser = null;
        this.isAuthenticated = false;
        this.sessionToken = null;
        localStorage.removeItem('sessionToken');
        localStorage.removeItem('currentUser');
    }

    showMessage(message, type) {
        this.clearMessages();
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `auth-message ${type}`;
        messageDiv.textContent = message;
        
        const currentForm = this.loginForm.style.display !== 'none' ? this.loginForm : this.registerForm;
        currentForm.insertBefore(messageDiv, currentForm.firstChild);
        
        // Auto-remove success messages after 3 seconds
        if (type === 'success') {
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.parentNode.removeChild(messageDiv);
                }
            }, 3000);
        }
    }

    clearMessages() {
        const messages = document.querySelectorAll('.auth-message');
        messages.forEach(msg => msg.remove());
    }

    clearRegisterForm() {
        document.getElementById('registerUsername').value = '';
        document.getElementById('registerEmail').value = '';
        document.getElementById('registerPassword').value = '';
        document.getElementById('confirmPassword').value = '';
    }

    getCurrentUser() {
        return this.currentUser;
    }

    getSessionToken() {
        return this.sessionToken;
    }

    isUserAuthenticated() {
        return this.isAuthenticated;
    }
}
