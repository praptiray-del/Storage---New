// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;

// Configure multer for file uploads (in-memory storage)
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
});

// Session management (simple in-memory store - in production, use Redis)
const sessions = new Map();

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
});

// Serve static files (exclude sensitive files)
app.use(express.static('.', {
    index: false // Don't serve index.html automatically
}));

// Helper functions
function hashPassword(password) {
    const salt = 'file-upload-app-salt'; // In production, use unique salts per user
    return crypto.createHash('sha256').update(password + salt).digest('hex');
}

function generateSessionToken() {
    return crypto.randomBytes(32).toString('hex');
}

function sanitizeFileName(fileName) {
    return fileName
        .replace(/[^a-zA-Z0-9._-]/g, '_')
        .replace(/_{2,}/g, '_')
        .replace(/^_|_$/g, '')
        .toLowerCase()
        .substring(0, 100);
}

// Middleware to check authentication
function requireAuth(req, res, next) {
    const sessionToken = req.headers['authorization']?.replace('Bearer ', '');
    
    console.log('Auth check - Token:', sessionToken ? sessionToken.substring(0, 10) + '...' : 'none');
    console.log('Auth check - Active sessions:', sessions.size);
    
    if (!sessionToken) {
        console.log('Auth failed: No token provided');
        return res.status(401).json({ error: 'Unauthorized - No token provided' });
    }
    
    if (!sessions.has(sessionToken)) {
        console.log('Auth failed: Token not found in sessions');
        return res.status(401).json({ error: 'Unauthorized - Invalid or expired session. Please login again.' });
    }
    
    req.user = sessions.get(sessionToken);
    console.log('Auth success for user:', req.user.username);
    next();
}

// ===================================
// AUTHENTICATION API ENDPOINTS
// ===================================

