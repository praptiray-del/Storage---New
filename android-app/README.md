# Storage Files - Android Client

An Android client application for the Storage Files project. This app allows users to upload, view, and manage their files with Supabase authentication.

## Features

- **Supabase Authentication**: Secure login and registration using Supabase Auth
- **File Upload**: Upload multiple files from your device
- **File Management**: View and delete uploaded files
- **Premium Status**: Display user's premium status from the backend
- **Material Design 3**: Modern and beautiful UI

## Prerequisites

Before building the Android app, ensure you have:

- Android Studio Narwhal 4 Feature Drop | 2025.1.4 or later
- JDK 17 or later
- Android SDK with minimum API level 24 (Android 7.0)
- A running backend server (see main project README)

## Setup

### 1. Configure Supabase

Edit `app/src/main/java/com/storage/files/data/api/SupabaseClient.kt`:

```kotlin
private const val SUPABASE_URL = "https://your-project.supabase.co"
private const val SUPABASE_ANON_KEY = "your-anon-key-here"
```

Replace with your actual Supabase project URL and anon key.

### 2. Configure Backend URL

Edit `app/src/main/java/com/storage/files/data/api/RetrofitClient.kt`:

```kotlin
private const val BASE_URL = "https://your-render-app.onrender.com/"
```

Replace with your actual backend URL.

### 3. Create local.properties

Create a file named `local.properties` in the `android-app` directory:

```properties
sdk.dir=/path/to/your/Android/sdk
```

Replace with your actual Android SDK path. On Mac, this is typically:
- `/Users/YOUR_USERNAME/Library/Android/sdk`

On Windows, it's typically:
- `C\:\\Users\\YOUR_USERNAME\\AppData\\Local\\Android\\Sdk`

### 4. Build the Project

Open the `android-app` folder in Android Studio and let it sync the Gradle files.

Or build from command line:

```bash
cd android-app
./gradlew assembleDebug
```

## Project Structure

```
android-app/
├── app/
│   ├── src/
│   │   └── main/
│   │       ├── java/com/storage/files/
│   │       │   ├── data/
│   │       │   │   ├── api/          # API clients and interfaces
│   │       │   │   └── model/        # Data models
│   │       │   └── ui/
│   │       │       ├── auth/         # Login and registration
│   │       │       ├── main/         # Main file listing screen
│   │       │       └── files/        # File upload functionality
│   │       ├── res/
│   │       │   ├── layout/           # XML layouts
│   │       │   ├── values/           # Strings, colors, themes
│   │       │   └── menu/             # Menu definitions
│   │       └── AndroidManifest.xml
│   └── build.gradle                  # App-level dependencies
├── build.gradle                      # Project-level configuration
└── settings.gradle                   # Project settings
```

## Key Components

### Authentication
- **LoginActivity**: User login screen
- **RegisterActivity**: User registration screen
- **AuthViewModel**: Handles Supabase authentication logic

### File Management
- **MainActivity**: Displays uploaded files and premium status
- **FileUploadActivity**: File selection and upload interface
- **FilesViewModel**: Manages file operations

### API Integration
- **SupabaseClient**: Supabase SDK configuration
- **RetrofitClient**: REST API client for backend communication
- **ApiService**: API endpoint definitions

## Architecture

This app follows the MVVM (Model-View-ViewModel) architecture pattern:

- **Model**: Data classes in `data/model/`
- **View**: Activities and XML layouts
- **ViewModel**: Business logic in `ui/*/ViewModels`

## Libraries Used

- **Supabase Android SDK**: Authentication and data management
- **Retrofit**: HTTP client for REST API calls
- **OkHttp**: Network layer
- **Material Design 3**: UI components
- **AndroidX Lifecycle**: ViewModel and LiveData
- **Kotlin Coroutines**: Asynchronous operations

## Permissions

The app requires the following permissions:

- `INTERNET`: For network communication
- `READ_EXTERNAL_STORAGE`: For accessing files (Android 12 and below)
- `READ_MEDIA_IMAGES/VIDEO/AUDIO`: For accessing media files (Android 13+)

## Troubleshooting

### Build Issues

1. **Gradle sync failed**: Ensure you have the correct Android SDK installed
2. **Compilation errors**: Make sure you're using JDK 17
3. **Missing dependencies**: Run `./gradlew --refresh-dependencies`

### Runtime Issues

1. **Authentication fails**: Verify your Supabase URL and anon key
2. **File upload fails**: Check backend URL and network permissions
3. **Network errors**: Ensure `usesCleartextTraffic="true"` for local development

### Testing with Local Backend

If testing with a local backend (e.g., `http://localhost:3000`):

1. Use your computer's IP address instead of `localhost`
2. Ensure your device/emulator can reach your development machine
3. Keep `android:usesCleartextTraffic="true"` in the manifest

## Security Notes

- Never commit `local.properties` to version control
- The `SUPABASE_ANON_KEY` is safe to expose in client apps
- Session tokens are stored securely in SharedPreferences
- Always use HTTPS in production

## Contributing

When contributing to this Android client:

1. Follow Kotlin coding conventions
2. Use Material Design 3 components
3. Write descriptive commit messages
4. Test on multiple Android versions

## License

This project is part of the Storage Files application. See the main project README for license information.

