# Android App Quick Start Guide

This guide will help you get the Android client up and running quickly.

## Prerequisites

- Android Studio Narwhal 4 Feature Drop | 2025.1.4 or later
- Android SDK installed
- A Supabase account with a project
- The backend server running (see main project QUICKSTART.md)

## 5-Minute Setup

### Step 1: Configure Local SDK Path

Create `local.properties` in the `android-app` directory:

```properties
sdk.dir=/Users/YOUR_USERNAME/Library/Android/sdk
```

Replace `YOUR_USERNAME` with your actual username. On Mac, you can find it with:
```bash
echo $HOME/Library/Android/sdk
```

### Step 2: Update Supabase Configuration

Edit `app/src/main/java/com/storage/files/data/api/SupabaseClient.kt`:

```kotlin
private const val SUPABASE_URL = "https://xxxxx.supabase.co"
private const val SUPABASE_ANON_KEY = "your-anon-key"
```

Get these values from your Supabase project dashboard:
1. Go to https://supabase.com/dashboard
2. Select your project
3. Click "Settings" → "API"
4. Copy the "Project URL" and "anon public" key

### Step 3: Update Backend URL

Edit `app/src/main/java/com/storage/files/data/api/RetrofitClient.kt`:

```kotlin
private const val BASE_URL = "https://your-app.onrender.com/"
```

Replace with your deployed backend URL (e.g., from Render.com).

### Step 4: Build and Run

#### Using Android Studio:
1. Open Android Studio
2. Click "Open" and select the `android-app` folder
3. Wait for Gradle sync to complete
4. Click the green "Run" button (or press Shift+F10)
5. Select your device/emulator

#### Using Command Line:
```bash
cd android-app
./gradlew assembleDebug
./gradlew installDebug  # Install to connected device
```

## Testing the App

### 1. Register a New Account
- Open the app
- Click "Register"
- Enter username and password (email is optional)
- Click "Register"

### 2. Login
- Return to login screen
- Enter your credentials
- Click "Login"

### 3. Upload Files
- Click the floating "+" button
- Click "Select Files"
- Choose one or more files
- Click "Upload"

### 4. View Files
- Your uploaded files will appear in the main screen
- Tap a file to view details
- Tap the delete icon to remove a file

## Common Issues

### Issue: "SDK location not found"
**Solution**: Create `local.properties` with your SDK path (see Step 1)

### Issue: "Authentication failed"
**Solution**: Check your Supabase URL and anon key in `SupabaseClient.kt`

### Issue: "Network error" or "Connection refused"
**Solution**: 
- Verify the backend URL in `RetrofitClient.kt`
- Ensure the backend server is running
- Check your internet connection

### Issue: "File upload fails"
**Solution**:
- Grant storage permissions when prompted
- Check that the backend is accessible
- Ensure files are not too large

### Issue: Gradle build fails
**Solution**:
```bash
cd android-app
./gradlew clean
./gradlew --refresh-dependencies
./gradlew assembleDebug
```

## Local Development

### Testing with Local Backend

If your backend is running on `http://localhost:3000`:

1. Find your computer's local IP address:
   ```bash
   # Mac/Linux
   ifconfig | grep "inet "
   
   # Windows
   ipconfig
   ```

2. Update `RetrofitClient.kt`:
   ```kotlin
   private const val BASE_URL = "http://192.168.1.xxx:3000/"
   ```
   Replace `192.168.1.xxx` with your actual IP

3. Keep `android:usesCleartextTraffic="true"` in AndroidManifest.xml

### Using Android Emulator

1. In Android Studio, click "Device Manager"
2. Create a new virtual device or use existing
3. Choose a device with API level 24 or higher
4. Start the emulator
5. Run your app

### Using Physical Device

1. Enable "Developer Options" on your Android device:
   - Go to Settings → About Phone
   - Tap "Build Number" 7 times
   
2. Enable "USB Debugging":
   - Go to Settings → Developer Options
   - Enable "USB Debugging"

3. Connect device via USB

4. Run the app from Android Studio

## Next Steps

- Explore the codebase in `app/src/main/java/com/storage/files/`
- Customize the UI in `app/src/main/res/layout/`
- Update colors/themes in `app/src/main/res/values/`
- Read the full README.md for architecture details

## Getting Help

If you encounter issues:

1. Check the build output in Android Studio
2. Review the Logcat for runtime errors
3. Ensure all dependencies are properly synced
4. Verify your Supabase and backend configurations

## Production Deployment

Before deploying to production:

1. Update `BASE_URL` to your production backend
2. Set `android:usesCleartextTraffic="false"` in AndroidManifest.xml
3. Generate a release keystore
4. Configure ProGuard rules for optimization
5. Test thoroughly on multiple devices
6. Build a release APK/AAB:
   ```bash
   ./gradlew assembleRelease
   ```

Happy coding! 🚀

