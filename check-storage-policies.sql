-- Check existing storage policies
-- Run this in your Supabase SQL Editor to see what policies already exist

-- View all policies on storage.objects table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage';

-- Alternative query to see policies in a more readable format
SELECT 
    policyname as "Policy Name",
    cmd as "Command",
    roles as "Roles",
    qual as "Using Clause",
    with_check as "With Check Clause"
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
ORDER BY policyname;
