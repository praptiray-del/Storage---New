// Authentication module for the file upload app
class AuthManager {
    constructor(supabaseUrl, apiKey) {
        this.supabaseUrl = supabaseUrl;
        this.apiKey = apiKey;
        this.currentUser = null;
        this.isAuthenticated = false;
        
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
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            try {
                this.currentUser = JSON.parse(savedUser);
                this.isAuthenticated = true;
                this.showAuthenticatedState();
            } catch (error) {
                console.error('Error parsing saved user:', error);
                localStorage.removeItem('currentUser');
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
            const user = await this.authenticateUser(username, password);
            if (user) {
                this.currentUser = user;
                this.isAuthenticated = true;
                localStorage.setItem('currentUser', JSON.stringify(user));
                this.showAuthenticatedState();
                this.showMessage('Login successful!', 'success');
            } else {
                this.showMessage('Invalid username or password', 'error');
            }
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
            const user = await this.registerUser(username, email, password);
            if (user) {
                this.showMessage('Registration successful! Please login.', 'success');
                this.showLoginForm();
                this.clearRegisterForm();
            }
        } catch (error) {
            console.error('Registration error:', error);
            if (error.message.includes('already exists')) {
                this.showMessage('Username or email already exists', 'error');
            } else {
                this.showMessage('Registration failed. Please try again.', 'error');
            }
        }
    }

    async authenticateUser(username, password) {
        try {
            // Hash the password (in a real app, you'd use a proper hashing library)
            const passwordHash = await this.hashPassword(password);
            
            const response = await fetch(`${this.supabaseUrl}/rest/v1/users?username=eq.${username}&password_hash=eq.${passwordHash}&select=*`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'apikey': this.apiKey,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const users = await response.json();
            return users.length > 0 ? users[0] : null;
        } catch (error) {
            console.error('Authentication error:', error);
            throw error;
        }
    }

    async registerUser(username, email, password) {
        try {
            // Check if username or email already exists
            const existingUser = await this.checkUserExists(username, email);
            if (existingUser) {
                throw new Error('User already exists');
            }

            // Hash the password
            const passwordHash = await this.hashPassword(password);
            
            const response = await fetch(`${this.supabaseUrl}/rest/v1/users`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'apikey': this.apiKey,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify({
                    username: username,
                    email: email,
                    password_hash: passwordHash
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Registration failed: ${errorText}`);
            }

            return { username, email, id: Date.now() }; // Return user object
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    }

    async checkUserExists(username, email) {
        try {
            const response = await fetch(`${this.supabaseUrl}/rest/v1/users?or=(username.eq.${username},email.eq.${email})&select=username,email`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'apikey': this.apiKey,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const users = await response.json();
            return users.length > 0;
        } catch (error) {
            console.error('Check user exists error:', error);
            return false;
        }
    }

    async hashPassword(password) {
        // Simple hash function (in production, use a proper library like bcrypt)
        const encoder = new TextEncoder();
        const data = encoder.encode(password + 'salt'); // Add salt
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    logout() {
        this.currentUser = null;
        this.isAuthenticated = false;
        localStorage.removeItem('currentUser');
        this.showUnauthenticatedState();
        this.showMessage('Logged out successfully', 'success');
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

    isUserAuthenticated() {
        return this.isAuthenticated;
    }
}
