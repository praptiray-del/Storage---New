# Architecture Documentation

## Overview

This application follows a **backend-centric architecture** where all business logic resides on the server, and the frontend only handles UI/UX and API calls.

## Architecture Changes

### Before (Insecure)
- ❌ API keys exposed in frontend via meta tags and window variables
- ❌ Direct Supabase API calls from browser
- ❌ Password hashing performed in browser
- ❌ File sanitization in frontend
- ❌ Direct Dodo Payments API calls from browser

### After (Secure)
- ✅ All API keys stored securely in backend environment variables
- ✅ Backend API endpoints for all operations
- ✅ Password hashing performed on server
- ✅ File sanitization on server
- ✅ Session-based authentication
- ✅ No sensitive data exposed to frontend

## Backend API Endpoints

### Authentication Endpoints

#### `POST /api/auth/register`
Register a new user.

**Request Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "number",
    "username": "string",
    "email": "string"
  }
}
```

#### `POST /api/auth/login`
Login an existing user.

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "success": true,
  "sessionToken": "string",
  "user": {
    "id": "number",
    "username": "string",
    "email": "string"
  }
}
```

#### `GET /api/auth/me`
Get current authenticated user.

**Headers:**
```
Authorization: Bearer <sessionToken>
```

**Response:**
```json
{
  "user": {
    "id": "number",
    "username": "string",
    "email": "string"
  }
}
```

#### `POST /api/auth/logout`
Logout current user.

**Headers:**
```
Authorization: Bearer <sessionToken>
```

**Response:**
```json
{
  "success": true
}
```

### File Upload Endpoints

#### `POST /api/upload`
Upload files to Supabase storage.

**Headers:**
```
Authorization: Bearer <sessionToken>
Content-Type: multipart/form-data
```

**Request Body:**
FormData with multiple files in `files` field.

**Response:**
```json
{
  "success": true,
  "files": [
    {
      "originalName": "string",
      "storageName": "string",
      "size": "number",
      "type": "string"
    }
  ]
}
```

### Payment Endpoints

#### `POST /api/payment/create-checkout`
Create a Dodo Payments checkout session.

**Headers:**
```
Authorization: Bearer <sessionToken>
```

**Response:**
```json
{
  "success": true,
  "checkoutUrl": "string",
  "checkoutId": "string"
}
```

## Frontend Architecture

### `auth.js` - Authentication Manager
- Handles login/register UI
- Calls backend authentication endpoints
- Manages session tokens in localStorage
- No business logic - pure UI layer

### `script.js` - Main Application
- Handles file selection and drag-drop UI
- Calls backend upload endpoint
- Progress tracking and error handling
- No direct API calls to external services

### `dodo-payments.js` - Payment Handler
- Handles payment UI
- Calls backend payment endpoints
- Shows success/error messages
- No direct Dodo Payments API calls

## Security Features

1. **Environment Variables**: All sensitive keys stored server-side
2. **Session Management**: Server-managed sessions (in-memory)
3. **Password Hashing**: SHA-256 hashing on server with salt
4. **File Validation**: Server-side file sanitization
5. **Authorization**: Token-based auth for all protected endpoints
6. **No Client Secrets**: Zero sensitive data in frontend code

## Environment Variables

Required environment variables (see `.env.example`):

- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key (preferred)
- `DODO_PAYMENTS_API_KEY`: Dodo Payments API key
- `DODO_PRODUCT_ID`: Dodo Payments product ID
- `PORT`: Server port (default: 3000)

## Session Management

Currently using **in-memory sessions** (Map).

⚠️ **Production Recommendation**: Use Redis or similar for session storage to support:
- Multiple server instances
- Session persistence across restarts
- Better scalability

## Data Flow

### User Registration
```
Frontend → POST /api/auth/register → Backend
                                      ↓
                              Hash Password
                                      ↓
                              Supabase API
                                      ↓
                              Create User
                                      ↓
Frontend ← User Data ← Response
```

### User Login
```
Frontend → POST /api/auth/login → Backend
                                   ↓
                           Hash Password
                                   ↓
                           Supabase API
                                   ↓
                           Verify User
                                   ↓
                      Create Session Token
                                   ↓
Frontend ← Session Token ← Response
```

### File Upload
```
Frontend → POST /api/upload (with files) → Backend
                                            ↓
                                    Verify Session
                                            ↓
                                    Sanitize Files
                                            ↓
                                    Upload to Supabase
                                            ↓
                                    Track in Database
                                            ↓
Frontend ← Upload Result ← Response
```

### Payment
```
Frontend → POST /api/payment/create-checkout → Backend
                                                ↓
                                        Verify Session
                                                ↓
                                        Dodo Payments API
                                                ↓
                                        Create Checkout
                                                ↓
Frontend ← Checkout URL ← Response
          ↓
    Redirect to Dodo
```

## Deployment Notes

### Required Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set environment variables in your deployment platform

3. Ensure Supabase database has required tables:
   - `users` (id, username, email, password_hash, created_at)
   - `user_uploads` (id, user_id, file_name, file_size, file_type, storage_path, created_at)

4. Create Supabase storage bucket named `uploads`

### Render Deployment

Add environment variables in Render dashboard:
- Go to your service → Environment tab
- Add all required variables from `.env.example`

### Local Development

1. Create `.env` file from `.env.example`
2. Fill in your actual values
3. Run: `npm start`
4. Access: `http://localhost:3000`

## Future Improvements

1. **Session Store**: Migrate to Redis for production
2. **Password Hashing**: Use bcrypt instead of SHA-256
3. **Rate Limiting**: Add rate limiting to prevent abuse
4. **File Validation**: Add file type and size validation
5. **CORS**: Configure CORS for production
6. **HTTPS**: Enforce HTTPS in production
7. **JWT Tokens**: Consider JWT for stateless authentication
8. **Refresh Tokens**: Implement token refresh mechanism

