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
- 🔒 **Secure** - Backend-centric architecture with zero credential exposure
- 🚀 **RESTful API** - All business logic handled by backend

## Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+) - Pure UI layer, no business logic
- **Backend**: Node.js with Express - RESTful API with all business logic
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **Authentication**: Session-based authentication with backend API
- **Payments**: Dodo Payments API (backend integration)
- **File Upload**: Multer for multipart/form-data
- **Deployment**: Render.com

## Project Structure

```
├── index.html                 # Main HTML file (no credentials)
├── styles.css                 # CSS styling and responsive design
├── script.js                  # Frontend UI logic (no business logic)
├── auth.js                    # Frontend auth UI (calls backend API)
├── dodo-payments.js           # Frontend payment UI (calls backend API)
├── server.js                  # Backend API server with all business logic
├── package.json               # Node.js dependencies (Express, Multer)
├── env.example                # Environment variables template
├── database-schema.sql        # Database schema for user management
├── ARCHITECTURE.md            # Architecture documentation
├── REFACTORING_SUMMARY.md     # Refactoring details
├── AUTHENTICATION_SETUP.md    # Authentication setup guide
├── BUCKET_SETUP.md            # Supabase storage setup guide
├── RENDER_TROUBLESHOOTING.md  # Deployment troubleshooting
└── README.md                  # This file
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

Create a `.env` file (copy from `env.example`) and set these variables:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
DODO_PAYMENTS_API_KEY=your_dodo_payments_api_key_here
DODO_PRODUCT_ID=your_dodo_product_id_here
PORT=3000
```

**Important:** All these variables must be set on the server. They are never exposed to the frontend.

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
3. Set the following environment variables in Render dashboard:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `DODO_PAYMENTS_API_KEY`
   - `DODO_PRODUCT_ID`
   - `PORT` (optional, defaults to 3000)
4. Deploy!

For detailed deployment instructions, see `RENDER_TROUBLESHOOTING.md`

## Usage

### For Users

1. **Register/Login** - Create an account or sign in
2. **Upload Files** - Drag and drop or click to select files
3. **Monitor Progress** - Watch real-time upload progress
4. **Upgrade to Premium** - Click the "Upgrade to Premium" button for premium features

### For Developers

- **Frontend**: Pure UI layer - no business logic, no API keys
  - `auth.js`: Authentication UI → calls `/api/auth/*` endpoints
  - `script.js`: Upload UI → calls `/api/upload` endpoint
  - `dodo-payments.js`: Payment UI → calls `/api/payment/*` endpoint

- **Backend**: RESTful API with all business logic in `server.js`
  - Authentication endpoints: register, login, logout, get user
  - File upload endpoint: validates, sanitizes, uploads to Supabase
  - Payment endpoint: creates Dodo Payments checkout session
  - Session management: in-memory token-based authentication

See `ARCHITECTURE.md` for detailed API documentation.

## Backend API Endpoints

All endpoints are accessible at `/api/*`:

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login (returns session token)
- `GET /api/auth/me` - Get current user (requires auth)
- `POST /api/auth/logout` - Logout (requires auth)

### Files
- `POST /api/upload` - Upload files (requires auth)

### Payments
- `POST /api/payment/create-checkout` - Create checkout session (requires auth)

### Utility
- `GET /health` - Health check and environment status

For detailed API documentation, see `ARCHITECTURE.md`.

## Security Features

- ✅ **Zero Client-Side Secrets** - No API keys or credentials in frontend code
- ✅ **Backend-Only Business Logic** - All sensitive operations server-side
- ✅ **Session-Based Authentication** - Token-based auth with server validation
- ✅ **Server-Side Password Hashing** - SHA-256 with salt (backend only)
- ✅ **File Sanitization** - Backend validates and sanitizes all uploads
- ✅ **Environment Variables** - All secrets in server environment only
- ✅ **RESTful API** - Clean separation between UI and logic
- ✅ **Authorization** - All protected endpoints require valid session token

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

### v2.0.0 - Backend-Centric Refactor (Latest)
- 🔒 **SECURITY**: Completely refactored to backend-centric architecture
- ✅ Removed all API keys from frontend (HTML, JavaScript)
- ✅ Created RESTful API with 7 endpoints
- ✅ Moved all business logic to backend (auth, upload, payments)
- ✅ Implemented session-based authentication
- ✅ Added server-side password hashing
- ✅ Added server-side file sanitization
- ✅ Simplified frontend (60% code reduction)
- ✅ Added comprehensive documentation (ARCHITECTURE.md, REFACTORING_SUMMARY.md)
- ✅ Added environment variable template (env.example)
- ✅ Zero credentials exposed to client

### v1.0.0 - Initial Release
- ✅ Clean codebase with File Upload App components
- ✅ User authentication system
- ✅ File upload to Supabase storage
- ✅ Dodo Payments integration for premium upgrades
- ✅ Responsive design and mobile support
- ✅ Environment variable configuration