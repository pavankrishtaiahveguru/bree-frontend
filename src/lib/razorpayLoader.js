/**
 * Razorpay Script Loader
 * =====================
 * 
 * Dynamically loads Razorpay SDK only when checkout is initiated.
 * Prevents unnecessary network requests and preload warnings.
 * 
 * Benefits:
 * - Loads only when user initiates payment
 * - Reduces initial page load time
 * - Eliminates "unused preload" browser warnings
 * - Handles concurrent requests safely (single load at a time)
 */

let razorpayScriptPromise = null;

/**
 * Load Razorpay SDK dynamically
 * Returns a promise that resolves when Razorpay is ready
 * 
 * @returns {Promise<void>} Resolves when Razorpay SDK is loaded and ready
 * @throws {Error} If script fails to load
 */
export const loadRazorpayScript = () => {
  // If script is already loaded, return immediately
  if (window.Razorpay) {
    return Promise.resolve();
  }

  // If script is already loading, return the same promise to avoid duplicate loads
  if (razorpayScriptPromise) {
    return razorpayScriptPromise;
  }

  // Create new promise to load the script
  razorpayScriptPromise = new Promise((resolve, reject) => {
    // Check again in case it loaded between promises
    if (window.Razorpay) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.type = 'text/javascript';

    script.onload = () => {
      if (window.Razorpay) {
        resolve();
      } else {
        reject(new Error('Razorpay SDK loaded but window.Razorpay not found'));
      }
    };

    script.onerror = () => {
      razorpayScriptPromise = null; // Reset on error to allow retry
      reject(new Error('Failed to load Razorpay SDK. Check your internet connection.'));
    };

    // Add error handler for network issues
    script.addEventListener('error', () => {
      razorpayScriptPromise = null;
    });

    // Inject into DOM
    document.body.appendChild(script);
  });

  return razorpayScriptPromise;
};

/**
 * Initialize Razorpay checkout with order details
 * 
 * @param {Object} config - Razorpay configuration
 * @param {string} config.key_id - Razorpay Key ID from backend
 * @param {number} config.amount - Amount in paise
 * @param {string} config.currency - Currency code (default: 'INR')
 * @param {string} config.order_id - Razorpay Order ID
 * @param {string} config.name - Business/Store name
 * @param {string} config.description - Order description
 * @param {string} config.image - Logo URL
 * @param {Function} config.onSuccess - Callback on successful payment
 * @param {Function} config.onError - Callback on payment error
 * @returns {Promise<void>}
 */
export const openRazorpayCheckout = (config) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Load Razorpay script if not already loaded
      await loadRazorpayScript();

      if (!window.Razorpay) {
        throw new Error('Razorpay SDK not available');
      }

      const options = {
        key: config.key_id,
        amount: config.amount,
        currency: config.currency || 'INR',
        order_id: config.order_id,
        name: config.name,
        description: config.description,
        image: config.image,
        theme: config.theme || { color: '#7BA05B' },
        
        handler: async function(response) {
          try {
            if (config.onSuccess) {
              await config.onSuccess(response);
            }
            resolve(response);
          } catch (err) {
            reject(err);
          }
        },

        modal: {
          ondismiss: () => {
            reject(new Error('Payment cancelled'));
          },
        },
      };

      const rzp = new window.Razorpay(options);
      
      rzp.on('payment.failed', (response) => {
        reject(new Error(response.error?.description || 'Payment failed'));
      });

      rzp.open();
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Check if Razorpay is loaded
 * @returns {boolean}
 */
export const isRazorpayLoaded = () => {
  return !!window.Razorpay;
};

/**
 * Preload Razorpay SDK in background (optional)
 * Can be called after a successful login or when user views shop
 * Reduces perceived wait time during checkout
 */
export const preloadRazorpayScript = () => {
  // Only preload if user is likely to checkout
  // This is optional and improves UX but doesn't prevent performance warnings
  if (!window.Razorpay && !razorpayScriptPromise) {
    loadRazorpayScript().catch(() => {
      // Silently catch errors during preload
    });
  }
};
