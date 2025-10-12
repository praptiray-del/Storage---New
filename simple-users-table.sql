-- Simple users table creation
-- Run this in your Supabase SQL Editor

-- Drop table if it exists (for clean start)
DROP TABLE IF EXISTS users CASCADE;

-- Create users table
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disable RLS for now (we'll enable it later with proper policies)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Create index for better performance
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);

-- Test insert (optional - remove this after testing)
INSERT INTO users (username, email, password_hash) 
VALUES ('testuser', 'test@example.com', 'test_hash');

-- Verify the table was created
SELECT * FROM users;
