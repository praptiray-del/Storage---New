package com.storage.files.ui.files

import android.content.Context
import android.net.Uri
import android.provider.OpenableColumns
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.storage.files.data.api.RetrofitClient
import com.storage.files.util.DebugLogger
import kotlinx.coroutines.launch
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.RequestBody.Companion.asRequestBody
import java.io.File
import java.io.FileOutputStream

class FileUploadViewModel : ViewModel() {
    private val _uploadProgress = MutableLiveData<Int>()
    val uploadProgress: LiveData<Int> = _uploadProgress

    private val _uploadResult = MutableLiveData<Result<Unit>>()
    val uploadResult: LiveData<Result<Unit>> = _uploadResult

    private val _isUploading = MutableLiveData<Boolean>()
    val isUploading: LiveData<Boolean> = _isUploading

    fun uploadFiles(context: Context, uris: List<Uri>) {
        viewModelScope.launch {
            try {
                _isUploading.value = true
                _uploadProgress.value = 0
                DebugLogger.log("UPLOAD", "Starting upload for ${uris.size} files")

                // Check if session token is set
                val prefs = context.getSharedPreferences("auth_prefs", Context.MODE_PRIVATE)
                val token = prefs.getString("session_token", null)
                DebugLogger.log("UPLOAD", "Session token: ${token?.take(10)}...")
                
                if (token.isNullOrEmpty()) {
                    DebugLogger.log("UPLOAD", "ERROR: No session token found!")
                    _uploadResult.value = Result.failure(Exception("Not authenticated"))
                    return@launch
                }

                val fileParts = mutableListOf<MultipartBody.Part>()

                uris.forEach { uri ->
                    val fileName = getFileNameFromUri(context, uri)
                    val mimeType = getMimeTypeFromUri(context, uri)
                    DebugLogger.log("UPLOAD", "Preparing file: $fileName")
                    DebugLogger.log("UPLOAD", "Detected mimetype: $mimeType")
                    val file = createTempFileFromUri(context, uri)
                    file?.let {
                        val requestBody = it.asRequestBody(mimeType.toMediaTypeOrNull())
                        val part = MultipartBody.Part.createFormData(
                            "files",
                            fileName,
                            requestBody
                        )
                        fileParts.add(part)
                    }
                }

                if (fileParts.isNotEmpty()) {
                    DebugLogger.log("UPLOAD", "Sending ${fileParts.size} files to server...")
                    val response = RetrofitClient.apiService.uploadFiles(fileParts)
                    DebugLogger.log("UPLOAD", "Response code: ${response.code()}")
                    
                    if (response.isSuccessful) {
                        DebugLogger.log("UPLOAD", "Upload successful!")
                        _uploadResult.value = Result.success(Unit)
                    } else {
                        val errorBody = response.errorBody()?.string() ?: response.message()
                        DebugLogger.log("UPLOAD", "ERROR: Upload failed - $errorBody")
                        _uploadResult.value = Result.failure(Exception("Upload failed: $errorBody"))
                    }

                    // Clean up temp files
                    uris.forEach { uri ->
                        val fileName = getFileNameFromUri(context, uri)
                        val tempFile = File(context.cacheDir, fileName)
                        if (tempFile.exists()) {
                            tempFile.delete()
                        }
                    }
                } else {
                    DebugLogger.log("UPLOAD", "ERROR: No files to upload")
                    _uploadResult.value = Result.failure(Exception("No files to upload"))
                }
            } catch (e: Exception) {
                DebugLogger.log("UPLOAD", "EXCEPTION: ${e.message}")
                e.printStackTrace()
                _uploadResult.value = Result.failure(e)
            } finally {
                _isUploading.value = false
            }
        }
    }

    private fun createTempFileFromUri(context: Context, uri: Uri): File? {
        return try {
            val fileName = getFileNameFromUri(context, uri)
            val tempFile = File(context.cacheDir, fileName)
            
            context.contentResolver.openInputStream(uri)?.use { input ->
                FileOutputStream(tempFile).use { output ->
                    input.copyTo(output)
                }
            }
            
            tempFile
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }

    private fun getFileNameFromUri(context: Context, uri: Uri): String {
        var fileName = "file_${System.currentTimeMillis()}"
        context.contentResolver.query(uri, null, null, null, null)?.use { cursor ->
            val nameIndex = cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME)
            if (cursor.moveToFirst() && nameIndex >= 0) {
                fileName = cursor.getString(nameIndex)
            }
        }
        return fileName
    }
    
    private fun getMimeTypeFromUri(context: Context, uri: Uri): String {
        // Try to get mimetype from ContentResolver
        val mimeType = context.contentResolver.getType(uri)
        if (!mimeType.isNullOrEmpty()) {
            return mimeType
        }
        
        // Fallback: detect from file extension
        val fileName = getFileNameFromUri(context, uri)
        val extension = fileName.substringAfterLast('.', "").lowercase()
        
        return when (extension) {
            "jpg", "jpeg" -> "image/jpeg"
            "png" -> "image/png"
            "gif" -> "image/gif"
            "webp" -> "image/webp"
            "pdf" -> "application/pdf"
            "txt" -> "text/plain"
            "mp4" -> "video/mp4"
            "mp3" -> "audio/mpeg"
            "zip" -> "application/zip"
            else -> "application/octet-stream"
        }
    }
}

