# Configuration Guide

This document explains how to configure the Android app for your environment.

## Required Configurations

### 1. Supabase Configuration

**File**: `app/src/main/java/com/storage/files/data/api/SupabaseClient.kt`

```kotlin
object SupabaseClient {
    private const val SUPABASE_URL = "https://your-project.supabase.co"
    private const val SUPABASE_ANON_KEY = "your-anon-key-here"
    // ...
}
```

**How to get these values:**

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to Settings → API
4. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** key → `SUPABASE_ANON_KEY`

### 2. Backend API Configuration

**File**: `app/src/main/java/com/storage/files/data/api/RetrofitClient.kt`

```kotlin
object RetrofitClient {
    private const val BASE_URL = "https://your-render-app.onrender.com/"
    // ...
}
```

**Update with your backend URL:**
- Production: `https://your-app.onrender.com/`
- Local development: `http://YOUR_LOCAL_IP:3000/`
  - Never use `localhost` - use your machine's IP address
  - Find your IP: `ifconfig` (Mac/Linux) or `ipconfig` (Windows)

### 3. Local SDK Path

**File**: `local.properties` (create this file in the `android-app` directory)

```properties
sdk.dir=/Users/YOUR_USERNAME/Library/Android/sdk
```

**Platform-specific paths:**
- **macOS**: `/Users/YOUR_USERNAME/Library/Android/sdk`
- **Windows**: `C:\\Users\\YOUR_USERNAME\\AppData\\Local\\Android\\Sdk`
- **Linux**: `/home/YOUR_USERNAME/Android/Sdk`

## Optional Configurations

### App Icon

The app currently uses Android's built-in upload icon as a placeholder. To add a custom icon:

1. Create your icon in various sizes:
   - `mipmap-hdpi/ic_launcher.png` (72x72)
   - `mipmap-mdpi/ic_launcher.png` (48x48)
   - `mipmap-xhdpi/ic_launcher.png` (96x96)
   - `mipmap-xxhdpi/ic_launcher.png` (144x144)
   - `mipmap-xxxhdpi/ic_launcher.png` (192x192)

2. Update `AndroidManifest.xml`:
   ```xml
   <application
       android:icon="@mipmap/ic_launcher"
       android:roundIcon="@mipmap/ic_launcher_round"
       ...>
   ```

### Network Configuration (Local Development)

For local development with HTTP:

**File**: `app/src/main/AndroidManifest.xml`

```xml
<application
    android:usesCleartextTraffic="true"
    ...>
```

⚠️ **Important**: Set to `false` in production!

### Logging Level

**File**: `app/src/main/java/com/storage/files/data/api/RetrofitClient.kt`

```kotlin
private val loggingInterceptor = HttpLoggingInterceptor().apply {
    level = HttpLoggingInterceptor.Level.BODY  // Change to NONE in production
}
```

**Levels:**
- `NONE`: No logging
- `BASIC`: Request/response line only
- `HEADERS`: Request/response line and headers
- `BODY`: Full request/response (development only)

## Environment-Specific Setup

### Development

1. Use `usesCleartextTraffic="true"` for local testing
2. Set logging to `BODY` level
3. Use local IP address for backend URL
4. Test on emulator or physical device

### Staging

1. Use HTTPS URLs
2. Set logging to `HEADERS` or `BASIC`
3. Test on multiple devices
4. Verify all API endpoints

### Production

1. Set `usesCleartextTraffic="false"`
2. Set logging to `NONE`
3. Use production backend URL
4. Enable ProGuard/R8 optimization
5. Sign with release keystore

## Supabase Setup Requirements

Ensure your Supabase project has:

1. **Authentication enabled** (Email provider)
2. **`users` table** with columns:
   - `id` (uuid, primary key)
   - `username` (text)
   - `email` (text)
   - `is_premium` (boolean, default false)
   - `created_at` (timestamp)

3. **Storage bucket** for file uploads (named `user-uploads`)

4. **Row Level Security (RLS)** policies configured

## Troubleshooting

### Authentication Issues

**Problem**: Login fails with "Invalid credentials"
**Solution**: 
- Verify SUPABASE_URL and SUPABASE_ANON_KEY
- Check that the user exists in Supabase Auth
- Review Logcat for detailed error messages

### Network Issues

**Problem**: "Connection refused" or "Unable to resolve host"
**Solution**:
- Verify BASE_URL is correct
- Check internet/network connectivity
- Ensure backend server is running
- For local dev, use IP address not localhost

### File Upload Issues

**Problem**: File upload fails or returns 500 error
**Solution**:
- Check storage permissions are granted
- Verify backend `/api/upload` endpoint is working
- Check file size limits
- Review backend logs for errors

## Security Best Practices

1. **Never commit secrets**: Add `local.properties` to `.gitignore`
2. **Use environment variables**: For CI/CD, inject configs at build time
3. **Rotate keys regularly**: Update API keys periodically
4. **Enable HTTPS**: Always use HTTPS in production
5. **Secure storage**: Session tokens are stored in encrypted SharedPreferences

## Additional Resources

- [Supabase Android Docs](https://supabase.com/docs/reference/kotlin/introduction)
- [Android Developer Guide](https://developer.android.com/guide)
- [Material Design 3](https://m3.material.io/)
- [Retrofit Documentation](https://square.github.io/retrofit/)

## Support

For issues specific to:
- **Android app**: Check QUICKSTART.md and README.md
- **Backend API**: See main project documentation
- **Supabase**: Visit Supabase documentation and support

