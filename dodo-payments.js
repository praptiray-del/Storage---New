class DodoPayments {
    constructor(supabaseUrl, supabaseApiKey, authManager) {
        this.supabaseUrl = supabaseUrl;
        this.supabaseApiKey = supabaseApiKey;
        this.authManager = authManager;
        this.apiKey = '';
        this.productId = '';
        
        this.loadConfig();
    }

    loadConfig() {
        // Try to get API key from environment variables
        this.apiKey = this.getDodoApiKeyFromEnvironment();
        this.productId = this.getProductIdFromEnvironment();
        
        if (!this.apiKey || !this.productId) {
            console.warn('Dodo Payments API key or Product ID not found in environment variables');
        } else {
            console.log('Dodo Payments configuration loaded successfully');
        }
    }

    getDodoApiKeyFromEnvironment() {
        // Check multiple possible sources for the API key
        if (window.DODO_PAYMENTS_API_KEY) {
            return window.DODO_PAYMENTS_API_KEY;
        }
        
        // Check meta tag
        const metaTag = document.querySelector('meta[name="dodo-payments-api-key"]');
        if (metaTag && metaTag.content) {
            return metaTag.content;
        }
        
        // Check process.env (for Node.js environments)
        if (typeof process !== 'undefined' && process.env && process.env.DODO_PAYMENTS_API_KEY) {
            return process.env.DODO_PAYMENTS_API_KEY;
        }
        
        return '';
    }

    getProductIdFromEnvironment() {
        // Check multiple possible sources for the product ID
        if (window.DODO_PRODUCT_ID) {
            return window.DODO_PRODUCT_ID;
        }
        
        // Check meta tag
        const metaTag = document.querySelector('meta[name="dodo-product-id"]');
        if (metaTag && metaTag.content) {
            return metaTag.content;
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

        if (!this.apiKey || !this.productId) {
            throw new Error('Dodo Payments API key or Product ID not configured');
        }

        try {
            const user = this.authManager.getCurrentUser();
            console.log('Creating checkout session for user:', user.username);

            // Get current page URL for return URL
            const returnUrl = `${window.location.origin}${window.location.pathname}?payment=success`;

            const requestBody = {
                // Products to sell - use IDs from your Dodo Payments dashboard
                product_cart: [
                    {
                        product_id: this.productId,
                        quantity: 1
                    }
                ],
                
                // Pre-fill customer information to reduce checkout friction
                customer: {
                    email: user.email || 'user@example.com',
                    name: user.username,
                    phone_number: '+1234567890' // Default phone number
                },
                
                // Billing address for tax calculation and compliance
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
                    source: 'file_upload_app'
                }
            };

            console.log('Sending request to Dodo Payments API...');
            console.log('Request body:', JSON.stringify(requestBody, null, 2));

            const response = await fetch('https://test.dodopayments.com/checkouts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify(requestBody)
            });

            console.log('Dodo Payments API response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Dodo Payments API Error:', {
                    status: response.status,
                    statusText: response.statusText,
                    errorText: errorText
                });
                throw new Error(`Dodo Payments API error: ${response.status} - ${errorText}`);
            }

            const session = await response.json();
            console.log('Checkout session created successfully:', session);
            
            return session;
            
        } catch (error) {
            console.error('Failed to create checkout session:', error);
            throw error;
        }
    }

    async initiatePayment() {
        try {
            console.log('Initiating payment...');
            
            const session = await this.createCheckoutSession();
            
            // Redirect user to Dodo Payments checkout
            console.log('Redirecting to checkout URL:', session.checkout_url);
            window.location.href = session.checkout_url;
            
        } catch (error) {
            console.error('Payment initiation failed:', error);
            this.showPaymentError(error.message);
        }
    }

    showPaymentError(message) {
        // Create a simple error display
        const errorDiv = document.createElement('div');
        errorDiv.className = 'payment-error';
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #dc3545;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(220, 53, 69, 0.3);
            z-index: 1000;
            max-width: 400px;
        `;
        errorDiv.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <i class="fas fa-exclamation-triangle"></i>
                <div>
                    <strong>Payment Error</strong><br>
                    ${message}
                </div>
                <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; color: white; cursor: pointer; margin-left: auto;">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(errorDiv);
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (errorDiv.parentElement) {
                errorDiv.remove();
            }
        }, 10000);
    }

    handlePaymentSuccess(checkoutId) {
        console.log('Payment success detected for checkout:', checkoutId);
        
        // Show success message
        const successDiv = document.createElement('div');
        successDiv.className = 'payment-success';
        successDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #28a745;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
            z-index: 1000;
            max-width: 400px;
        `;
        successDiv.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <i class="fas fa-check-circle"></i>
                <div>
                    <strong>Payment Successful!</strong><br>
                    Welcome to Premium! Your account has been upgraded.
                </div>
                <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; color: white; cursor: pointer; margin-left: auto;">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(successDiv);
        
        // Auto-remove after 8 seconds
        setTimeout(() => {
            if (successDiv.parentElement) {
                successDiv.remove();
            }
        }, 8000);
    }
}
