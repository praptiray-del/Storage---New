package com.storage.files.ui.files

import android.content.Context
import android.net.Uri
import android.provider.OpenableColumns
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.storage.files.data.api.RetrofitClient
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

                val fileParts = mutableListOf<MultipartBody.Part>()

                uris.forEach { uri ->
                    val file = createTempFileFromUri(context, uri)
                    file?.let {
                        val requestBody = it.asRequestBody("multipart/form-data".toMediaTypeOrNull())
                        val part = MultipartBody.Part.createFormData(
                            "files",
                            getFileNameFromUri(context, uri),
                            requestBody
                        )
                        fileParts.add(part)
                    }
                }

                if (fileParts.isNotEmpty()) {
                    val response = RetrofitClient.apiService.uploadFiles(fileParts)
                    
                    if (response.isSuccessful) {
                        _uploadResult.value = Result.success(Unit)
                    } else {
                        _uploadResult.value = Result.failure(Exception("Upload failed: ${response.message()}"))
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
                    _uploadResult.value = Result.failure(Exception("No files to upload"))
                }
            } catch (e: Exception) {
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
}

