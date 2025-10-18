package com.storage.files.data.api

import io.github.jan.supabase.createSupabaseClient
import io.github.jan.supabase.gotrue.Auth
import io.github.jan.supabase.gotrue.auth
import io.github.jan.supabase.postgrest.Postgrest
import io.github.jan.supabase.storage.Storage

object SupabaseClient {
    // Supabase Configuration
    private const val SUPABASE_URL = "https://pevqdguawonvpvnqqpnp.supabase.co"
    private const val SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBldnFkZ3Vhd29udnB2bnFxcG5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyMDg5MzgsImV4cCI6MjA3NTc4NDkzOH0.fulDUg1Q-OQQGpRSpPnAM9ijeSILSmWRbagb4zGJNnc"

    val client = createSupabaseClient(
        supabaseUrl = SUPABASE_URL,
        supabaseKey = SUPABASE_ANON_KEY
    ) {
        install(Auth)
        install(Postgrest)
        install(Storage)
    }

    val auth: Auth
        get() = client.auth
}

