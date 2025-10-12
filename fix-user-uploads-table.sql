-- Fix user_uploads table policies
-- Run this in your Supabase SQL Editor

-- First, let's see what policies exist on user_uploads table
SELECT 
    policyname as "Policy Name",
    cmd as "Command",
    roles as "Roles",
    qual as "Using Clause",
    with_check as "With Check Clause"
FROM pg_policies 
WHERE tablename = 'user_uploads' 
AND schemaname = 'public'
ORDER BY policyname;

-- Drop existing policies on user_uploads table
DROP POLICY IF EXISTS "Users can view their own uploads" ON user_uploads;
DROP POLICY IF EXISTS "Users can insert their own uploads" ON user_uploads;
DROP POLICY IF EXISTS "Allow public access" ON user_uploads;
DROP POLICY IF EXISTS "Allow anon access" ON user_uploads;

-- Disable RLS temporarily for testing
ALTER TABLE user_uploads DISABLE ROW LEVEL SECURITY;

-- Or create permissive policies that allow inserts
-- Uncomment the lines below if you want to keep RLS enabled:

-- CREATE POLICY "Allow anon inserts" ON user_uploads
-- FOR INSERT 
-- TO anon, authenticated
-- WITH CHECK (true);

-- CREATE POLICY "Allow anon selects" ON user_uploads
-- FOR SELECT 
-- TO anon, authenticated
-- USING (true);

-- Test insert to verify it works
INSERT INTO user_uploads (user_id, file_name, file_size, file_type, storage_path) 
VALUES (
    gen_random_uuid(), 
    'test_file.txt', 
    1024, 
    'text/plain', 
    'uploads/test_file.txt'
);

-- Check if the test insert worked
SELECT * FROM user_uploads WHERE file_name = 'test_file.txt';

-- Clean up test record
DELETE FROM user_uploads WHERE file_name = 'test_file.txt';

-- Verify the table is working
SELECT COUNT(*) as total_uploads FROM user_uploads;
