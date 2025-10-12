-- Payments table for tracking Dodo Payments transactions
-- Run this in your Supabase SQL Editor

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    checkout_id VARCHAR(255) UNIQUE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(50) DEFAULT 'pending',
    payment_method VARCHAR(100),
    transaction_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_checkout_id ON payments(checkout_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- Disable RLS for now (we'll enable it later with proper policies)
ALTER TABLE payments DISABLE ROW LEVEL SECURITY;

-- Add foreign key relationship to users table (optional)
-- ALTER TABLE payments ADD CONSTRAINT fk_payments_user_id 
-- FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Test insert (optional - remove this after testing)
INSERT INTO payments (user_id, checkout_id, amount, currency, status) 
VALUES (
    gen_random_uuid(), 
    'test_checkout_123', 
    10.00, 
    'USD', 
    'pending'
);

-- Verify the table was created
SELECT * FROM payments;

-- Clean up test record
DELETE FROM payments WHERE checkout_id = 'test_checkout_123';
