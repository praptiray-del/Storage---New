#!/bin/bash

# Setup script for Storage-New environment variables

echo "🔧 Setting up environment variables..."
echo ""

# Get API keys from user
read -p "Enter your SUPABASE_ANON_KEY: " ANON_KEY
read -p "Enter your SUPABASE_SERVICE_ROLE_KEY: " SERVICE_KEY

# Create .env file
cat > .env << EOF
# Supabase Configuration
SUPABASE_URL=https://pevqdguawonvpvnqqpnp.supabase.co
SUPABASE_ANON_KEY=${ANON_KEY}
SUPABASE_SERVICE_ROLE_KEY=${SERVICE_KEY}

# Dodo Payments Configuration (optional - can add later)
DODO_PAYMENTS_API_KEY=
DODO_PRODUCT_ID=

# Server Configuration
PORT=3000
EOF

echo ""
echo "✅ .env file created successfully!"
echo ""
echo "📋 Your configuration:"
echo "   SUPABASE_URL: https://pevqdguawonvpvnqqpnp.supabase.co"
echo "   SUPABASE_ANON_KEY: ${ANON_KEY:0:20}..."
echo "   SUPABASE_SERVICE_ROLE_KEY: ${SERVICE_KEY:0:20}..."
echo ""
echo "🚀 Ready to start! Run: npm install && npm start"

