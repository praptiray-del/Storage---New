package com.storage.files.data.model

data class User(
    val id: String,
    val username: String,
    val email: String,
    val isPremium: Boolean = false,
    val createdAt: String? = null
)

