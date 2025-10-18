// File Upload App - Frontend (No Business Logic)
// All business logic is handled by backend API
class FileUploadApp {
    constructor() {
        this.selectedFiles = [];
        this.authManager = null;
        this.dodoPayments = null;
        
        this.initializeElements();
        this.bindEvents();
        this.initializeServices();
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
        this.uploadedFilesSection = document.getElementById('uploadedFilesSection');
        this.uploadedFilesList = document.getElementById('uploadedFilesList');
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
            upgradeBtn.addEventListener('click', () => this.initiatePayment());
        }
    }

    initializeServices() {
        // Initialize authentication manager
        this.authManager = new AuthManager();
        // Initialize Dodo Payments
        this.dodoPayments = new DodoPayments(this.authManager);
        
        // Load uploaded files if user is authenticated
        if (this.authManager && this.authManager.isUserAuthenticated()) {
            this.loadUploadedFiles();
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
            
            fileItem.innerHTML = `
                <i class="fas ${icon} file-icon"></i>
                <div class="file-details">
                    <div class="file-name">${file.name}</div>
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

    showFileInfo() {
        this.fileInfo.style.display = 'block';
        this.progressSection.style.display = 'none';
        this.resultSection.style.display = 'none';
    }

    async uploadFiles() {
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
            // Create FormData to send files to backend
            const formData = new FormData();
            
            for (let i = 0; i < this.selectedFiles.length; i++) {
                formData.append('files', this.selectedFiles[i]);
            }

            // Get session token
            const sessionToken = this.authManager.getSessionToken();
            if (!sessionToken) {
                throw new Error('No session token found. Please login again.');
            }

            // Call backend API to upload files
            const response = await fetch('/api/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${sessionToken}`
                },
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Upload failed');
            }

            const result = await response.json();
            console.log('Upload successful:', result);
            
            this.updateProgress(100, `Successfully uploaded ${result.files.length} files`);
            this.showSuccess();
            
            // Reload uploaded files list
            await this.loadUploadedFiles();
            
        } catch (error) {
            console.error('Upload error:', error);
            this.showError(`Upload failed: ${error.message}`);
        } finally {
            this.submitBtn.disabled = false;
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

        if (paymentStatus === 'success' && this.dodoPayments) {
            console.log('Payment success callback detected');
            this.dodoPayments.handlePaymentSuccess(checkoutId);
            
            // Clean up URL parameters
            const newUrl = window.location.pathname;
            window.history.replaceState({}, document.title, newUrl);
        }
    }

    async loadUploadedFiles() {
        if (!this.authManager || !this.authManager.isUserAuthenticated()) {
            return;
        }

        try {
            const sessionToken = this.authManager.getSessionToken();
            if (!sessionToken) {
                return;
            }

            const response = await fetch('/api/files', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${sessionToken}`
                }
            });

            if (!response.ok) {
                console.error('Failed to load uploaded files');
                return;
            }

            const files = await response.json();
            console.log('Loaded uploaded files:', files);
            this.displayUploadedFiles(files);
            
        } catch (error) {
            console.error('Error loading uploaded files:', error);
        }
    }

    displayUploadedFiles(files) {
        if (!this.uploadedFilesSection || !this.uploadedFilesList) {
            return;
        }

        if (!files || files.length === 0) {
            this.uploadedFilesSection.style.display = 'block';
            this.uploadedFilesList.innerHTML = '<p class="no-files-text">No files uploaded yet.</p>';
            return;
        }

        this.uploadedFilesSection.style.display = 'block';
        this.uploadedFilesList.innerHTML = '';

        files.forEach(file => {
            const fileItem = document.createElement('div');
            fileItem.className = 'uploaded-file-item';
            
            const icon = this.getFileIcon(file.fileType);
            const size = this.formatFileSize(file.fileSize);
            const date = new Date(file.uploadedAt).toLocaleString();
            
            fileItem.innerHTML = `
                <i class="fas ${icon} file-icon"></i>
                <div class="file-details">
                    <div class="file-name">${file.fileName}</div>
                    <div class="file-meta">
                        <span class="file-size">${size}</span>
                        <span class="file-date">${date}</span>
                    </div>
                </div>
                <button class="delete-file-btn" data-file-id="${file.id}" title="Delete file">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            
            // Add delete button event
            const deleteBtn = fileItem.querySelector('.delete-file-btn');
            deleteBtn.addEventListener('click', () => this.deleteFile(file.id));
            
            this.uploadedFilesList.appendChild(fileItem);
        });
    }

    async deleteFile(fileId) {
        if (!confirm('Are you sure you want to delete this file?')) {
            return;
        }

        try {
            const sessionToken = this.authManager.getSessionToken();
            const response = await fetch(`/api/files/${fileId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${sessionToken}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete file');
            }

            console.log('File deleted successfully');
            await this.loadUploadedFiles();
            
        } catch (error) {
            console.error('Error deleting file:', error);
            alert('Failed to delete file: ' + error.message);
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new FileUploadApp();
});
