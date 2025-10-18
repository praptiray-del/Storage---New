package com.storage.files.ui.auth

import android.os.Bundle
import android.widget.Toast
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import com.google.android.material.button.MaterialButton
import com.google.android.material.textfield.TextInputEditText
import com.storage.files.R

class RegisterActivity : AppCompatActivity() {
    private val authViewModel: AuthViewModel by viewModels()

    private lateinit var usernameInput: TextInputEditText
    private lateinit var emailInput: TextInputEditText
    private lateinit var passwordInput: TextInputEditText
    private lateinit var confirmPasswordInput: TextInputEditText
    private lateinit var registerButton: MaterialButton
    private lateinit var backToLoginButton: MaterialButton

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_register)

        usernameInput = findViewById(R.id.usernameInput)
        emailInput = findViewById(R.id.emailInput)
        passwordInput = findViewById(R.id.passwordInput)
        confirmPasswordInput = findViewById(R.id.confirmPasswordInput)
        registerButton = findViewById(R.id.registerButton)
        backToLoginButton = findViewById(R.id.backToLoginButton)

        setupObservers()
        setupListeners()
    }

    private fun setupObservers() {
        authViewModel.registerResult.observe(this) { result ->
            result.onSuccess { message ->
                Toast.makeText(this, message, Toast.LENGTH_LONG).show()
                finish()
            }
            result.onFailure { error ->
                Toast.makeText(this, "Registration failed: ${error.message}", Toast.LENGTH_LONG).show()
            }
        }

        authViewModel.isLoading.observe(this) { isLoading ->
            registerButton.isEnabled = !isLoading
            backToLoginButton.isEnabled = !isLoading
        }
    }

    private fun setupListeners() {
        registerButton.setOnClickListener {
            val username = usernameInput.text.toString().trim()
            val email = emailInput.text.toString().trim()
            val password = passwordInput.text.toString()
            val confirmPassword = confirmPasswordInput.text.toString()

            if (username.isEmpty()) {
                usernameInput.error = "Username is required"
                return@setOnClickListener
            }
            if (password.isEmpty()) {
                passwordInput.error = "Password is required"
                return@setOnClickListener
            }
            if (password.length < 6) {
                passwordInput.error = "Password must be at least 6 characters"
                return@setOnClickListener
            }
            if (password != confirmPassword) {
                confirmPasswordInput.error = "Passwords do not match"
                return@setOnClickListener
            }

            authViewModel.register(username, email, password)
        }

        backToLoginButton.setOnClickListener {
            finish()
        }
    }
}