// Register a new user
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters long' });
        }
        
        console.log('Registering user:', username);
        
        // Hash password
        const passwordHash = hashPassword(password);
        
        // Check if user exists
        const checkUrl = `${process.env.SUPABASE_URL}/rest/v1/users?or=(username.eq.${username},email.eq.${email})&select=username,email`;
        const checkResponse = await fetch(checkUrl, {
            headers: {
                'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY}`,
                'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY,
                'Content-Type': 'application/json'
            }
        });
        
        if (checkResponse.ok) {
            const existingUsers = await checkResponse.json();
            if (existingUsers.length > 0) {
                return res.status(409).json({ error: 'Username or email already exists' });
            }
        }
        
        // Create user in Supabase
        const createUrl = `${process.env.SUPABASE_URL}/rest/v1/users`;
        const createResponse = await fetch(createUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY}`,
                'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({
                username,
                email,
                password_hash: passwordHash
            })
        });
        
        if (!createResponse.ok) {
            const errorText = await createResponse.text();
            console.error('Failed to create user:', errorText);
            return res.status(500).json({ error: 'Failed to create user' });
        }
        
        const users = await createResponse.json();
        const user = users[0];
        
        console.log('User registered successfully:', username);
        res.json({ success: true, user: { id: user.id, username: user.username, email: user.email } });
        
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// Login user
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ error: 'Missing username or password' });
        }
        
        console.log('Login attempt for user:', username);
        
        // Hash password
        const passwordHash = hashPassword(password);
        
        // Authenticate with Supabase
        const url = `${process.env.SUPABASE_URL}/rest/v1/users?username=eq.${username}&password_hash=eq.${passwordHash}&select=*`;
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY}`,
                'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            console.error('Authentication failed');
            return res.status(401).json({ error: 'Invalid username or password' });
        }
        
        const users = await response.json();
        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }
        
        const user = users[0];
        
        // Create session
        const sessionToken = generateSessionToken();
        sessions.set(sessionToken, {
            id: user.id,
            username: user.username,
            email: user.email
        });
        
        console.log('User logged in successfully:', username);
        console.log('Session token created:', sessionToken.substring(0, 10) + '...');
        console.log('Total active sessions:', sessions.size);
        res.json({
            success: true,
            sessionToken,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                is_premium: user.is_premium || false
            }
        });
        
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Get current user
app.get('/api/auth/me', requireAuth, async (req, res) => {
    try {
        // Fetch full user details from Supabase
        const url = `${process.env.SUPABASE_URL}/rest/v1/users?id=eq.${req.user.id}&select=*`;
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY}`,
                'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        const users = await response.json();
        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        const user = users[0];
        
        // Return user data in the format Android app expects
        res.json({
            id: user.id,
            username: user.username,
            email: user.email,
            isPremium: user.is_premium || false,
            createdAt: user.created_at
        });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

// Logout user
app.post('/api/auth/logout', requireAuth, (req, res) => {
    const sessionToken = req.headers['authorization']?.replace('Bearer ', '');
    sessions.delete(sessionToken);
    res.json({ success: true });
});

// ===================================
// FILE UPLOAD API ENDPOINTS
// ===================================

// Upload files
app.post('/api/upload', requireAuth, upload.array('files', 10), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No files uploaded' });
        }
        
        console.log(`Uploading ${req.files.length} files for user:`, req.user.username);
        console.log('User ID:', req.user.id);
        
        const uploadedFiles = [];
        const failedFiles = [];
        const supabaseUrl = process.env.SUPABASE_URL;
        const apiKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
        
        // Upload each file to Supabase
        for (const file of req.files) {
            const timestamp = Date.now();
            const sanitizedName = sanitizeFileName(file.originalname);
            const fileName = `${timestamp}_${sanitizedName}`;
            const bucketName = 'uploads';
            
            console.log(`[UPLOAD] Processing file: ${file.originalname}`);
            console.log(`[UPLOAD] Sanitized name: ${fileName}`);
            console.log(`[UPLOAD] Size: ${file.size} bytes`);
            console.log(`[UPLOAD] Mimetype: ${file.mimetype}`);
            
            // Upload to Supabase Storage using FormData
            const uploadUrl = `${supabaseUrl}/storage/v1/object/${bucketName}/${fileName}`;
            console.log(`[UPLOAD] Uploading to: ${uploadUrl}`);
            console.log(`[UPLOAD] File buffer length: ${file.buffer.length}`);
            
            // Create FormData for proper multipart upload to Supabase
            const FormData = require('form-data');
            const formData = new FormData();
            formData.append('file', file.buffer, {
                filename: fileName,
                contentType: file.mimetype || 'application/octet-stream'
            });
            
            const uploadResponse = await fetch(uploadUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'apikey': apiKey,
                    ...formData.getHeaders()
                },
                body: formData
            });
            
            console.log(`[UPLOAD] Storage response status: ${uploadResponse.status}`);
            
            if (!uploadResponse.ok) {
                const errorText = await uploadResponse.text();
                console.error(`[UPLOAD] Storage upload failed for ${file.originalname}:`, errorText);
                failedFiles.push({
                    name: file.originalname,
                    error: errorText
                });
                continue;
            }
            
            const uploadResult = await uploadResponse.json();
            console.log(`[UPLOAD] Storage upload successful:`, uploadResult);
            
            // Track upload in database
            try {
                const trackingUrl = `${supabaseUrl}/rest/v1/user_uploads`;
                console.log(`[UPLOAD] Tracking in database...`);
                
                const trackingResponse = await fetch(trackingUrl, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'apikey': apiKey,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=minimal'
                    },
                    body: JSON.stringify({
                        user_id: req.user.id,
                        file_name: file.originalname,
                        file_size: file.size,
                        file_type: file.mimetype,
                        storage_path: `${bucketName}/${fileName}`
                    })
                });
                
                if (!trackingResponse.ok) {
                    const trackError = await trackingResponse.text();
                    console.error(`[UPLOAD] Database tracking failed:`, trackError);
                    failedFiles.push({
                        name: file.originalname,
                        error: 'Failed to track in database: ' + trackError
                    });
                    continue;
                }
                
                console.log(`[UPLOAD] Database tracking successful`);
            } catch (trackError) {
                console.error('[UPLOAD] Failed to track upload:', trackError);
                failedFiles.push({
                    name: file.originalname,
                    error: 'Database tracking error: ' + trackError.message
                });
                continue;
            }
            
            uploadedFiles.push({
                originalName: file.originalname,
                storageName: fileName,
                size: file.size,
                type: file.mimetype
            });
        }
        
        console.log(`[UPLOAD] Results: ${uploadedFiles.length} succeeded, ${failedFiles.length} failed`);
        
        // Return error if ALL files failed
        if (uploadedFiles.length === 0 && failedFiles.length > 0) {
            console.error('[UPLOAD] All files failed to upload');
            return res.status(500).json({ 
                error: 'All files failed to upload', 
                failures: failedFiles 
            });
        }
        
        // Return success with details about any failures
        res.json({ 
            success: true, 
            files: uploadedFiles,
            failures: failedFiles.length > 0 ? failedFiles : undefined
        });
        
    } catch (error) {
        console.error('[UPLOAD] Exception:', error);
        res.status(500).json({ error: 'Upload failed: ' + error.message });
    }
});

// Get user's uploaded files
app.get('/api/files', requireAuth, async (req, res) => {
    try {
        console.log('Fetching files for user:', req.user.username);
        
        // Fetch user's uploads from Supabase
        const url = `${process.env.SUPABASE_URL}/rest/v1/user_uploads?user_id=eq.${req.user.id}&select=*&order=uploaded_at.desc`;
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY}`,
                'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            console.error('Failed to fetch files from Supabase');
            return res.status(500).json({ error: 'Failed to fetch files' });
        }
        
        const uploads = await response.json();
        
        // Transform data to match Android app's expected format
        const files = uploads.map(upload => ({
            id: upload.id,
            userId: upload.user_id,
            fileName: upload.file_name,
            fileSize: upload.file_size,
            fileType: upload.file_type || 'unknown',
            uploadedAt: upload.uploaded_at,
            fileUrl: `${process.env.SUPABASE_URL}/storage/v1/object/public/uploads/${upload.file_name}`
        }));
        
        console.log(`Found ${files.length} files for user`);
        res.json(files);
        
    } catch (error) {
        console.error('Error fetching files:', error);
        res.status(500).json({ error: 'Failed to fetch files' });
    }
});

