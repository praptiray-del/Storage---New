class FileUploadApp {
    constructor() {
        this.supabaseUrl = 'https://pevqdguawonvpvnqqpnp.storage.supabase.co/storage/v1/s3';
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
        // Try to get API key from environment variables or prompt user
        // For now, we'll prompt the user to enter it
        if (!this.apiKey) {
            this.promptForApiKey();
        }
    }

    promptForApiKey() {
        const apiKey = prompt('Please enter your Supabase API key:');
        if (apiKey) {
            this.apiKey = apiKey;
        } else {
            this.showError('API key is required to upload files.');
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
            this.showError('API key is required. Please enter your Supabase API key.');
            return;
        }

        if (this.selectedFiles.length === 0) {
            this.showError('Please select files to upload.');
            return;
        }

        this.showProgress();
        this.submitBtn.disabled = true;

        try {
            for (let i = 0; i < this.selectedFiles.length; i++) {
                const file = this.selectedFiles[i];
                await this.uploadSingleFile(file, i + 1, this.selectedFiles.length);
            }
            
            this.showSuccess();
        } catch (error) {
            console.error('Upload error:', error);
            this.showError(`Upload failed: ${error.message}`);
        } finally {
            this.submitBtn.disabled = false;
        }
    }

    async uploadSingleFile(file, currentIndex, totalFiles) {
        const formData = new FormData();
        formData.append('file', file);
        
        // Generate unique filename with timestamp
        const timestamp = Date.now();
        const fileExtension = file.name.split('.').pop();
        const fileName = `${timestamp}_${file.name}`;
        
        const uploadUrl = `${this.supabaseUrl}/upload/${fileName}`;
        
        const response = await fetch(uploadUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'multipart/form-data'
            },
            body: formData
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Update progress
        const progress = (currentIndex / totalFiles) * 100;
        this.updateProgress(progress, `Uploading ${currentIndex} of ${totalFiles} files...`);
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
