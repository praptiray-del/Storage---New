// Simple test script to verify server setup
const fs = require('fs');
const path = require('path');

console.log('=== Server Setup Test ===');

// Check if required files exist
const requiredFiles = ['index.html', 'styles.css', 'script.js', 'server.js', 'package.json'];
const missingFiles = [];

requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`✅ ${file} - Found`);
    } else {
        console.log(`❌ ${file} - Missing`);
        missingFiles.push(file);
    }
});

// Check package.json
try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    console.log(`✅ package.json - Valid JSON`);
    console.log(`   Dependencies: ${Object.keys(packageJson.dependencies || {}).join(', ')}`);
} catch (error) {
    console.log(`❌ package.json - Invalid JSON: ${error.message}`);
}

// Check if Express is available
try {
    require('express');
    console.log(`✅ Express - Available`);
} catch (error) {
    console.log(`❌ Express - Not available: ${error.message}`);
}

// Check environment variables
console.log(`\n=== Environment Variables ===`);
console.log(`SUPABASE_ANON_KEY: ${process.env.SUPABASE_ANON_KEY ? 'SET' : 'NOT SET'}`);
console.log(`SUPABASE_SERVICE_ROLE_KEY: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET'}`);

// Summary
console.log(`\n=== Summary ===`);
if (missingFiles.length === 0) {
    console.log(`✅ All required files present`);
    console.log(`🚀 Server should start successfully`);
} else {
    console.log(`❌ Missing files: ${missingFiles.join(', ')}`);
    console.log(`🔧 Fix missing files before deploying`);
}

console.log(`\n=== Test Complete ===`);
