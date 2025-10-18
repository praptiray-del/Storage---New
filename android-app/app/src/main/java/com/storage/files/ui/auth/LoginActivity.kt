package com.storage.files.ui.auth

import android.content.Intent
import android.os.Bundle
import android.widget.Toast
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import com.google.android.material.button.MaterialButton
import com.google.android.material.textfield.TextInputEditText
import com.storage.files.R
import com.storage.files.ui.main.MainActivity

class LoginActivity : AppCompatActivity() {
    private val authViewModel: AuthViewModel by viewModels()

    private lateinit var usernameInput: TextInputEditText
    private lateinit var passwordInput: TextInputEditText
    private lateinit var loginButton: MaterialButton
    private lateinit var registerButton: MaterialButton

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_login)

        usernameInput = findViewById(R.id.usernameInput)
        passwordInput = findViewById(R.id.passwordInput)
        loginButton = findViewById(R.id.loginButton)
        registerButton = findViewById(R.id.registerButton)

        // Check if user is already logged in
        authViewModel.checkSession(this)

        setupObservers()
        setupListeners()
    }

    private fun setupObservers() {
        authViewModel.loginResult.observe(this) { result ->
            result.onSuccess { user ->
                Toast.makeText(this, "Welcome, ${user.username}!", Toast.LENGTH_SHORT).show()
                navigateToMain()
            }
            result.onFailure { error ->
                Toast.makeText(this, "Login failed: ${error.message}", Toast.LENGTH_LONG).show()
            }
        }

        authViewModel.currentUser.observe(this) { user ->
            if (user != null) {
                navigateToMain()
            }
        }

        authViewModel.isLoading.observe(this) { isLoading ->
            loginButton.isEnabled = !isLoading
            registerButton.isEnabled = !isLoading
        }
    }

    private fun setupListeners() {
        loginButton.setOnClickListener {
            val username = usernameInput.text.toString().trim()
            val password = passwordInput.text.toString()

            if (username.isEmpty()) {
                usernameInput.error = "Username is required"
                return@setOnClickListener
            }
            if (password.isEmpty()) {
                passwordInput.error = "Password is required"
                return@setOnClickListener
            }

            authViewModel.login(this, username, password)
        }

        registerButton.setOnClickListener {
            startActivity(Intent(this, RegisterActivity::class.java))
        }
    }

    private fun navigateToMain() {
        val intent = Intent(this, MainActivity::class.java)
        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        startActivity(intent)
        finish()
    }
}