// Delete user's file
app.delete('/api/files/:fileId', requireAuth, async (req, res) => {
    try {
        const fileId = req.params.fileId;
        console.log('Deleting file:', fileId, 'for user:', req.user.username);
        
        // Fetch the file details from Supabase
        const fetchUrl = `${process.env.SUPABASE_URL}/rest/v1/user_uploads?id=eq.${fileId}&user_id=eq.${req.user.id}&select=*`;
        const fetchResponse = await fetch(fetchUrl, {
            headers: {
                'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY}`,
                'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY,
                'Content-Type': 'application/json'
            }
        });
        
        if (!fetchResponse.ok) {
            return res.status(404).json({ error: 'File not found' });
        }
        
        const files = await fetchResponse.json();
        if (files.length === 0) {
            return res.status(404).json({ error: 'File not found' });
        }
        
        const file = files[0];
        
        // Delete from Supabase Storage
        const storageUrl = `${process.env.SUPABASE_URL}/storage/v1/object/uploads/${file.file_name}`;
        await fetch(storageUrl, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY}`,
                'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
            }
        });
        
        // Delete from database
        const deleteUrl = `${process.env.SUPABASE_URL}/rest/v1/user_uploads?id=eq.${fileId}&user_id=eq.${req.user.id}`;
        const deleteResponse = await fetch(deleteUrl, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY}`,
                'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY,
                'Content-Type': 'application/json'
            }
        });
        
        if (!deleteResponse.ok) {
            return res.status(500).json({ error: 'Failed to delete file from database' });
        }
        
        console.log('File deleted successfully');
        res.json({ success: true, message: 'File deleted successfully' });
        
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ error: 'Failed to delete file' });
    }
});

// ===================================
// PAYMENT API ENDPOINTS
// ===================================

// Create Dodo Payments checkout session
app.post('/api/payment/create-checkout', requireAuth, async (req, res) => {
    try {
        const apiKey = process.env.DODO_PAYMENTS_API_KEY;
        const productId = process.env.DODO_PRODUCT_ID;
        
        if (!apiKey || !productId) {
            return res.status(500).json({ error: 'Payment system not configured' });
        }
        
        const returnUrl = `${req.protocol}://${req.get('host')}/?payment=success`;
        
        const requestBody = {
            product_cart: [{
                product_id: productId,
                quantity: 1
            }],
            customer: {
                email: req.user.email || 'user@example.com',
                name: req.user.username,
                phone_number: '+1234567890'
            },
            billing_address: {
                street: '123 Main St',
                city: 'San Francisco',
                state: 'CA',
                country: 'US',
                zipcode: '94102'
            },
            return_url: returnUrl,
            metadata: {
                user_id: req.user.id,
                username: req.user.username,
                source: 'file_upload_app'
            }
        };
        
        console.log('Creating Dodo Payments checkout for user:', req.user.username);
        
        const response = await fetch('https://test.dodopayments.com/checkouts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Dodo Payments error:', errorText);
            return res.status(500).json({ error: 'Failed to create checkout session' });
        }
        
        const session = await response.json();
        console.log('Checkout session created successfully');
        
        res.json({ success: true, checkoutUrl: session.checkout_url, checkoutId: session.id });
        
    } catch (error) {
        console.error('Payment error:', error);
        res.status(500).json({ error: 'Payment processing failed' });
    }
});

