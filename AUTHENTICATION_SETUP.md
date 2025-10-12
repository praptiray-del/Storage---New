# Authentication Setup Guide

## 🔐 User Authentication with Supabase Database

This guide will help you set up user authentication with username and password stored in your Supabase database.

## 📋 Prerequisites

1. **Supabase Project** - You should already have this set up
2. **Storage Bucket** - The `uploads` bucket should be created
3. **API Keys** - Your Supabase anon key should be configured

## 🗄️ Database Setup

### Step 1: Create Database Tables

1. **Go to your Supabase Dashboard**: https://supabase.com/dashboard
2. **Select your project**
3. **Navigate to SQL Editor**
4. **Copy and paste the contents of `database-schema.sql`**
5. **Click "Run"** to execute the SQL

This will create:
- `users` table for storing user credentials
- `user_uploads` table for tracking user uploads
- Proper indexes and triggers
- Row Level Security policies

### Step 2: Verify Tables Created

1. **Go to Table Editor** in your Supabase dashboard
2. **Verify you see:**
   - `users` table
   - `user_uploads` table

## 🔧 Configuration

### Step 3: Update Storage Policies

Make sure your storage policies allow authenticated users to upload:

1. **Go to Storage** → **Policies**
2. **Find `storage.objects` table**
3. **Create or update policies:**

```sql
-- Allow authenticated users to upload
CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT 
TO authenticated
WITH CHECK (bucket_id = 'uploads');

-- Allow public access to read files
CREATE POLICY "Allow public access" ON storage.objects
FOR SELECT 
TO anon, authenticated
USING (bucket_id = 'uploads');
```

## 🚀 Features

### Authentication Features:
- ✅ **User Registration** - Create new accounts with username, email, password
- ✅ **User Login** - Secure authentication with password hashing
- ✅ **Session Management** - Persistent login sessions
- ✅ **User Dashboard** - Welcome message and logout functionality
- ✅ **Upload Tracking** - Each upload is linked to the user who uploaded it

### Security Features:
- ✅ **Password Hashing** - Passwords are hashed using SHA-256
- ✅ **Input Validation** - Username, email, and password validation
- ✅ **Row Level Security** - Database policies protect user data
- ✅ **Session Storage** - Secure session management

## 📱 User Experience

### Registration Flow:
1. User clicks "Register here"
2. Fills in username, email, password, confirm password
3. System validates input and checks for duplicates
4. User account is created in database
5. User is redirected to login form

### Login Flow:
1. User enters username and password
2. System authenticates against database
3. User session is created and stored
4. Upload interface becomes available
5. User can upload files (tracked in database)

### Upload Flow:
1. User must be logged in to upload
2. Files are uploaded to Supabase storage
3. Upload details are tracked in `user_uploads` table
4. Each upload is linked to the authenticated user

## 🔍 Database Schema

### Users Table:
```sql
users (
    id UUID PRIMARY KEY,
    username VARCHAR(50) UNIQUE,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
)
```

### User Uploads Table:
```sql
user_uploads (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    file_name VARCHAR(255),
    file_size BIGINT,
    file_type VARCHAR(100),
    storage_path VARCHAR(500),
    uploaded_at TIMESTAMP
)
```

## 🛠️ Troubleshooting

### Common Issues:

1. **"User already exists" error**
   - Check if username or email is already taken
   - Try a different username/email

2. **"Authentication failed" error**
   - Verify username and password are correct
   - Check if user exists in database

3. **"Upload unauthorized" error**
   - Make sure user is logged in
   - Check storage policies allow authenticated uploads

4. **Database connection issues**
   - Verify API key is correct
   - Check if database tables exist
   - Ensure RLS policies are properly configured

### Debug Steps:

1. **Check browser console** for error messages
2. **Verify database tables** exist in Supabase
3. **Test API connection** using Supabase dashboard
4. **Check storage policies** allow authenticated access

## 🔒 Security Notes

- Passwords are hashed using SHA-256 with salt
- User sessions are stored in localStorage
- Database uses Row Level Security policies
- All API calls require proper authentication
- File uploads are tracked and linked to users

## 📈 Next Steps

After setup, you can:
- View user uploads in the database
- Add user profile management
- Implement file sharing between users
- Add admin functionality
- Create user dashboards with upload history
