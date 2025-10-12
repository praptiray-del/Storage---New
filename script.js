class FileUploadApp {
    constructor() {
        this.supabaseUrl = 'https://pevqdguawonvpvnqqpnp.supabase.co';
        this.apiKey = ''; // Will be set from environment or user input
        this.selectedFiles = [];
        this.authManager = null; // Will be initialized after API key is loaded
        this.dodoPayments = null; // Will be initialized after API key is loaded
        
        this.initializeElements();
        this.bindEvents();
        this.loadApiKey();
        this.handlePaymentCallback();
    }

    initializeElements() {
        this.uploadArea = document.getElementById('uploadArea');
        this.fileInput = document.getElementById('fileInput');
        this.uploadBtn = document.getElementById('uploadBtn');
        this.fileInfo = document.getElementById('fileInfo');
        this.fileList = document.getElementById('fileList');
        this.submitBtn = document.getElementById('submitBtn');
        this.progressSection = document.getElementById('progressSection');
        this.progressFill = document.getElementById('progressFill');
        this.progressText = document.getElementById('progressText');
        this.resultSection = document.getElementById('resultSection');
        this.successMessage = document.getElementById('successMessage');
        this.errorMessage = document.getElementById('errorMessage');
        this.errorText = document.getElementById('errorText');
        this.resetBtn = document.getElementById('resetBtn');
    }

    bindEvents() {
        // File input events
        this.uploadBtn.addEventListener('click', () => this.fileInput.click());
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e.target.files));

        // Drag and drop events
        this.uploadArea.addEventListener('click', () => this.fileInput.click());
        this.uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.uploadArea.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        this.uploadArea.addEventListener('drop', (e) => this.handleDrop(e));

        // Submit and reset events
        this.submitBtn.addEventListener('click', () => this.uploadFiles());
        this.resetBtn.addEventListener('click', () => this.resetApp());
        
        // Payment events
        const upgradeBtn = document.getElementById('upgradeBtn');
        if (upgradeBtn) {
            upgradeBtn.addEventListener('click', () => this.showCheckoutForm());
        }

        // Checkout form events
        const cancelCheckoutBtn = document.getElementById('cancelCheckout');
        if (cancelCheckoutBtn) {
            cancelCheckoutBtn.addEventListener('click', () => this.hideCheckoutForm());
        }

        const checkoutForm = document.getElementById('checkoutForm');
        if (checkoutForm) {
            checkoutForm.addEventListener('submit', (e) => this.handleCheckoutSubmit(e));
        }
    }

    loadApiKey() {
        // Try to get API key from environment variables first
        // This will work when deployed on Render or other platforms
        this.apiKey = this.getApiKeyFromEnvironment();
        
        // If no environment variable is found, prompt user
        if (!this.apiKey) {
            this.promptForApiKey();
        }
        
        // Initialize authentication manager after API key is loaded
        if (this.apiKey) {
            console.log('Initializing AuthManager with API key:', this.apiKey.substring(0, 20) + '...');
            this.authManager = new AuthManager(this.supabaseUrl, this.apiKey);
            this.dodoPayments = new DodoPayments(this.supabaseUrl, this.apiKey, this.authManager);
        } else {
            console.error('❌ No API key available for authentication');
        }
    }

    getApiKeyFromEnvironment() {
        // Check for environment variables that might be available
        // These are common ways environment variables are exposed in web apps
        
        // Method 1: Check for global variables (set by server.js)
        if (typeof window !== 'undefined') {
            if (window.SUPABASE_ANON_KEY && window.SUPABASE_ANON_KEY.trim() !== '') {
                console.log('Found API key via window.SUPABASE_ANON_KEY');
                return window.SUPABASE_ANON_KEY;
            }
            if (window.SUPABASE_SERVICE_ROLE_KEY && window.SUPABASE_SERVICE_ROLE_KEY.trim() !== '') {
                console.log('Found API key via window.SUPABASE_SERVICE_ROLE_KEY');
                return window.SUPABASE_SERVICE_ROLE_KEY;
            }
        }
        
        // Method 2: Check for meta tags (set by server.js)
        if (typeof document !== 'undefined') {
            const metaKey = document.querySelector('meta[name="supabase-api-key"]');
            if (metaKey && metaKey.getAttribute('content') && metaKey.getAttribute('content').trim() !== '') {
                console.log('Found API key via meta tag');
                return metaKey.getAttribute('content');
            }
        }
        
        // Method 3: Check if running in a server environment (Node.js)
        if (typeof process !== 'undefined' && process.env) {
            if (process.env.SUPABASE_ANON_KEY && process.env.SUPABASE_ANON_KEY.trim() !== '') {
                console.log('Found API key via process.env.SUPABASE_ANON_KEY');
                return process.env.SUPABASE_ANON_KEY;
            }
            if (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.SUPABASE_SERVICE_ROLE_KEY.trim() !== '') {
                console.log('Found API key via process.env.SUPABASE_SERVICE_ROLE_KEY');
                return process.env.SUPABASE_SERVICE_ROLE_KEY;
            }
        }
        
        console.log('No API key found in environment variables');
        return null;
    }

    promptForApiKey() {
        const apiKey = prompt('Please enter your Supabase API key:');
        if (apiKey) {
            this.apiKey = apiKey;
        } else {
            this.showError('API key is required to upload files. Please set SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY environment variable.');
        }
    }

    handleDragOver(e) {
        e.preventDefault();
        this.uploadArea.classList.add('dragover');
    }

    handleDragLeave(e) {
        e.preventDefault();
        this.uploadArea.classList.remove('dragover');
    }

    handleDrop(e) {
        e.preventDefault();
        this.uploadArea.classList.remove('dragover');
        const files = e.dataTransfer.files;
        this.handleFileSelect(files);
    }

    handleFileSelect(files) {
        this.selectedFiles = Array.from(files);
        this.displaySelectedFiles();
        this.showFileInfo();
    }

    displaySelectedFiles() {
        this.fileList.innerHTML = '';
        
        this.selectedFiles.forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            
            const icon = this.getFileIcon(file.type);
            const size = this.formatFileSize(file.size);
            const sanitizedName = this.sanitizeFileName(file.name);
            
            fileItem.innerHTML = `
                <i class="fas ${icon} file-icon"></i>
                <div class="file-details">
                    <div class="file-name">${file.name}</div>
                    <div class="file-name-sanitized">Will be saved as: ${sanitizedName}</div>
                    <div class="file-size">${size}</div>
                </div>
            `;
            
            this.fileList.appendChild(fileItem);
        });
    }

    getFileIcon(fileType) {
        if (fileType.startsWith('image/')) return 'fa-image';
        if (fileType.startsWith('video/')) return 'fa-video';
        if (fileType.includes('pdf')) return 'fa-file-pdf';
        if (fileType.includes('text/')) return 'fa-file-alt';
        if (fileType.includes('audio/')) return 'fa-file-audio';
        if (fileType.includes('zip') || fileType.includes('rar')) return 'fa-file-archive';
        return 'fa-file';
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    sanitizeFileName(fileName) {
        // Remove or replace characters that are not allowed in Supabase storage keys
        return fileName
            .replace(/[^a-zA-Z0-9._-]/g, '_')  // Replace special chars with underscore
            .replace(/_{2,}/g, '_')            // Replace multiple underscores with single
            .replace(/^_|_$/g, '')             // Remove leading/trailing underscores
            .toLowerCase()                     // Convert to lowercase for consistency
            .substring(0, 100);                // Limit length to prevent issues
    }

    showFileInfo() {
        this.fileInfo.style.display = 'block';
        this.progressSection.style.display = 'none';
        this.resultSection.style.display = 'none';
    }

    async uploadFiles() {
        if (!this.apiKey) {
            this.showError('API key is required. Please set SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY environment variable.');
            return;
        }

        if (!this.authManager || !this.authManager.isUserAuthenticated()) {
            this.showError('Please login to upload files.');
            return;
        }

        if (this.selectedFiles.length === 0) {
            this.showError('Please select files to upload.');
            return;
        }

        this.showProgress();
        this.submitBtn.disabled = true;

        try {
            // First, ensure the bucket exists
            await this.ensureBucketExists();
            
            for (let i = 0; i < this.selectedFiles.length; i++) {
                const file = this.selectedFiles[i];
                await this.uploadSingleFile(file, i + 1, this.selectedFiles.length);
            }
            
            this.showSuccess();
        } catch (error) {
            console.error('Upload error:', error);
            
            // Show specific error message for different error types
            if (error.message.includes('not found')) {
                this.showError(`Storage bucket not found. Please create a bucket named "uploads" in your Supabase dashboard. Go to Storage → Buckets → New Bucket.`);
            } else if (error.message.includes('row-level security policy')) {
                this.showError(`Upload blocked by security policy. Please check your Supabase storage policies. Go to Storage → Policies and allow anon access to the uploads bucket.`);
            } else if (error.message.includes('Unauthorized')) {
                this.showError(`Upload unauthorized. Please check your Supabase storage policies. Go to Storage → Policies and create a policy allowing anon uploads.`);
            } else {
                this.showError(`Upload failed: ${error.message}`);
            }
        } finally {
            this.submitBtn.disabled = false;
        }
    }

    async ensureBucketExists() {
        const bucketName = 'uploads';
        const bucketUrl = `${this.supabaseUrl}/storage/v1/bucket/${bucketName}`;
        
        try {
            // Check if bucket exists
            const response = await fetch(bucketUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`
                }
            });

            if (response.status === 404) {
                console.error('❌ Bucket "uploads" not found!');
                console.log('📋 Please create the bucket manually:');
                console.log('1. Go to your Supabase Dashboard');
                console.log('2. Navigate to Storage → Buckets');
                console.log('3. Click "New Bucket"');
                console.log('4. Name it "uploads" and make it public');
                console.log('5. Click "Create bucket"');
                
                throw new Error('Storage bucket "uploads" not found. Please create it manually in your Supabase dashboard.');
            } else if (response.status === 400) {
                console.warn('⚠️ Bucket check returned 400 - this might be due to RLS policies');
                console.log('📋 Please check your storage policies:');
                console.log('1. Go to Storage → Policies');
                console.log('2. Make sure there are policies allowing anon access');
                console.log('3. Or disable RLS for storage.objects table');
                // Continue anyway - the upload might still work
            } else if (!response.ok) {
                console.warn('Could not check bucket status:', response.status);
                // Continue anyway
            } else {
                console.log('✅ Bucket "uploads" exists');
            }
        } catch (error) {
            if (error.message.includes('not found')) {
                throw error; // Re-throw bucket not found errors
            }
            console.warn('Error checking bucket:', error);
            // Continue anyway for other errors
        }
    }

    async uploadSingleFile(file, currentIndex, totalFiles) {
        // Generate unique filename with timestamp and sanitize it
        const timestamp = Date.now();
        const sanitizedOriginalName = this.sanitizeFileName(file.name);
        const fileName = `${timestamp}_${sanitizedOriginalName}`;
        
        // Use the correct Supabase storage API endpoint
        const bucketName = 'uploads'; // You can change this bucket name
        const uploadUrl = `${this.supabaseUrl}/storage/v1/object/${bucketName}/${fileName}`;
        
        console.log('Original filename:', file.name);
        console.log('Sanitized filename:', fileName);
        console.log('Uploading to:', uploadUrl);
        console.log('File size:', file.size);
        
        const response = await fetch(uploadUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': file.type || 'application/octet-stream'
            },
            body: file
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Upload error response:', errorText);
            throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
        }

        const result = await response.json();
        console.log('Upload successful:', result);

        // Track the upload in the database
        await this.trackUserUpload(file, fileName);

        // Update progress
        const progress = (currentIndex / totalFiles) * 100;
        this.updateProgress(progress, `Uploading ${currentIndex} of ${totalFiles} files...`);
        
        return result;
    }

    async trackUserUpload(file, fileName) {
        if (!this.authManager || !this.authManager.isUserAuthenticated()) {
            console.log('Skipping database tracking - user not authenticated');
            return; // Don't track if user is not authenticated
        }

        try {
            const user = this.authManager.getCurrentUser();
            console.log('Tracking upload for user:', user);
            
            const trackingData = {
                user_id: user.id,
                file_name: file.name,
                file_size: file.size,
                file_type: file.type,
                storage_path: `uploads/${fileName}`
            };
            
            console.log('Sending tracking data:', trackingData);
            
            const response = await fetch(`${this.supabaseUrl}/rest/v1/user_uploads`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'apikey': this.apiKey,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify(trackingData)
            });

            console.log('Tracking response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Failed to track upload in database:', response.status, errorText);
            } else {
                console.log('✅ Upload tracked in database successfully');
            }
        } catch (error) {
            console.error('Error tracking upload:', error);
            // Don't throw error - upload was successful, just tracking failed
        }
    }

    updateProgress(percentage, text) {
        this.progressFill.style.width = `${percentage}%`;
        this.progressText.textContent = text;
    }

    showProgress() {
        this.progressSection.style.display = 'block';
        this.resultSection.style.display = 'none';
        this.updateProgress(0, 'Preparing upload...');
    }

    showSuccess() {
        this.progressSection.style.display = 'none';
        this.resultSection.style.display = 'block';
        this.successMessage.style.display = 'block';
        this.errorMessage.style.display = 'none';
    }

    showError(message) {
        this.progressSection.style.display = 'none';
        this.resultSection.style.display = 'block';
        this.successMessage.style.display = 'none';
        this.errorMessage.style.display = 'block';
        this.errorText.textContent = message;
    }

    resetApp() {
        this.selectedFiles = [];
        this.fileInput.value = '';
        this.fileInfo.style.display = 'none';
        this.progressSection.style.display = 'none';
        this.resultSection.style.display = 'none';
        this.submitBtn.disabled = false;
    }

    showCheckoutForm() {
        const user = this.authManager ? this.authManager.getCurrentUser() : null;
        if (!user) {
            this.showError('Please login to proceed with payment.');
            return;
        }

        // Pre-fill form with user data
        document.getElementById('customerName').value = user.username || '';
        document.getElementById('customerEmail').value = user.email || '';
        
        // Show checkout form
        document.getElementById('paymentCheckout').style.display = 'block';
        
        // Scroll to checkout form
        document.getElementById('paymentCheckout').scrollIntoView({ behavior: 'smooth' });
    }

    hideCheckoutForm() {
        document.getElementById('paymentCheckout').style.display = 'none';
    }

    async handleCheckoutSubmit(e) {
        e.preventDefault();
        
        if (!this.dodoPayments) {
            this.showError('Payment system not initialized. Please refresh the page.');
            return;
        }

        try {
            // Collect form data
            const formData = new FormData(e.target);
            const checkoutData = {
                customerName: formData.get('customerName'),
                customerEmail: formData.get('customerEmail'),
                customerPhone: formData.get('customerPhone'),
                customerCountry: formData.get('customerCountry'),
                billingStreet: formData.get('billingStreet'),
                billingCity: formData.get('billingCity'),
                billingState: formData.get('billingState'),
                billingZipcode: formData.get('billingZipcode'),
                billingCountry: formData.get('billingCountry')
            };

            // Validate form data
            if (!this.validateCheckoutData(checkoutData)) {
                return;
            }

            // Disable submit button
            const submitBtn = document.getElementById('proceedPayment');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

            // Initiate payment with form data
            await this.dodoPayments.initiatePaymentWithData(checkoutData);

        } catch (error) {
            console.error('Checkout submission failed:', error);
            this.showError(`Payment failed: ${error.message}`);
            
            // Re-enable submit button
            const submitBtn = document.getElementById('proceedPayment');
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-credit-card"></i> Proceed to Payment';
        }
    }

    validateCheckoutData(data) {
        const requiredFields = [
            'customerName', 'customerEmail', 'customerPhone', 'customerCountry',
            'billingStreet', 'billingCity', 'billingState', 'billingZipcode', 'billingCountry'
        ];

        for (const field of requiredFields) {
            if (!data[field] || data[field].trim() === '') {
                this.showError(`Please fill in all required fields. Missing: ${field}`);
                return false;
            }
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.customerEmail)) {
            this.showError('Please enter a valid email address.');
            return false;
        }

        // Validate phone format (basic validation)
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        if (!phoneRegex.test(data.customerPhone.replace(/[\s\-\(\)]/g, ''))) {
            this.showError('Please enter a valid phone number.');
            return false;
        }

        return true;
    }

    async initiatePayment() {
        if (!this.dodoPayments) {
            this.showError('Payment system not initialized. Please refresh the page.');
            return;
        }

        try {
            await this.dodoPayments.initiatePayment();
        } catch (error) {
            console.error('Payment initiation failed:', error);
            this.showError(`Payment failed: ${error.message}`);
        }
    }

    handlePaymentCallback() {
        // Check if this is a payment callback
        const urlParams = new URLSearchParams(window.location.search);
        const paymentStatus = urlParams.get('payment');
        const checkoutId = urlParams.get('checkout_id');

        if (paymentStatus === 'success' && checkoutId && this.dodoPayments) {
            console.log('Payment success callback detected:', checkoutId);
            this.dodoPayments.handlePaymentSuccess(checkoutId);
            
            // Clean up URL parameters
            const newUrl = window.location.pathname;
            window.history.replaceState({}, document.title, newUrl);
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new FileUploadApp();
});

// Alternative upload method using Supabase client (if available)
class SupabaseUploader {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.supabaseUrl = 'https://pevqdguawonvpvnqqpnp.storage.supabase.co';
    }

    async uploadFile(file, bucket = 'uploads') {
        const fileName = `${Date.now()}_${file.name}`;
        
        const response = await fetch(`${this.supabaseUrl}/storage/v1/object/${bucket}/${fileName}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': file.type
            },
            body: file
        });

        if (!response.ok) {
            throw new Error(`Upload failed: ${response.statusText}`);
        }

        return response.json();
    }
}
