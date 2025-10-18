package com.storage.files.util

import java.text.SimpleDateFormat
import java.util.*

object DebugLogger {
    private val logs = mutableListOf<String>()
    private val dateFormat = SimpleDateFormat("HH:mm:ss", Locale.getDefault())
    
    fun log(tag: String, message: String) {
        val timestamp = dateFormat.format(Date())
        val logMessage = "[$timestamp] $tag: $message"
        synchronized(logs) {
            logs.add(logMessage)
            // Keep only last 500 logs to prevent memory issues
            if (logs.size > 500) {
                logs.removeAt(0)
            }
        }
        // Also log to Logcat
        android.util.Log.d(tag, message)
    }
    
    fun getLogs(): List<String> {
        synchronized(logs) {
            return logs.toList()
        }
    }
    
    fun clearLogs() {
        synchronized(logs) {
            logs.clear()
        }
    }
}

