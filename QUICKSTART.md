# Quick Start Guide

## What Changed? (TL;DR)

Your app has been **completely refactored** for security:
- ❌ **Before**: API keys exposed in frontend
- ✅ **After**: All API keys server-side only, zero credential exposure

## Setup in 3 Steps

### 1. Install Dependencies

```bash
npm install
```

This will install:
- `express` - Web server
- `multer` - File upload handling

### 2. Set Environment Variables

**Option A: Local Development**

Create `.env` file (copy from `env.example`):
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key
DODO_PAYMENTS_API_KEY=your-dodo-key
DODO_PRODUCT_ID=your-product-id
PORT=3000
```

**Option B: Render Deployment**

Go to Render dashboard → Your service → Environment tab:
- Add `SUPABASE_URL`
- Add `SUPABASE_ANON_KEY`
- Add `SUPABASE_SERVICE_ROLE_KEY`
- Add `DODO_PAYMENTS_API_KEY`
- Add `DODO_PRODUCT_ID`

### 3. Run

**Local:**
```bash
npm start
```
Open: `http://localhost:3000`

**Render:**
Just push to GitHub - it auto-deploys!

## Testing

1. **Open the app** in your browser
2. **Open DevTools** (F12) → Network tab
3. **Register/Login** - verify it works
4. **Upload a file** - verify upload succeeds
5. **Check Network tab** - verify NO API keys visible anywhere!

## Architecture Overview

```
┌─────────────┐
│   Browser   │ No business logic, no API keys
│  (Frontend) │ Just UI + backend API calls
└──────┬──────┘
       │ HTTP API calls
       │ /api/auth/*
       │ /api/upload
       │ /api/payment/*
       │
┌──────▼──────┐
│   Server    │ All business logic here
│  (Backend)  │ Uses environment variables
│  server.js  │ Talks to Supabase & Dodo
└──────┬──────┘
       │
   ┌───▼───┬─────────┐
   │       │         │
┌──▼──┐ ┌──▼──┐ ┌───▼────┐
│Supa-│ │Supa-│ │  Dodo  │
│base │ │base │ │Payments│
│ DB  │ │Store│ │        │
└─────┘ └─────┘ └────────┘
```

## New Backend Endpoints

All at `/api/*`:

| Endpoint | Method | Auth? | Purpose |
|----------|--------|-------|---------|
| `/api/auth/register` | POST | No | Register user |
| `/api/auth/login` | POST | No | Login user |
| `/api/auth/me` | GET | Yes | Get current user |
| `/api/auth/logout` | POST | Yes | Logout user |
| `/api/upload` | POST | Yes | Upload files |
| `/api/payment/create-checkout` | POST | Yes | Create payment |
| `/health` | GET | No | Health check |

## What Frontend Does Now

**Before (542 lines with business logic):**
```javascript
// Supabase API calls
const response = await fetch(supabaseUrl + '/storage/...');
// Password hashing
const hash = await crypto.subtle.digest(...);
// File sanitization
fileName.replace(/[^a-z0-9]/g, '_');
```

**After (213 lines, pure UI):**
```javascript
// Just call backend
const response = await fetch('/api/upload', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});
```

## Security Checklist

After deployment, verify:

- [ ] Open browser DevTools → Sources
- [ ] Check all .js files - NO API keys visible
- [ ] Check HTML source - NO meta tags with keys
- [ ] Check Network tab - NO keys in requests
- [ ] Check Application → LocalStorage - only session token
- [ ] Login/Register works
- [ ] File upload works
- [ ] Payment redirect works

## Troubleshooting

### "No session token found"
→ User needs to login again

### "Upload failed"
→ Check `SUPABASE_URL` is set correctly
→ Verify uploads bucket exists in Supabase

### "Payment system not configured"
→ Check `DODO_PAYMENTS_API_KEY` is set
→ Check `DODO_PRODUCT_ID` is set

### Server won't start
→ Run `npm install` first
→ Check all environment variables are set

## Files Modified

| File | Change |
|------|--------|
| `server.js` | Added 7 API endpoints + business logic |
| `auth.js` | Removed Supabase logic, added API calls |
| `script.js` | Removed all business logic, simplified |
| `dodo-payments.js` | Removed API calls, calls backend |
| `index.html` | Removed all credential meta tags |
| `package.json` | Added multer dependency |

## Documentation

- **ARCHITECTURE.md** - Complete architecture documentation
- **REFACTORING_SUMMARY.md** - Detailed refactoring notes
- **README.md** - Updated with new architecture
- **env.example** - Environment variables template

## Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Set environment variables (see step 2 above)
3. ✅ Test locally: `npm start`
4. ✅ Verify security: Check no keys in frontend
5. ✅ Deploy to Render
6. ✅ Set environment variables in Render
7. ✅ Test production deployment

## Need Help?

1. Check `ARCHITECTURE.md` for API details
2. Check `REFACTORING_SUMMARY.md` for what changed
3. Check `README.md` for full documentation
4. Verify environment variables are set correctly
5. Check server logs for specific errors

