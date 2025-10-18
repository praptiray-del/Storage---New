package com.storage.files.data.model

data class UploadedFile(
    val id: String,
    val userId: String,
    val fileName: String,
    val fileSize: Long,
    val fileType: String,
    val uploadedAt: String,
    val fileUrl: String? = null
)

