// Dodo Payments Integration
class DodoPayments {
    constructor(supabaseUrl, apiKey, authManager) {
        this.supabaseUrl = supabaseUrl;
        this.apiKey = apiKey;
        this.authManager = authManager;
        this.dodoApiKey = ''; // Will be set from environment variables
        this.productId = ''; // Will be set from environment variables
        this.loadConfig();
    }

    loadConfig() {
        // Try to get Dodo Payments API key from environment variables
        this.dodoApiKey = this.getDodoApiKeyFromEnvironment();
        this.productId = this.getProductIdFromEnvironment();
        
        if (!this.dodoApiKey || !this.productId) {
            console.warn('Dodo Payments API key or Product ID not found in environment variables');
        }
    }

    getDodoApiKeyFromEnvironment() {
        // Check for environment variables that might be available
        if (typeof window !== 'undefined') {
            // Check window variables (injected by server)
            if (window.DODO_PAYMENTS_API_KEY) {
                return window.DODO_PAYMENTS_API_KEY;
            }
            
            // Check meta tags
            const metaTag = document.querySelector('meta[name="dodo-payments-api-key"]');
            if (metaTag && metaTag.content) {
                return metaTag.content;
            }
        }
        
        // Check process.env (for Node.js environments)
        if (typeof process !== 'undefined' && process.env && process.env.DODO_PAYMENTS_API_KEY) {
            return process.env.DODO_PAYMENTS_API_KEY;
        }
        
        return '';
    }

    getProductIdFromEnvironment() {
        // Check for environment variables that might be available
        if (typeof window !== 'undefined') {
            // Check window variables (injected by server)
            if (window.DODO_PRODUCT_ID) {
                return window.DODO_PRODUCT_ID;
            }
            
            // Check meta tags
            const metaTag = document.querySelector('meta[name="dodo-product-id"]');
            if (metaTag && metaTag.content) {
                return metaTag.content;
            }
        }
        
        // Check process.env (for Node.js environments)
        if (typeof process !== 'undefined' && process.env && process.env.DODO_PRODUCT_ID) {
            return process.env.DODO_PRODUCT_ID;
        }
        
        return '';
    }

    async createCheckoutSession() {
        if (!this.authManager || !this.authManager.isUserAuthenticated()) {
            throw new Error('User must be logged in to make a payment');
        }

        if (!this.dodoApiKey) {
            throw new Error('Dodo Payments API key not configured');
        }

        if (!this.productId) {
            throw new Error('Dodo Payments Product ID not configured');
        }

        try {
            const user = this.authManager.getCurrentUser();
            console.log('Creating checkout session for user:', user.username);

            // Generate unique checkout ID for tracking
            const checkoutId = `checkout_${user.id}_${Date.now()}`;
            
            // Get current page URL for return URL
            const returnUrl = `${window.location.origin}${window.location.pathname}?payment=success&checkout_id=${checkoutId}`;

            const response = await fetch('https://test.dodopayments.com/checkouts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.dodoApiKey}`
                },
                body: JSON.stringify({
                    // Products to sell - use IDs from your Dodo Payments dashboard
                    product_cart: [
                        {
                            product_id: this.productId,
                            quantity: 1
                        }
                    ],
                    
                    // Pre-fill customer information from logged-in user
                    customer: {
                        email: user.email || 'user@example.com',
                        name: user.username,
                        phone_number: '+1234567890' // You can add phone to user registration if needed
                    },
                    
                    // Default billing address (you can make this configurable)
                    billing_address: {
                        street: '123 Main St',
                        city: 'San Francisco',
                        state: 'CA', 
                        country: 'US', // Required: ISO 3166-1 alpha-2 country code
                        zipcode: '94102'
                    },
                    
                    // Where to redirect after successful payment
                    return_url: returnUrl,
                    
                    // Custom data for your internal tracking
                    metadata: {
                        user_id: user.id,
                        username: user.username,
                        checkout_id: checkoutId,
                        source: 'file_upload_app'
                    }
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
            }

            const session = await response.json();
            console.log('Checkout session created:', session);
            
            // Store checkout session in database for tracking
            await this.trackCheckoutSession(user.id, checkoutId, session);
            
            return session;
            
        } catch (error) {
            console.error('Failed to create checkout session:', error);
            throw error;
        }
    }

    async trackCheckoutSession(userId, checkoutId, session) {
        try {
            const response = await fetch(`${this.supabaseUrl}/rest/v1/payments`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'apikey': this.apiKey,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify({
                    user_id: userId,
                    checkout_id: checkoutId,
                    amount: 0, // Will be updated when payment is confirmed
                    currency: 'USD',
                    status: 'pending',
                    metadata: {
                        session_id: session.session_id,
                        checkout_url: session.checkout_url,
                        created_at: new Date().toISOString()
                    }
                })
            });

            if (!response.ok) {
                console.warn('Failed to track checkout session:', response.status);
            } else {
                console.log('Checkout session tracked in database');
            }
        } catch (error) {
            console.warn('Error tracking checkout session:', error);
        }
    }

    async handlePaymentSuccess(checkoutId) {
        try {
            console.log('Handling payment success for checkout:', checkoutId);
            
            // Update payment status in database
            const response = await fetch(`${this.supabaseUrl}/rest/v1/payments?checkout_id=eq.${checkoutId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'apikey': this.apiKey,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify({
                    status: 'completed',
                    updated_at: new Date().toISOString()
                })
            });

            if (response.ok) {
                console.log('Payment status updated to completed');
                this.showPaymentSuccess();
            } else {
                console.warn('Failed to update payment status');
            }
        } catch (error) {
            console.error('Error handling payment success:', error);
        }
    }

    showPaymentSuccess() {
        // Show success message to user
        const message = document.createElement('div');
        message.className = 'payment-success-message';
        message.innerHTML = `
            <div style="
                position: fixed;
                top: 20px;
                right: 20px;
                background: #4CAF50;
                color: white;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                z-index: 10000;
                max-width: 300px;
            ">
                <h3 style="margin: 0 0 10px 0;">🎉 Payment Successful!</h3>
                <p style="margin: 0;">You now have premium access!</p>
            </div>
        `;
        
        document.body.appendChild(message);
        
        // Remove message after 5 seconds
        setTimeout(() => {
            if (message.parentNode) {
                message.parentNode.removeChild(message);
            }
        }, 5000);
    }

    async initiatePayment() {
        try {
            const session = await this.createCheckoutSession();
            
            // Redirect user to Dodo Payments checkout
            window.location.href = session.checkout_url;
            
        } catch (error) {
            console.error('Payment initiation failed:', error);
            this.showPaymentError(error.message);
        }
    }

    showPaymentError(message) {
        // Show error message to user
        const errorDiv = document.createElement('div');
        errorDiv.className = 'payment-error-message';
        errorDiv.innerHTML = `
            <div style="
                position: fixed;
                top: 20px;
                right: 20px;
                background: #f44336;
                color: white;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                z-index: 10000;
                max-width: 300px;
            ">
                <h3 style="margin: 0 0 10px 0;">❌ Payment Error</h3>
                <p style="margin: 0;">${message}</p>
            </div>
        `;
        
        document.body.appendChild(errorDiv);
        
        // Remove message after 5 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 5000);
    }
}
