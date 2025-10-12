class FileUploadApp {
    constructor() {
        this.supabaseUrl = 'https://pevqdguawonvpvnqqpnp.supabase.co';
        this.apiKey = ''; // Will be set from environment or user input
        this.selectedFiles = [];
        
        this.initializeElements();
        this.bindEvents();
        this.loadApiKey();
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
    }

    loadApiKey() {
        // Try to get API key from environment variables first
        // This will work when deployed on Render or other platforms
        this.apiKey = this.getApiKeyFromEnvironment();
        
        // If no environment variable is found, prompt user
        if (!this.apiKey) {
            this.promptForApiKey();
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
        if (!this.apiKey) {
            this.showError('API key is required. Please set SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY environment variable.');
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
            
            // Show specific error message for bucket not found
            if (error.message.includes('not found')) {
                this.showError(`Storage bucket not found. Please create a bucket named "uploads" in your Supabase dashboard. Go to Storage → Buckets → New Bucket.`);
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
        // Generate unique filename with timestamp
        const timestamp = Date.now();
        const fileName = `${timestamp}_${file.name}`;
        
        // Use the correct Supabase storage API endpoint
        const bucketName = 'uploads'; // You can change this bucket name
        const uploadUrl = `${this.supabaseUrl}/storage/v1/object/${bucketName}/${fileName}`;
        
        console.log('Uploading to:', uploadUrl);
        console.log('File:', file.name, 'Size:', file.size);
        
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

        // Update progress
        const progress = (currentIndex / totalFiles) * 100;
        this.updateProgress(progress, `Uploading ${currentIndex} of ${totalFiles} files...`);
        
        return result;
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
