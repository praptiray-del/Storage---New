const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static('.'));

// Route to serve the main page with environment variables injected
app.get('/', (req, res) => {
    try {
        // Read the HTML file
        let html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
        
        // Get the API key from environment variables
        const apiKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';
        
        // Inject the API key into the meta tag
        html = html.replace(
            '<meta name="supabase-api-key" content="">',
            `<meta name="supabase-api-key" content="${apiKey}">`
        );
        
        // Also inject as a global variable in a script tag
        const scriptTag = `
            <script>
                window.SUPABASE_ANON_KEY = '${apiKey}';
                window.SUPABASE_SERVICE_ROLE_KEY = '${apiKey}';
            </script>
        `;
        
        // Insert the script tag before the closing head tag
        html = html.replace('</head>', `${scriptTag}</head>`);
        
        res.send(html);
    } catch (error) {
        console.error('Error serving page:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Health check endpoint for Render
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment variables loaded: ${process.env.SUPABASE_ANON_KEY ? 'SUPABASE_ANON_KEY ✓' : 'SUPABASE_ANON_KEY ✗'}`);
    console.log(`Environment variables loaded: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SUPABASE_SERVICE_ROLE_KEY ✓' : 'SUPABASE_SERVICE_ROLE_KEY ✗'}`);
});
