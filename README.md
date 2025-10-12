# File Upload Web App

A modern, responsive web application for uploading files to Supabase storage. Users can drag and drop files or click to select files for upload.

## Features

- 🎨 Modern, responsive UI with gradient backgrounds
- 📁 Support for all file types (images, videos, PDFs, text files, etc.)
- 🖱️ Drag and drop functionality
- 📊 Real-time upload progress
- ✅ Success/error feedback
- 📱 Mobile-friendly design
- 🔒 Secure API key handling

## Setup Instructions

### 1. Get Your Supabase API Key

1. Go to your Supabase project dashboard
2. Navigate to Settings > API
3. Copy your `anon` or `service_role` key

### 2. Local Development

#### Option A: Using Node.js Server (Recommended)
```bash
# Install dependencies
npm install

# Start the server
npm start
```

#### Option B: Static File Serving
```bash
# Using Python
python -m http.server 8000

# Using Node.js (if you have http-server installed)
npx http-server

# Using PHP
php -S localhost:8000
```

### 3. Deploy to Render

#### Step 1: Prepare Your Repository
Make sure your code is pushed to GitHub (already done ✅)

#### Step 2: Create a New Web Service on Render
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository: `praptiray-del/storage`
4. Configure the service:
   - **Name**: `file-upload-app` (or your preferred name)
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free` (or upgrade as needed)

#### Step 3: Set Environment Variables
In the Render dashboard, go to your service → Environment tab and add:

| Key | Value | Description |
|-----|-------|-------------|
| `SUPABASE_ANON_KEY` | `your_anon_key_here` | Your Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | `your_service_role_key_here` | Your Supabase service role key (optional, for admin operations) |

**Note**: You only need one of these keys. Use `SUPABASE_ANON_KEY` for public access or `SUPABASE_SERVICE_ROLE_KEY` for admin operations.

#### Step 4: Create Storage Bucket (Optional)
The app will automatically try to create a storage bucket called `uploads`. If you prefer to create it manually:

1. Go to your Supabase project dashboard
2. Navigate to **Storage** → **Buckets**
3. Click **New Bucket**
4. Name it `uploads` (or change the bucket name in the code)
5. Make it **Public** if you want files to be publicly accessible

#### Step 5: Deploy
Click "Create Web Service" and Render will automatically deploy your app!

### 4. Environment Variable Configuration

The app supports multiple methods for API key configuration:

1. **Environment Variables** (Recommended for production)
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

2. **Meta Tag** (Set by server.js)
   - Automatically injected when using the Node.js server

3. **Global Variables** (Set by server.js)
   - `window.SUPABASE_ANON_KEY`
   - `window.SUPABASE_SERVICE_ROLE_KEY`

4. **Manual Entry** (Fallback)
   - Prompts user if no environment variable is found

## File Structure

```
├── index.html          # Main HTML file
├── styles.css          # CSS styling
├── script.js           # JavaScript functionality
├── server.js           # Node.js server for environment variable injection
├── package.json        # Node.js dependencies and scripts
└── README.md           # This file
```

## Usage

1. **Select Files**: Click the upload button or drag and drop files onto the upload area
2. **Review**: Check the selected files in the file list
3. **Upload**: Click "Upload Files" to start the upload process
4. **Monitor Progress**: Watch the progress bar during upload
5. **Complete**: View success message or error details

## API Configuration

The app is configured to use the Supabase storage endpoint:
```
https://pevqdguawonvpvnqqpnp.storage.supabase.co/storage/v1/s3
```

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Security Notes

- API keys are securely handled via environment variables
- Keys are injected server-side and never exposed in client-side code
- Files are uploaded with unique timestamps to prevent conflicts
- All uploads are authenticated with your Supabase API key
- Environment variables are not logged or exposed in the browser

## Troubleshooting

### Common Issues

1. **"API key is required" error**
   - Make sure you've entered a valid Supabase API key
   - Check that the key has storage permissions

2. **Upload fails with 401/403 errors**
   - Verify your API key is correct
   - Ensure your Supabase project allows file uploads

3. **CORS errors**
   - Make sure your Supabase project has the correct CORS settings
   - Try serving the app from a local server instead of opening the HTML file directly

### Getting Help

If you encounter issues:
1. Check the browser console for error messages
2. Verify your Supabase project settings
3. Ensure your API key has the necessary permissions

## Customization

You can customize the app by modifying:
- **Colors**: Update the CSS gradient values in `styles.css`
- **File size limits**: Add validation in `script.js`
- **Allowed file types**: Modify the `accept` attribute in the file input
- **Upload endpoint**: Change the Supabase URL in `script.js`

## License

This project is open source and available under the MIT License.