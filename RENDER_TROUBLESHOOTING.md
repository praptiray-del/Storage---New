# Render Deployment Troubleshooting Guide

## 🚨 Bad Gateway Error - Common Causes & Solutions

### **1. Check Render Logs**
1. Go to your Render dashboard
2. Click on your service
3. Go to **"Logs"** tab
4. Look for error messages

### **2. Common Issues & Fixes**

#### **Issue: "Cannot find module 'express'"**
**Solution:**
- Make sure `package.json` includes Express dependency
- Check that build command is `npm install`

#### **Issue: "index.html not found"**
**Solution:**
- Verify all files are committed to GitHub
- Check that files are in the root directory (not in subfolders)

#### **Issue: "Port binding error"**
**Solution:**
- Server now binds to `0.0.0.0` (fixed in latest update)
- Uses `process.env.PORT` for Render compatibility

#### **Issue: "Environment variables not set"**
**Solution:**
- Go to Render service → Environment tab
- Add `SUPABASE_ANON_KEY` with your Supabase anon key
- Redeploy the service

### **3. Render Service Configuration**

Make sure your Render service is configured correctly:

| Setting | Value |
|---------|-------|
| **Environment** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Instance Type** | `Free` (or upgrade) |

### **4. Health Check**

Test if your server is running:
- Visit: `https://your-app-name.onrender.com/health`
- Should return: `{"status":"OK","timestamp":"...","environment":{...}}`

### **5. Debugging Steps**

1. **Check Build Logs:**
   - Look for successful `npm install`
   - Verify all dependencies installed

2. **Check Runtime Logs:**
   - Look for server startup messages
   - Check for file system errors
   - Verify environment variables

3. **Test Health Endpoint:**
   - Visit `/health` endpoint
   - Check environment variable status

### **6. Manual Redeploy**

If issues persist:
1. Go to Render dashboard
2. Click on your service
3. Click **"Manual Deploy"** → **"Deploy latest commit"**
4. Wait for deployment to complete
5. Check logs for any errors

### **7. Common Error Messages**

| Error | Cause | Solution |
|-------|-------|----------|
| `Bad Gateway` | Server not responding | Check logs, verify server starts |
| `Module not found` | Missing dependencies | Check package.json, run npm install |
| `Port already in use` | Port conflict | Server now uses process.env.PORT |
| `File not found` | Missing files | Verify all files committed to Git |

### **8. Still Having Issues?**

1. **Check the logs** for specific error messages
2. **Verify all files** are in the repository
3. **Test locally** if possible (requires Node.js)
4. **Contact Render support** with specific error messages

### **9. Quick Fixes**

**If server keeps crashing:**
```bash
# Check if all files exist
ls -la

# Verify package.json
cat package.json

# Test server locally (if Node.js available)
node server.js
```

**If environment variables not working:**
- Double-check variable names: `SUPABASE_ANON_KEY`
- Ensure no extra spaces or quotes
- Redeploy after adding variables
