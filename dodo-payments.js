// Dodo Payments Integration
class DodoPayments {
    constructor(supabaseUrl, apiKey, authManager) {
        this.supabaseUrl = supabaseUrl;
        this.apiKey = apiKey;
        this.authManager = authManager;
        this.dodoApiKey = ''; // Will be set from environment variables
        this.productId = ''; // Will be set from environment variables
        
        // Wait for DOM to be ready before loading config
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.loadConfig());
        } else {
            this.loadConfig();
        }
    }

    loadConfig() {
        // Try to get Dodo Payments API key from environment variables
        this.dodoApiKey = this.getDodoApiKeyFromEnvironment();
        this.productId = this.getProductIdFromEnvironment();
        
        console.log('Dodo Payments Config Loading:');
        console.log('- API Key found:', !!this.dodoApiKey);
        console.log('- Product ID found:', !!this.productId);
        console.log('- API Key value:', this.dodoApiKey ? this.dodoApiKey.substring(0, 20) + '...' : 'NOT FOUND');
        console.log('- Product ID value:', this.productId || 'NOT FOUND');
        
        if (!this.dodoApiKey || !this.productId) {
            console.warn('Dodo Payments API key or Product ID not found in environment variables');
            console.log('Available window variables:', Object.keys(window).filter(key => key.includes('DODO')));
            console.log('All window variables:', Object.keys(window).filter(key => key.includes('API') || key.includes('KEY') || key.includes('DODO')));
            
            // Check if variables exist but are empty
            console.log('DODO_PAYMENTS_API_KEY value:', window.DODO_PAYMENTS_API_KEY);
            console.log('DODO_PRODUCT_ID value:', window.DODO_PRODUCT_ID);
        }
    }

    getDodoApiKeyFromEnvironment() {
        // Check for environment variables that might be available
        if (typeof window !== 'undefined') {
            // Check window variables (injected by server) - try multiple possible names
            if (window.DODO_PAYMENTS_API_KEY && window.DODO_PAYMENTS_API_KEY.trim() !== '') {
                return window.DODO_PAYMENTS_API_KEY;
            }
            
            // Check for alternative naming conventions
            if (window.DODO_API_KEY && window.DODO_API_KEY.trim() !== '') {
                return window.DODO_API_KEY;
            }
            
            // Check meta tags
            const metaTag = document.querySelector('meta[name="dodo-payments-api-key"]');
            if (metaTag && metaTag.content && metaTag.content.trim() !== '') {
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
            // Check window variables (injected by server) - try multiple possible names
            if (window.DODO_PRODUCT_ID && window.DODO_PRODUCT_ID.trim() !== '') {
                return window.DODO_PRODUCT_ID;
            }
            
            // Check for alternative naming conventions
            if (window.DODO_PRODUCT && window.DODO_PRODUCT.trim() !== '') {
                return window.DODO_PRODUCT;
            }
            
            // Check meta tags
            const metaTag = document.querySelector('meta[name="dodo-product-id"]');
            if (metaTag && metaTag.content && metaTag.content.trim() !== '') {
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

        try {
            const user = this.authManager.getCurrentUser();
            console.log('Creating checkout session for user:', user.username);

            // Get current page URL for return URL
            const returnUrl = `${window.location.origin}${window.location.pathname}?payment=success`;

            const requestBody = {
                user_id: user.id,
                username: user.username,
                email: user.email || 'user@example.com',
                return_url: returnUrl
            };

            console.log('Sending request to server endpoint...');
            console.log('Request body:', JSON.stringify(requestBody, null, 2));

            const response = await fetch('/api/create-checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            console.log('Server response status:', response.status);

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Server API Error:', errorData);
                throw new Error(`Server error: ${errorData.error} - ${errorData.details}`);
            }

            const result = await response.json();
            console.log('Checkout session created successfully:', result);
            
            // Store checkout session in database for tracking
            await this.trackCheckoutSession(user.id, result.checkout_id, result.session);
            
            return result.session;
            
        } catch (error) {
            console.error('Failed to create checkout session:', error);
            console.error('Error details:', {
                message: error.message,
                stack: error.stack,
                name: error.name
            });
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
            console.log('Initiating payment through server endpoint...');
            
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
