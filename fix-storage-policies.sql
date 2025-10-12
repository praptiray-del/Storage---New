-- Fix storage policies for authentication
-- Run this in your Supabase SQL Editor

-- First, let's drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Allow public access" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;

-- Create the correct policies for authenticated users
-- Policy 1: Allow authenticated users to upload files
CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT 
TO authenticated
WITH CHECK (bucket_id = 'uploads');

-- Policy 2: Allow public access to read files (for viewing uploaded files)
CREATE POLICY "Allow public access" ON storage.objects
FOR SELECT 
TO anon, authenticated
USING (bucket_id = 'uploads');

-- Policy 3: Allow authenticated users to update their own files (optional)
CREATE POLICY "Allow authenticated updates" ON storage.objects
FOR UPDATE 
TO authenticated
USING (bucket_id = 'uploads')
WITH CHECK (bucket_id = 'uploads');

-- Policy 4: Allow authenticated users to delete their own files (optional)
CREATE POLICY "Allow authenticated deletes" ON storage.objects
FOR DELETE 
TO authenticated
USING (bucket_id = 'uploads');
