// Test script to check environment variables
console.log('=== Environment Variables Test ===');
console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? 'SET' : 'NOT SET');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET');

if (process.env.SUPABASE_ANON_KEY) {
    console.log('Anon key length:', process.env.SUPABASE_ANON_KEY.length);
    console.log('Anon key starts with:', process.env.SUPABASE_ANON_KEY.substring(0, 10) + '...');
}

if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.log('Service key length:', process.env.SUPABASE_SERVICE_ROLE_KEY.length);
    console.log('Service key starts with:', process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 10) + '...');
}

console.log('=== Test Complete ===');
