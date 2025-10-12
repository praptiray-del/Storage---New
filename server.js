const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).send('Internal Server Error');
});

// Serve static files
app.use(express.static('.'));

// Route to serve the main page with environment variables injected
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
        
        // Read the HTML file
        let html = fs.readFileSync(htmlPath, 'utf8');
        console.log('HTML file read successfully, length:', html.length);
        
        // Get the API key from environment variables
        const anonKey = process.env.SUPABASE_ANON_KEY || '';
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
        const apiKey = anonKey || serviceKey;
        const dodoApiKey = process.env.DODO_PAYMENTS_API_KEY || '';
        const dodoProductId = process.env.DODO_PRODUCT_ID || '';
        
        console.log('Environment variables check:');
        console.log('SUPABASE_ANON_KEY:', anonKey ? 'SET' : 'NOT SET');
        console.log('SUPABASE_SERVICE_ROLE_KEY:', serviceKey ? 'SET' : 'NOT SET');
        console.log('DODO_PAYMENTS_API_KEY:', dodoApiKey ? 'SET' : 'NOT SET');
        console.log('DODO_PRODUCT_ID:', dodoProductId ? 'SET' : 'NOT SET');
        console.log('Using API key:', apiKey ? 'FOUND' : 'NOT FOUND');
        
        // Inject the API key into the meta tag
        html = html.replace(
            '<meta name="supabase-api-key" content="">',
            `<meta name="supabase-api-key" content="${apiKey}">`
        );
        
        // Inject Dodo Payments variables into meta tags
        html = html.replace(
            '<meta name="dodo-payments-api-key" content="">',
            `<meta name="dodo-payments-api-key" content="${dodoApiKey}">`
        );
        
        html = html.replace(
            '<meta name="dodo-product-id" content="">',
            `<meta name="dodo-product-id" content="${dodoProductId}">`
        );
        
        // Also inject as global variables in a script tag
        const scriptTag = `
            <script>
                window.SUPABASE_ANON_KEY = '${anonKey}';
                window.SUPABASE_SERVICE_ROLE_KEY = '${serviceKey}';
                window.DODO_PAYMENTS_API_KEY = '${process.env.DODO_PAYMENTS_API_KEY || ''}';
                window.DODO_PRODUCT_ID = '${process.env.DODO_PRODUCT_ID || ''}';
                console.log('API keys injected:', {
                    anonKey: '${anonKey ? 'SET' : 'NOT SET'}',
                    serviceKey: '${serviceKey ? 'SET' : 'NOT SET'}',
                    dodoApiKey: '${process.env.DODO_PAYMENTS_API_KEY ? 'SET' : 'NOT SET'}',
                    dodoProductId: '${process.env.DODO_PRODUCT_ID ? 'SET' : 'NOT SET'}'
                });
            </script>
        `;
        
        // Insert the script tag before the closing head tag
        html = html.replace('</head>', `${scriptTag}</head>`);
        
        console.log('Sending HTML response...');
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
            SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ? 'SET' : 'NOT SET',
            SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET',
            DODO_PAYMENTS_API_KEY: process.env.DODO_PAYMENTS_API_KEY ? 'SET' : 'NOT SET',
            DODO_PRODUCT_ID: process.env.DODO_PRODUCT_ID ? 'SET' : 'NOT SET'
        }
    });
});

// Dodo Payments API endpoint (server-side to avoid CORS)
app.post('/api/create-checkout', async (req, res) => {
    try {
        console.log('Received request body:', req.body);
        console.log('Request headers:', req.headers);
        
        // Check if body exists and has required fields
        if (!req.body || typeof req.body !== 'object') {
            return res.status(400).json({ 
                error: 'Invalid request body',
                details: 'Request body is missing or invalid'
            });
        }
        
        const { user_id, username, email, return_url } = req.body;
        
        // Validate required fields
        if (!user_id || !username) {
            return res.status(400).json({ 
                error: 'Missing required fields',
                details: 'user_id and username are required'
            });
        }
        
        console.log('Creating Dodo Payments checkout session for user:', username);
        
        const dodoApiKey = process.env.DODO_PAYMENTS_API_KEY;
        const dodoProductId = process.env.DODO_PRODUCT_ID;
        
        if (!dodoApiKey || !dodoProductId) {
            return res.status(500).json({ 
                error: 'Dodo Payments configuration missing',
                details: {
                    apiKey: dodoApiKey ? 'SET' : 'NOT SET',
                    productId: dodoProductId ? 'SET' : 'NOT SET'
                }
            });
        }
        
        // Generate unique checkout ID for tracking
        const checkoutId = `checkout_${user_id}_${Date.now()}`;
        
        const requestBody = {
            product_cart: [
                {
                    product_id: dodoProductId,
                    quantity: 1
                }
            ],
            customer: {
                email: email || 'user@example.com',
                name: username,
                phone_number: '+1234567890'
            },
            billing_address: {
                street: '123 Main St',
                city: 'San Francisco',
                state: 'CA', 
                country: 'US',
                zipcode: '94102'
            },
            return_url: return_url,
            metadata: {
                user_id: user_id,
                username: username,
                checkout_id: checkoutId,
                source: 'file_upload_app'
            }
        };
        
        console.log('Sending request to Dodo Payments API...');
        console.log('Request body:', JSON.stringify(requestBody, null, 2));
        
        const response = await fetch('https://test.dodopayments.com/checkouts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${dodoApiKey}`
            },
            body: JSON.stringify(requestBody)
        });
        
        console.log('Dodo Payments API response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Dodo Payments API Error:', {
                status: response.status,
                statusText: response.statusText,
                errorText: errorText
            });
            return res.status(response.status).json({ 
                error: 'Dodo Payments API error',
                details: errorText
            });
        }
        
        const session = await response.json();
        console.log('Checkout session created successfully:', session);
        
        // Return the session data to the client
        res.json({
            success: true,
            session: session,
            checkout_id: checkoutId
        });
        
    } catch (error) {
        console.error('Server error creating checkout session:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            details: error.message
        });
    }
});

// Fallback route for any other requests
app.get('*', (req, res) => {
    console.log('Fallback route hit for:', req.path);
    res.redirect('/');
});

// Start server with error handling
try {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`📁 Current directory: ${__dirname}`);
        console.log(`📄 Files available: ${fs.readdirSync(__dirname).join(', ')}`);
        console.log(`🔑 Environment variables loaded:`);
        console.log(`   SUPABASE_ANON_KEY: ${process.env.SUPABASE_ANON_KEY ? '✓ SET' : '✗ NOT SET'}`);
        console.log(`   SUPABASE_SERVICE_ROLE_KEY: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? '✓ SET' : '✗ NOT SET'}`);
        console.log(`🌐 Server ready to accept connections`);
    });
} catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
}
