package com.storage.files.ui.main

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageButton
import android.widget.TextView
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.storage.files.R
import com.storage.files.data.model.UploadedFile
import java.text.SimpleDateFormat
import java.util.*

class FilesAdapter(
    private val onFileClick: (UploadedFile) -> Unit,
    private val onDeleteClick: (UploadedFile) -> Unit
) : ListAdapter<UploadedFile, FilesAdapter.FileViewHolder>(FileDiffCallback()) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): FileViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_file, parent, false)
        return FileViewHolder(view)
    }

    override fun onBindViewHolder(holder: FileViewHolder, position: Int) {
        holder.bind(getItem(position))
    }

    inner class FileViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        private val fileNameText: TextView = itemView.findViewById(R.id.fileNameText)
        private val fileSizeText: TextView = itemView.findViewById(R.id.fileSizeText)
        private val uploadDateText: TextView = itemView.findViewById(R.id.uploadDateText)
        private val deleteButton: ImageButton = itemView.findViewById(R.id.deleteButton)

        fun bind(file: UploadedFile) {
            fileNameText.text = file.fileName
            fileSizeText.text = formatFileSize(file.fileSize)
            uploadDateText.text = formatDate(file.uploadedAt)

            itemView.setOnClickListener { onFileClick(file) }
            deleteButton.setOnClickListener { onDeleteClick(file) }
        }

        private fun formatFileSize(bytes: Long): String {
            return when {
                bytes < 1024 -> "$bytes B"
                bytes < 1024 * 1024 -> "${bytes / 1024} KB"
                bytes < 1024 * 1024 * 1024 -> "${bytes / (1024 * 1024)} MB"
                else -> "${bytes / (1024 * 1024 * 1024)} GB"
            }
        }

        private fun formatDate(dateString: String): String {
            return try {
                val parser = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.getDefault())
                val formatter = SimpleDateFormat("MMM dd, yyyy HH:mm", Locale.getDefault())
                val date = parser.parse(dateString)
                date?.let { formatter.format(it) } ?: dateString
            } catch (e: Exception) {
                dateString
            }
        }
    }

    private class FileDiffCallback : DiffUtil.ItemCallback<UploadedFile>() {
        override fun areItemsTheSame(oldItem: UploadedFile, newItem: UploadedFile): Boolean {
            return oldItem.id == newItem.id
        }

        override fun areContentsTheSame(oldItem: UploadedFile, newItem: UploadedFile): Boolean {
            return oldItem == newItem
        }
    }
}

