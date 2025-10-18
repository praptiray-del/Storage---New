package com.storage.files.ui.debug

import android.os.Bundle
import android.widget.Button
import android.widget.ScrollView
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.widget.Toolbar
import com.storage.files.R
import com.storage.files.util.DebugLogger

class DebugActivity : AppCompatActivity() {
    private lateinit var toolbar: Toolbar
    private lateinit var debugText: TextView
    private lateinit var scrollView: ScrollView
    private lateinit var refreshButton: Button
    private lateinit var clearButton: Button
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_debug)
        
        toolbar = findViewById(R.id.toolbar)
        setSupportActionBar(toolbar)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        supportActionBar?.title = "Debug Logs"
        
        debugText = findViewById(R.id.debugText)
        scrollView = findViewById(R.id.scrollView)
        refreshButton = findViewById(R.id.refreshButton)
        clearButton = findViewById(R.id.clearButton)
        
        refreshButton.setOnClickListener {
            refreshLogs()
        }
        
        clearButton.setOnClickListener {
            DebugLogger.clearLogs()
            refreshLogs()
        }
        
        refreshLogs()
    }
    
    override fun onSupportNavigateUp(): Boolean {
        finish()
        return true
    }
    
    private fun refreshLogs() {
        val logs = DebugLogger.getLogs()
        if (logs.isEmpty()) {
            debugText.text = "No logs yet. Logs will appear here as you use the app."
        } else {
            debugText.text = logs.joinToString("\n")
        }
        
        // Scroll to bottom to show latest logs
        scrollView.post {
            scrollView.fullScroll(ScrollView.FOCUS_DOWN)
        }
    }
}

