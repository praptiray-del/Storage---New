package com.storage.files.ui.files

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.storage.files.data.api.RetrofitClient
import com.storage.files.data.model.UploadedFile
import kotlinx.coroutines.launch

class FilesViewModel : ViewModel() {
    private val _files = MutableLiveData<List<UploadedFile>>()
    val files: LiveData<List<UploadedFile>> = _files

    private val _isLoading = MutableLiveData<Boolean>()
    val isLoading: LiveData<Boolean> = _isLoading

    private val _error = MutableLiveData<String?>()
    val error: LiveData<String?> = _error

    private val _deleteResult = MutableLiveData<Result<Unit>>()
    val deleteResult: LiveData<Result<Unit>> = _deleteResult

    fun loadFiles() {
        viewModelScope.launch {
            try {
                _isLoading.value = true
                _error.value = null

                val response = RetrofitClient.apiService.getUserFiles()
                if (response.isSuccessful && response.body() != null) {
                    _files.value = response.body()!!
                } else {
                    _error.value = "Failed to load files: ${response.message()}"
                    _files.value = emptyList()
                }
            } catch (e: Exception) {
                _error.value = "Error loading files: ${e.message}"
                _files.value = emptyList()
            } finally {
                _isLoading.value = false
            }
        }
    }

    fun deleteFile(fileId: String) {
        viewModelScope.launch {
            try {
                val response = RetrofitClient.apiService.deleteFile(fileId)
                if (response.isSuccessful) {
                    _deleteResult.value = Result.success(Unit)
                } else {
                    _deleteResult.value = Result.failure(Exception("Failed to delete file"))
                }
            } catch (e: Exception) {
                _deleteResult.value = Result.failure(e)
            }
        }
    }
}