// ===================================
// MAIN PAGE ROUTE
// ===================================

// Route to serve the main page (no environment variables injected)
app.get('/', (req, res) => {
    try {
        console.log('Serving main page...');
        console.log('Current directory:', __dirname);
        console.log('Files in directory:', fs.readdirSync(__dirname));
        
        const htmlPath = path.join(__dirname, 'index.html');
        console.log('Looking for HTML file at:', htmlPath);
        
        // Check if file exists
        if (!fs.existsSync(htmlPath)) {
            console.error('index.html not found at:', htmlPath);
            return res.status(404).send(`
                <h1>File Not Found</h1>
                <p>index.html not found at: ${htmlPath}</p>
                <p>Available files: ${fs.readdirSync(__dirname).join(', ')}</p>
            `);
        }
        
        // Read the HTML file (no environment variable injection)
        const html = fs.readFileSync(htmlPath, 'utf8');
        console.log('HTML file read successfully, length:', html.length);
        console.log('Serving HTML without injected credentials');
        res.send(html);
    } catch (error) {
        console.error('Error serving page:', error);
        console.error('Error stack:', error.stack);
        res.status(500).send(`
            <h1>Server Error</h1>
            <p>Error: ${error.message}</p>
            <p>Stack: ${error.stack}</p>
        `);
    }
});

// Health check endpoint for Render
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        environment: {
            SUPABASE_URL: process.env.SUPABASE_URL ? 'SET' : 'NOT SET',
            SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ? 'SET' : 'NOT SET',
            SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET',
            DODO_PAYMENTS_API_KEY: process.env.DODO_PAYMENTS_API_KEY ? 'SET' : 'NOT SET',
            DODO_PRODUCT_ID: process.env.DODO_PRODUCT_ID ? 'SET' : 'NOT SET'
        }
    });
});


// Fallback route for any other requests
app.get('*', (req, res) => {
    console.log('Fallback route hit for:', req.path);
    res.redirect('/');
});

// Start server with error handling
// Add missing SUPABASE_URL environment variable check
if (!process.env.SUPABASE_URL) {
    console.error('❌ WARNING: SUPABASE_URL not set in environment variables!');
}

try {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`📁 Current directory: ${__dirname}`);
        console.log(`📄 Files available: ${fs.readdirSync(__dirname).join(', ')}`);
        console.log(`🔑 Environment variables loaded:`);
        console.log(`   SUPABASE_URL: ${process.env.SUPABASE_URL ? '✓ SET' : '✗ NOT SET'}`);
        console.log(`   SUPABASE_ANON_KEY: ${process.env.SUPABASE_ANON_KEY ? '✓ SET' : '✗ NOT SET'}`);
        console.log(`   SUPABASE_SERVICE_ROLE_KEY: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? '✓ SET' : '✗ NOT SET'}`);
        console.log(`   DODO_PAYMENTS_API_KEY: ${process.env.DODO_PAYMENTS_API_KEY ? '✓ SET' : '✗ NOT SET'}`);
        console.log(`   DODO_PRODUCT_ID: ${process.env.DODO_PRODUCT_ID ? '✓ SET' : '✗ NOT SET'}`);
        console.log(`🌐 Server ready to accept connections`);
        console.log(`📡 API endpoints available:`);
        console.log(`   POST /api/auth/register`);
        console.log(`   POST /api/auth/login`);
        console.log(`   GET  /api/auth/me`);
        console.log(`   POST /api/auth/logout`);
        console.log(`   POST /api/upload`);
        console.log(`   POST /api/payment/create-checkout`);
    });
} catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
}
