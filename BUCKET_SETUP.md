# Storage Bucket Setup Guide

## 🚨 Required: Create Storage Bucket

Your file upload app requires a storage bucket named `uploads` in your Supabase project.

### Step-by-Step Instructions:

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Sign in to your account

2. **Select Your Project**
   - Click on your project (the one with URL: `pevqdguawonvpvnqqpnp.supabase.co`)

3. **Navigate to Storage**
   - In the left sidebar, click **"Storage"**
   - Then click **"Buckets"**

4. **Create New Bucket**
   - Click the **"New Bucket"** button
   - Fill in the details:
     - **Name**: `uploads` (exactly this name)
     - **Public**: ✅ **Check this box** (important!)
     - **File size limit**: Leave default or set as needed
   - Click **"Create bucket"**

5. **Verify Bucket Creation**
   - You should see `uploads` in your buckets list
   - The bucket should show as "Public"

### Alternative: Use Different Bucket Name

If you want to use a different bucket name:

1. Edit `script.js`
2. Find this line: `const bucketName = 'uploads';`
3. Change `'uploads'` to your preferred bucket name
4. Make sure the bucket exists in your Supabase project

### Troubleshooting

**If you still get "Bucket not found" errors:**
- Double-check the bucket name is exactly `uploads`
- Ensure the bucket is marked as "Public"
- Verify you're using the correct Supabase project
- Check that your API key has storage permissions

**Need help?** Check the browser console (F12) for detailed error messages.
