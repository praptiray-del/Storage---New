package com.storage.files.ui.files

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.provider.OpenableColumns
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.widget.Toolbar
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.google.android.material.button.MaterialButton
import com.storage.files.R

class FileUploadActivity : AppCompatActivity() {
    private val fileUploadViewModel: FileUploadViewModel by viewModels()

    private lateinit var toolbar: Toolbar
    private lateinit var selectFilesButton: MaterialButton
    private lateinit var uploadButton: MaterialButton
    private lateinit var selectedFilesRecyclerView: RecyclerView
    private lateinit var selectedFilesAdapter: SelectedFilesAdapter

    private val selectedFiles = mutableListOf<Uri>()

    private val filePickerLauncher = registerForActivityResult(
        ActivityResultContracts.OpenDocument()
    ) { uri: Uri? ->
        uri?.let {
            selectedFiles.add(it)
            selectedFilesAdapter.submitList(selectedFiles.toList())
            uploadButton.isEnabled = selectedFiles.isNotEmpty()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_file_upload)

        toolbar = findViewById(R.id.toolbar)
        setSupportActionBar(toolbar)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        supportActionBar?.title = "Upload Files"

        selectFilesButton = findViewById(R.id.selectFilesButton)
        uploadButton = findViewById(R.id.uploadButton)
        selectedFilesRecyclerView = findViewById(R.id.selectedFilesRecyclerView)

        setupRecyclerView()
        setupObservers()
        setupListeners()
    }

    private fun setupRecyclerView() {
        selectedFilesAdapter = SelectedFilesAdapter(
            getFileName = { uri -> getFileNameFromUri(uri) },
            onRemoveClick = { uri ->
                selectedFiles.remove(uri)
                selectedFilesAdapter.submitList(selectedFiles.toList())
                uploadButton.isEnabled = selectedFiles.isNotEmpty()
            }
        )
        selectedFilesRecyclerView.layoutManager = LinearLayoutManager(this)
        selectedFilesRecyclerView.adapter = selectedFilesAdapter
    }

    private fun setupObservers() {
        fileUploadViewModel.uploadProgress.observe(this) { progress ->
            // You can show upload progress here
        }

        fileUploadViewModel.uploadResult.observe(this) { result ->
            result.onSuccess {
                Toast.makeText(this, "Files uploaded successfully!", Toast.LENGTH_SHORT).show()
                finish()
            }
            result.onFailure { error ->
                Toast.makeText(this, "Upload failed: ${error.message}", Toast.LENGTH_LONG).show()
            }
        }

        fileUploadViewModel.isUploading.observe(this) { isUploading ->
            selectFilesButton.isEnabled = !isUploading
            uploadButton.isEnabled = !isUploading && selectedFiles.isNotEmpty()
            uploadButton.text = if (isUploading) "Uploading..." else "Upload"
        }
    }

    private fun setupListeners() {
        selectFilesButton.setOnClickListener {
            filePickerLauncher.launch(arrayOf("*/*"))
        }

        uploadButton.setOnClickListener {
            if (selectedFiles.isNotEmpty()) {
                fileUploadViewModel.uploadFiles(this, selectedFiles)
            }
        }
    }

    private fun getFileNameFromUri(uri: Uri): String {
        var fileName = "Unknown"
        contentResolver.query(uri, null, null, null, null)?.use { cursor ->
            val nameIndex = cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME)
            if (cursor.moveToFirst() && nameIndex >= 0) {
                fileName = cursor.getString(nameIndex)
            }
        }
        return fileName
    }

    override fun onSupportNavigateUp(): Boolean {
        onBackPressed()
        return true
    }
}

