package com.storage.files.ui.auth

import android.content.Context
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.storage.files.data.api.RetrofitClient
import com.storage.files.data.model.User
import com.storage.files.util.DebugLogger
import kotlinx.coroutines.launch

class AuthViewModel : ViewModel() {
    private val _loginResult = MutableLiveData<Result<User>>()
    val loginResult: LiveData<Result<User>> = _loginResult

    private val _registerResult = MutableLiveData<Result<String>>()
    val registerResult: LiveData<Result<String>> = _registerResult

    private val _currentUser = MutableLiveData<User?>()
    val currentUser: LiveData<User?> = _currentUser

    private val _isLoading = MutableLiveData<Boolean>()
    val isLoading: LiveData<Boolean> = _isLoading

    fun login(context: Context, username: String, password: String) {
        viewModelScope.launch {
            try {
                _isLoading.value = true
                DebugLogger.log("AUTH", "Login attempt for user: $username")

                // Call backend login API
                val response = RetrofitClient.apiService.login(username, password)
                DebugLogger.log("AUTH", "Login response code: ${response.code()}")

                if (response.isSuccessful) {
                    val body = response.body()
                    val token = body?.get("sessionToken") as? String
                    val userData = body?.get("user") as? Map<*, *>

                    DebugLogger.log("AUTH", "Token received: ${token?.take(10)}...")
                    DebugLogger.log("AUTH", "User data: ${userData?.keys}")

                    if (token != null && userData != null) {
                        // Store token in SharedPreferences
                        val prefs = context.getSharedPreferences("auth_prefs", Context.MODE_PRIVATE)
                        prefs.edit().putString("session_token", token).apply()
                        DebugLogger.log("AUTH", "Token stored in SharedPreferences")
                        
                        // Set token for API calls
                        RetrofitClient.setSessionToken(token)
                        DebugLogger.log("AUTH", "Token set in RetrofitClient")

                        // Create user object
                        val user = User(
                            id = userData["id"] as? String ?: "",
                            username = userData["username"] as? String ?: username,
                            email = userData["email"] as? String ?: "",
                            isPremium = userData["is_premium"] as? Boolean ?: false
                        )
                        
                        DebugLogger.log("AUTH", "Login successful for ${user.username}")
                        _currentUser.value = user
                        _loginResult.value = Result.success(user)
                    } else {
                        DebugLogger.log("AUTH", "ERROR: Invalid response - missing token or user data")
                        _loginResult.value = Result.failure(Exception("Invalid response from server"))
                    }
                } else {
                    val errorMessage = response.errorBody()?.string() ?: "Login failed"
                    DebugLogger.log("AUTH", "ERROR: Login failed - $errorMessage")
                    _loginResult.value = Result.failure(Exception(errorMessage))
                }
            } catch (e: Exception) {
                DebugLogger.log("AUTH", "EXCEPTION: ${e.message}")
                _loginResult.value = Result.failure(e)
            } finally {
                _isLoading.value = false
            }
        }
    }

    fun register(username: String, email: String, password: String) {
        viewModelScope.launch {
            try {
                _isLoading.value = true

                // Call backend register API
                val emailToUse = if (email.isEmpty()) "$username@storage.local" else email
                val response = RetrofitClient.apiService.register(username, emailToUse, password)

                if (response.isSuccessful) {
                    _registerResult.value = Result.success("Registration successful! Please login.")
                } else {
                    val errorMessage = response.errorBody()?.string() ?: "Registration failed"
                    _registerResult.value = Result.failure(Exception(errorMessage))
                }
            } catch (e: Exception) {
                _registerResult.value = Result.failure(e)
            } finally {
                _isLoading.value = false
            }
        }
    }

    fun logout(context: Context) {
        viewModelScope.launch {
            try {
                // Call backend logout API
                RetrofitClient.apiService.logout()

                // Clear local session
                val prefs = context.getSharedPreferences("auth_prefs", Context.MODE_PRIVATE)
                prefs.edit().clear().apply()
                RetrofitClient.setSessionToken(null)
                
                _currentUser.value = null
            } catch (e: Exception) {
                e.printStackTrace()
                // Still clear local session even if API call fails
                val prefs = context.getSharedPreferences("auth_prefs", Context.MODE_PRIVATE)
                prefs.edit().clear().apply()
                RetrofitClient.setSessionToken(null)
                _currentUser.value = null
            }
        }
    }

    fun checkSession(context: Context) {
        viewModelScope.launch {
            try {
                val prefs = context.getSharedPreferences("auth_prefs", Context.MODE_PRIVATE)
                val token = prefs.getString("session_token", null)
                
                if (token != null) {
                    RetrofitClient.setSessionToken(token)

                    // Try to fetch user details from backend
                    val response = RetrofitClient.apiService.getCurrentUser()
                    if (response.isSuccessful && response.body() != null) {
                        _currentUser.value = response.body()
                    } else {
                        // Token is invalid, clear it
                        prefs.edit().clear().apply()
                        RetrofitClient.setSessionToken(null)
                    }
                }
            } catch (e: Exception) {
                e.printStackTrace()
                // Clear session on error
                val prefs = context.getSharedPreferences("auth_prefs", Context.MODE_PRIVATE)
                prefs.edit().clear().apply()
                RetrofitClient.setSessionToken(null)
            }
        }
    }
}

