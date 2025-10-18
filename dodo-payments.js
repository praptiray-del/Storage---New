// Dodo Payments integration - Frontend (No Business Logic)
// All payment processing is handled by backend API
class DodoPayments {
    constructor(authManager) {
        this.authManager = authManager;
    }

    async initiatePayment() {
        if (!this.authManager || !this.authManager.isUserAuthenticated()) {
            throw new Error('User must be logged in to make a payment');
        }

        try {
            const sessionToken = this.authManager.getSessionToken();
            if (!sessionToken) {
                throw new Error('No session token found. Please login again.');
            }

            console.log('Creating checkout session...');

            // Call backend API to create checkout session
            const response = await fetch('/api/payment/create-checkout', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${sessionToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create checkout session');
            }

            const data = await response.json();
            
            // Redirect user to Dodo Payments checkout
            console.log('Redirecting to checkout URL:', data.checkoutUrl);
            window.location.href = data.checkoutUrl;
            
        } catch (error) {
            console.error('Payment initiation failed:', error);
            this.showPaymentError(error.message);
            throw error;
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
