package com.storage.files.ui.main

import android.content.Intent
import android.os.Bundle
import android.view.Menu
import android.view.MenuItem
import android.widget.TextView
import android.widget.Toast
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.widget.Toolbar
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.google.android.material.floatingactionbutton.FloatingActionButton
import com.storage.files.R
import com.storage.files.ui.auth.AuthViewModel
import com.storage.files.ui.auth.LoginActivity
import com.storage.files.ui.files.FileUploadActivity
import com.storage.files.ui.files.FilesViewModel
import com.storage.files.util.DebugLogger

class MainActivity : AppCompatActivity() {
    private val authViewModel: AuthViewModel by viewModels()
    private val filesViewModel: FilesViewModel by viewModels()

    private lateinit var toolbar: Toolbar
    private lateinit var premiumStatusText: TextView
    private lateinit var filesRecyclerView: RecyclerView
    private lateinit var fabUpload: FloatingActionButton
    private lateinit var filesAdapter: FilesAdapter

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        DebugLogger.log("MAIN", "MainActivity onCreate")
        setContentView(R.layout.activity_main)

        toolbar = findViewById(R.id.toolbar)
        setSupportActionBar(toolbar)

        premiumStatusText = findViewById(R.id.premiumStatusText)
        filesRecyclerView = findViewById(R.id.filesRecyclerView)
        fabUpload = findViewById(R.id.fabUpload)

        setupRecyclerView()
        setupObservers()
        setupListeners()

        // Check session first, then load files
        DebugLogger.log("MAIN", "Checking session...")
        authViewModel.checkSession(this)
    }

    private fun setupRecyclerView() {
        filesAdapter = FilesAdapter(
            onFileClick = { file ->
                Toast.makeText(this, "File: ${file.fileName}", Toast.LENGTH_SHORT).show()
            },
            onDeleteClick = { file ->
                filesViewModel.deleteFile(file.id)
            }
        )
        filesRecyclerView.layoutManager = LinearLayoutManager(this)
        filesRecyclerView.adapter = filesAdapter
    }

    private fun setupObservers() {
        authViewModel.currentUser.observe(this) { user ->
            if (user == null) {
                DebugLogger.log("MAIN", "No user found, navigating to login")
                navigateToLogin()
            } else {
                DebugLogger.log("MAIN", "User logged in: ${user.username}, isPremium: ${user.isPremium}")
                val status = if (user.isPremium) "Premium User ⭐" else "Free User"
                premiumStatusText.text = status
                supportActionBar?.title = "Welcome, ${user.username}"
                // Load files after user is confirmed
                DebugLogger.log("MAIN", "Loading user files...")
                filesViewModel.loadFiles()
            }
        }

        filesViewModel.files.observe(this) { files ->
            DebugLogger.log("MAIN", "Files loaded: ${files.size} files")
            filesAdapter.submitList(files)
        }

        filesViewModel.isLoading.observe(this) { isLoading ->
            DebugLogger.log("MAIN", "Files loading: $isLoading")
            // You can show/hide a progress bar here
        }

        filesViewModel.error.observe(this) { error ->
            error?.let {
                DebugLogger.log("MAIN", "ERROR: $it")
                Toast.makeText(this, "Error: $it", Toast.LENGTH_LONG).show()
            }
        }

        filesViewModel.deleteResult.observe(this) { result ->
            result.onSuccess {
                DebugLogger.log("MAIN", "File deleted successfully")
                Toast.makeText(this, "File deleted successfully", Toast.LENGTH_SHORT).show()
                filesViewModel.loadFiles()
            }
            result.onFailure { error ->
                DebugLogger.log("MAIN", "Delete failed: ${error.message}")
                Toast.makeText(this, "Delete failed: ${error.message}", Toast.LENGTH_LONG).show()
            }
        }
    }

    private fun setupListeners() {
        fabUpload.setOnClickListener {
            startActivity(Intent(this, FileUploadActivity::class.java))
        }
    }

    override fun onResume() {
        super.onResume()
        filesViewModel.loadFiles()
    }

    override fun onCreateOptionsMenu(menu: Menu): Boolean {
        menuInflater.inflate(R.menu.main_menu, menu)
        return true
    }

    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        return when (item.itemId) {
            R.id.action_refresh -> {
                filesViewModel.loadFiles()
                true
            }
            R.id.action_debug -> {
                startActivity(Intent(this, com.storage.files.ui.debug.DebugActivity::class.java))
                true
            }
            R.id.action_logout -> {
                authViewModel.logout(this)
                navigateToLogin()
                true
            }
            else -> super.onOptionsItemSelected(item)
        }
    }

    private fun navigateToLogin() {
        val intent = Intent(this, LoginActivity::class.java)
        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        startActivity(intent)
        finish()
    }
}

