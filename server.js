const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

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
