package com.storage.files.data.api

import com.storage.files.data.model.UploadedFile
import com.storage.files.data.model.User
import okhttp3.MultipartBody
import retrofit2.Response
import retrofit2.http.*

interface ApiService {
    // Auth endpoints
    @POST("api/auth/register")
    @FormUrlEncoded
    suspend fun register(
        @Field("username") username: String,
        @Field("email") email: String,
        @Field("password") password: String
    ): Response<Map<String, Any>>

    @POST("api/auth/login")
    @FormUrlEncoded
    suspend fun login(
        @Field("username") username: String,
        @Field("password") password: String
    ): Response<Map<String, Any>>

    @GET("api/auth/me")
    suspend fun getCurrentUser(): Response<User>

    @POST("api/auth/logout")
    suspend fun logout(): Response<Map<String, String>>

    // File endpoints
    @Multipart
    @POST("api/upload")
    suspend fun uploadFiles(
        @Part files: List<MultipartBody.Part>
    ): Response<Map<String, Any>>

    @GET("api/files")
    suspend fun getUserFiles(): Response<List<UploadedFile>>

    @DELETE("api/files/{fileId}")
    suspend fun deleteFile(@Path("fileId") fileId: String): Response<Map<String, String>>
}

