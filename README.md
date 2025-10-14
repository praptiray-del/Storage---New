# File Upload Web App

A modern, responsive web application for uploading files to Supabase storage with user authentication and premium upgrade functionality via Dodo Payments.

## Features

- 🎨 **Modern UI** - Responsive design with gradient backgrounds
- 📁 **File Upload** - Support for all file types (images, videos, PDFs, text files, etc.)
- 🖱️ **Drag & Drop** - Intuitive file selection interface
- 📊 **Progress Tracking** - Real-time upload progress indicators
- 🔐 **User Authentication** - Secure login/registration system
- 💳 **Premium Upgrade** - Dodo Payments integration for premium features
- 📱 **Mobile Friendly** - Responsive design for all devices
- 🔒 **Secure** - Environment variable-based API key management

## Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Node.js with Express
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **Authentication**: Custom user management with Supabase
- **Payments**: Dodo Payments API
- **Deployment**: Render.com

## Project Structure

```
├── index.html              # Main HTML file
├── styles.css              # CSS styling and responsive design
├── script.js               # Main JavaScript application logic
├── auth.js                 # User authentication system
├── dodo-payments.js        # Dodo Payments integration
├── server.js               # Node.js server for environment variables
├── package.json            # Node.js dependencies and scripts
├── database-schema.sql     # Database schema for user management
├── AUTHENTICATION_SETUP.md # Authentication setup guide
├── BUCKET_SETUP.md         # Supabase storage setup guide
├── RENDER_TROUBLESHOOTING.md # Deployment troubleshooting
└── README.md               # This file
```

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/praptiray-del/storage.git
cd storage
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file or set these environment variables:

```bash
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
DODO_PAYMENTS_API_KEY=your_dodo_payments_api_key_here
DODO_PRODUCT_ID=your_dodo_product_id_here
```

### 4. Set Up Supabase

1. Create a new Supabase project
2. Run the SQL from `database-schema.sql` to create the users table
3. Create a storage bucket named `uploads`
4. Configure storage policies (see `BUCKET_SETUP.md`)

### 5. Start the Application

```bash
npm start
```

The app will be available at `http://localhost:3000`

## Deployment

### Deploy to Render.com

1. Connect your GitHub repository to Render
2. Create a new Web Service
3. Set the following environment variables:
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `DODO_PAYMENTS_API_KEY`
   - `DODO_PRODUCT_ID`
4. Deploy!

For detailed deployment instructions, see `RENDER_TROUBLESHOOTING.md`

## Usage

### For Users

1. **Register/Login** - Create an account or sign in
2. **Upload Files** - Drag and drop or click to select files
3. **Monitor Progress** - Watch real-time upload progress
4. **Upgrade to Premium** - Click the "Upgrade to Premium" button for premium features

### For Developers

- **Authentication**: Handled by `auth.js` with Supabase integration
- **File Upload**: Managed by `script.js` with progress tracking
- **Payments**: Integrated via `dodo-payments.js` with Dodo Payments API
- **Server**: Express server in `server.js` handles environment variable injection

## API Configuration

### Supabase Configuration

- **URL**: `https://pevqdguawonvpvnqqpnp.supabase.co`
- **Storage**: `https://pevqdguawonvpvnqqpnp.storage.supabase.co`

### Dodo Payments Configuration

- **API Endpoint**: `https://test.dodopayments.com/checkouts`
- **Environment Variables**: `DODO_PAYMENTS_API_KEY`, `DODO_PRODUCT_ID`

## Security Features

- ✅ Environment variable-based API key management
- ✅ Server-side key injection (never exposed in client code)
- ✅ User authentication with secure password hashing
- ✅ Row Level Security (RLS) policies for data protection
- ✅ Secure file upload with unique naming
- ✅ Payment processing via secure Dodo Payments API

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.

## Support

For issues and questions:

1. Check the troubleshooting guides in the documentation files
2. Review the browser console for error messages
3. Verify your environment variables are set correctly
4. Ensure your Supabase project is properly configured

## Changelog

### Latest Version
- ✅ Clean codebase with only File Upload App components
- ✅ User authentication system
- ✅ File upload to Supabase storage
- ✅ Dodo Payments integration for premium upgrades
- ✅ Responsive design and mobile support
- ✅ Environment variable configuration
- ✅ Comprehensive documentation