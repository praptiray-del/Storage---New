package com.storage.files.data.api

import android.content.Context
import android.content.SharedPreferences
import com.storage.files.util.DebugLogger
import okhttp3.Interceptor
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

object RetrofitClient {
    // Backend API URL
    private const val BASE_URL = "https://storage-new.onrender.com/"

    private var sessionToken: String? = null

    fun setSessionToken(token: String?) {
        sessionToken = token
        DebugLogger.log("RETROFIT", "Session token updated: ${token?.take(10)}...")
    }

    private val authInterceptor = Interceptor { chain ->
        val request = chain.request()
        DebugLogger.log("RETROFIT", "Request: ${request.method} ${request.url}")
        
        val requestBuilder = request.newBuilder()
        sessionToken?.let {
            requestBuilder.addHeader("Authorization", "Bearer $it")
            DebugLogger.log("RETROFIT", "Added Auth header: Bearer ${it.take(10)}...")
        } ?: run {
            DebugLogger.log("RETROFIT", "WARNING: No session token set!")
        }
        
        val newRequest = requestBuilder.build()
        val response = chain.proceed(newRequest)
        DebugLogger.log("RETROFIT", "Response code: ${response.code}")
        response
    }

    private val loggingInterceptor = HttpLoggingInterceptor().apply {
        level = HttpLoggingInterceptor.Level.BODY
    }

    private val okHttpClient = OkHttpClient.Builder()
        .addInterceptor(authInterceptor)
        .addInterceptor(loggingInterceptor)
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .writeTimeout(30, TimeUnit.SECONDS)
        .build()

    private val retrofit = Retrofit.Builder()
        .baseUrl(BASE_URL)
        .client(okHttpClient)
        .addConverterFactory(GsonConverterFactory.create())
        .build()

    val apiService: ApiService = retrofit.create(ApiService::class.java)
}

