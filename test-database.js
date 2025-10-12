// Database connection test script
// Run this in your browser console to test database connectivity

async function testDatabaseConnection() {
    console.log('=== Database Connection Test ===');
    
    // Get API key from environment or prompt user
    const apiKey = window.SUPABASE_ANON_KEY || prompt('Enter your Supabase API key:');
    const supabaseUrl = 'https://pevqdguawonvpvnqqpnp.supabase.co';
    
    if (!apiKey) {
        console.error('❌ No API key provided');
        return;
    }
    
    console.log('🔑 API Key:', apiKey.substring(0, 20) + '...');
    console.log('🌐 Supabase URL:', supabaseUrl);
    
    try {
        // Test 1: Check if users table exists
        console.log('\n📋 Test 1: Checking if users table exists...');
        const tableCheckResponse = await fetch(`${supabaseUrl}/rest/v1/users?select=count`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'apikey': apiKey,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Table check response status:', tableCheckResponse.status);
        
        if (tableCheckResponse.ok) {
            console.log('✅ Users table exists and is accessible');
        } else {
            const errorText = await tableCheckResponse.text();
            console.error('❌ Users table issue:', errorText);
            
            if (errorText.includes('relation "users" does not exist')) {
                console.log('💡 Solution: Run the database-schema.sql file in your Supabase SQL Editor');
            }
            return;
        }
        
        // Test 2: Check current users
        console.log('\n👥 Test 2: Checking existing users...');
        const usersResponse = await fetch(`${supabaseUrl}/rest/v1/users?select=username,email,created_at`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'apikey': apiKey,
                'Content-Type': 'application/json'
            }
        });
        
        if (usersResponse.ok) {
            const users = await usersResponse.json();
            console.log('📊 Current users in database:', users.length);
            if (users.length > 0) {
                console.log('Users:', users);
            }
        } else {
            console.error('❌ Failed to fetch users:', await usersResponse.text());
        }
        
        // Test 3: Test user creation (dry run)
        console.log('\n🧪 Test 3: Testing user creation permissions...');
        const testUser = {
            username: 'test_user_' + Date.now(),
            email: 'test@example.com',
            password_hash: 'test_hash'
        };
        
        const createResponse = await fetch(`${supabaseUrl}/rest/v1/users`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'apikey': apiKey,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify(testUser)
        });
        
        console.log('Create test response status:', createResponse.status);
        
        if (createResponse.ok) {
            console.log('✅ User creation test successful');
            
            // Clean up test user
            const deleteResponse = await fetch(`${supabaseUrl}/rest/v1/users?username=eq.${testUser.username}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'apikey': apiKey
                }
            });
            console.log('🧹 Test user cleaned up');
        } else {
            const errorText = await createResponse.text();
            console.error('❌ User creation test failed:', errorText);
            
            if (errorText.includes('permission denied')) {
                console.log('💡 Solution: Check your Row Level Security policies');
            } else if (errorText.includes('duplicate key')) {
                console.log('💡 Solution: Username/email already exists');
            }
        }
        
        console.log('\n✅ Database connection test completed');
        
    } catch (error) {
        console.error('❌ Database test failed:', error);
    }
}

// Run the test
testDatabaseConnection();
