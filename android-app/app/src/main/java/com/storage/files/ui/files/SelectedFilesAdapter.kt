package com.storage.files.ui.files

import android.net.Uri
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageButton
import android.widget.TextView
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.storage.files.R

class SelectedFilesAdapter(
    private val getFileName: (Uri) -> String,
    private val onRemoveClick: (Uri) -> Unit
) : ListAdapter<Uri, SelectedFilesAdapter.SelectedFileViewHolder>(UriDiffCallback()) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): SelectedFileViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_selected_file, parent, false)
        return SelectedFileViewHolder(view)
    }

    override fun onBindViewHolder(holder: SelectedFileViewHolder, position: Int) {
        holder.bind(getItem(position))
    }

    inner class SelectedFileViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        private val fileNameText: TextView = itemView.findViewById(R.id.selectedFileNameText)
        private val removeButton: ImageButton = itemView.findViewById(R.id.removeButton)

        fun bind(uri: Uri) {
            fileNameText.text = getFileName(uri)
            removeButton.setOnClickListener { onRemoveClick(uri) }
        }
    }

    private class UriDiffCallback : DiffUtil.ItemCallback<Uri>() {
        override fun areItemsTheSame(oldItem: Uri, newItem: Uri): Boolean {
            return oldItem == newItem
        }

        override fun areContentsTheSame(oldItem: Uri, newItem: Uri): Boolean {
            return oldItem == newItem
        }
    }
}

