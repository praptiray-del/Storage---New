-- Fix storage policies to allow anon uploads
-- Run this in your Supabase SQL Editor

-- Drop existing policies
DROP POLICY IF EXISTS "Allow public access" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow anon uploads" ON storage.objects;

-- Create policies that allow anon users to upload (for our custom auth system)
CREATE POLICY "Allow anon uploads" ON storage.objects
FOR INSERT 
TO anon, authenticated
WITH CHECK (bucket_id = 'uploads');

-- Allow public access to read files
CREATE POLICY "Allow public access" ON storage.objects
FOR SELECT 
TO anon, authenticated
USING (bucket_id = 'uploads');

-- Allow authenticated users to update files
CREATE POLICY "Allow authenticated updates" ON storage.objects
FOR UPDATE 
TO authenticated
USING (bucket_id = 'uploads')
WITH CHECK (bucket_id = 'uploads');

-- Allow authenticated users to delete files
CREATE POLICY "Allow authenticated deletes" ON storage.objects
FOR DELETE 
TO authenticated
USING (bucket_id = 'uploads');

-- Verify the policies were created
SELECT 
    policyname as "Policy Name",
    cmd as "Command",
    roles as "Roles"
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
ORDER BY policyname;
