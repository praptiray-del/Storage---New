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

### 2. Configure the App

The app will prompt you for your API key when you first try to upload a file. You can also set it programmatically by modifying the `script.js` file.

### 3. Run the Application

1. Open `index.html` in your web browser
2. Or serve it using a local server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js (if you have http-server installed)
   npx http-server
   
   # Using PHP
   php -S localhost:8000
   ```

## File Structure

```
├── index.html          # Main HTML file
├── styles.css          # CSS styling
├── script.js           # JavaScript functionality
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

- API keys are stored in memory only (not persisted)
- Files are uploaded with unique timestamps to prevent conflicts
- All uploads are authenticated with your Supabase API key

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