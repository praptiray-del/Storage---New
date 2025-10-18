-- Migration: Add is_premium column to users table
-- Run this in your Supabase SQL Editor if you already have the users table

-- Add is_premium column if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT FALSE;

-- Update existing users to have is_premium = false
UPDATE users SET is_premium = FALSE WHERE is_premium IS NULL;

