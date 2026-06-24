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
  // console.log("[RazorpayLoader] loadRazorpayScript called");
  // If script is already loaded, return immediately
  if (window.Razorpay) {
    // console.log("[RazorpayLoader] Razorpay SDK already loaded");
    return Promise.resolve();
  }

  // If script is already loading, return the same promise to avoid duplicate loads
  if (razorpayScriptPromise) {
    // console.log(
    //   "[RazorpayLoader] Razorpay SDK is already loading; returning existing promise",
    // );
    return razorpayScriptPromise;
  }

  // Create new promise to load the script
  razorpayScriptPromise = new Promise((resolve, reject) => {
    // Check again in case it loaded between promises
    if (window.Razorpay) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/magic-checkout.js";
    script.async = true;
    script.type = "text/javascript";

    script.onload = () => {
      // console.log("[RazorpayLoader] Razorpay SDK script loaded");
      if (window.Razorpay) {
        // console.log("[RazorpayLoader] window.Razorpay is available");
        resolve();
      } else {
        console.error(
          "[RazorpayLoader] Razorpay script loaded but window.Razorpay not found",
        );
        reject(new Error("Razorpay SDK loaded but window.Razorpay not found"));
      }
    };

    script.onerror = () => {
      razorpayScriptPromise = null; // Reset on error to allow retry
      console.error("[RazorpayLoader] Razorpay SDK failed to load");
      reject(
        new Error(
          "Failed to load Razorpay SDK. Check your internet connection.",
        ),
      );
    };

    // Add error handler for network issues
    script.addEventListener("error", () => {
      console.error(
        "[RazorpayLoader] Razorpay script network error event fired",
      );
      razorpayScriptPromise = null;
    });

    // Inject into DOM
    document.body.appendChild(script);
  });

  return razorpayScriptPromise;
};

/**
 * Initialize Razorpay checkout with order details.
 *
 * Supports both one-time payment (order_id) and subscription (subscription_id).
 * All Magic Checkout fields are forwarded to new window.Razorpay() when present:
 *   - one_click_checkout → activates Magic Checkout mode (mandatory boolean
 *                          per Razorpay's docs — without this being forwarded,
 *                          the SDK silently falls back to Standard Checkout)
 *   - show_coupons       → shows/hides the coupon widget inside Magic Checkout
 *   - integration        → legacy/unused field, kept for backward compatibility
 *   - checkout           → legacy nested block (one_click_checkout/show_coupons),
 *                          kept for backward compatibility; current Checkout.js
 *                          sends these as top-level fields instead
 *   - method             → payment method overrides (disable COD etc.)
 *   - line_items         → order line items displayed inside Razorpay modal
 *   - line_items_total   → pre-computed total in paise for line_items validation
 *   - retry              → retry behaviour on the checkout form
 *   - timeout            → checkout session timeout in seconds
 *   - subscription_id    → Razorpay subscription ID (subscription flow only)
 *
 * Fields are forwarded only when present in config (undefined values are omitted
 * by JSON serialisation, so absent keys do not reach the SDK).
 *
 * @param {Object}   config
 * @param {string}   [config.key_id]              – preferred field name
 * @param {string}   [config.key]                 – accepted alias for key_id
 * @param {number}   [config.amount]             – in paise; required for order_id flow
 * @param {string}   [config.currency]            – default "INR"
 * @param {string}   [config.order_id]            – Razorpay order ID (one-time)
 * @param {string}   [config.subscription_id]     – Razorpay subscription ID
 * @param {string}   [config.name]
 * @param {string}   [config.description]
 * @param {string}   [config.image]
 * @param {Object}   [config.prefill]             – { name, email, contact }
 * @param {string}   [config.callback_url]
 * @param {boolean}  [config.one_click_checkout]  – true activates Magic Checkout
 * @param {boolean}  [config.show_coupons]        – shows coupon widget in Magic Checkout
 * @param {string}   [config.integration]         – legacy, unused by current Checkout.js
 * @param {Object}   [config.checkout]            – legacy nested Magic Checkout options block
 * @param {Object}   [config.method]              – payment method overrides
 * @param {Array}    [config.line_items]          – order line items for modal display
 * @param {number}   [config.line_items_total]    – total in paise matching line_items
 * @param {Object}   [config.retry]
 * @param {number}   [config.timeout]
 * @param {Object}   [config.theme]
 * @param {Function} [config.onSuccess]           – callback(response) on payment success
 * @param {Function} [config.handler]             – callback(response) on payment success
 * @returns {Promise<Object>} Resolves with Razorpay payment response
 */
export const openRazorpayCheckout = async (config) => {
  // console.log("[RazorpayLoader] openRazorpayCheckout called", config);
  // Load Razorpay script BEFORE creating the promise
  await loadRazorpayScript();

  if (!window.Razorpay) {
    console.error("[RazorpayLoader] Razorpay SDK is not available after load");
    throw new Error("Razorpay SDK not available");
  }

  return new Promise((resolve, reject) => {
    // Single pair of flags. These are the ONLY place settled-state is recorded.
    // Nothing else (handler, payment.failed, ondismiss) should set these flags
    // directly — they must always go through safeResolve/safeReject so the
    // promise can never be left unsettled.
    let handlerCalled = false;
    let dismissCalled = false;

    const safeResolve = (value) => {
      if (!handlerCalled && !dismissCalled) {
        handlerCalled = true;
        resolve(value);
      }
    };

    const safeReject = (error) => {
      if (!handlerCalled && !dismissCalled) {
        dismissCalled = true;
        reject(error);
      }
    };

    try {
      // ── Base options (always present) ────────────────────────────────────
      // FIX: accept config.key_id OR config.key so callers can use either field name
      const options = {
        key: config.key_id || config.key,
        amount: config.amount,
        currency: config.currency || "INR",
        name: config.name,
        description: config.description,
        image: config.image,
        prefill: config.prefill,
        theme: config.theme || { color: "#7BA05B" },

        // FIX: previously this handler set `handlerCalled = true` BEFORE
        // calling safeResolve(), so safeResolve's own guard
        // (`!handlerCalled && !dismissCalled`) was already false and
        // resolve() never ran. That left openRazorpayCheckout()'s promise
        // pending forever after a successful payment, which is why the
        // frontend stayed stuck on "Processing...". Now safeResolve is the
        // ONLY place that sets handlerCalled.
        handler: async (response) => {
          // console.log("[RazorpayLoader] Razorpay handler invoked", response);
          // console.log("Payment Success");

          try {
            if (config.onSuccess) {
              await config.onSuccess(response);
            }
            if (config.handler) {
              await config.handler(response);
            }
            safeResolve(response);
            // console.log("Promise Resolved");
          } catch (err) {
            safeReject(err);
          }
        },

        modal: {
          ondismiss: () => {
            // console.log("Payment Cancelled");
            safeReject(new Error("Payment cancelled"));
          },
        },
      };

      // ── One-time payment fields ───────────────────────────────────────────
      // order_id is required for one-time payments; absent for subscriptions.
      if (config.order_id) {
        options.order_id = config.order_id;
      }

      // ── Subscription field ────────────────────────────────────────────────
      // subscription_id is required for the subscription flow; absent for
      // one-time payments. Mutually exclusive with order_id per Razorpay docs.
      if (config.subscription_id) {
        options.subscription_id = config.subscription_id;
      }

      // ── callback_url (optional — used when handler is not present) ────────
      if (config.callback_url) {
        options.callback_url = config.callback_url;
      }

      // ── Magic Checkout activation flags ───────────────────────────────────
      // CRITICAL FIX: one_click_checkout is the field that actually switches
      // Razorpay between Magic Checkout and Standard Checkout, per Razorpay's
      // docs ("mandatory boolean ... initiate Magic Checkout or Standard
      // Checkout"). This was previously never forwarded here — Checkout.js
      // was setting it correctly, but it silently never reached
      // new window.Razorpay(), causing Standard Checkout to load instead
      // and skip address/contact collection entirely.
      if (config.one_click_checkout !== undefined) {
        options.one_click_checkout = config.one_click_checkout;
      }

      if (config.show_coupons !== undefined) {
        options.show_coupons = config.show_coupons;
      }

      // ── Legacy fields (kept for backward compatibility, currently unused
      //    by Checkout.js, which sends one_click_checkout/show_coupons as
      //    top-level fields instead) ───────────────────────────────────────
      //
      // integration: not a documented Razorpay option; harmless if forwarded.
      if (config.integration) {
        options.integration = config.integration;
      }

      // checkout: legacy nested block. If a caller still sends this shape,
      // forward it — but note it is NOT how Razorpay's documented client API
      // works; one_click_checkout/show_coupons above are the real mechanism.
      if (config.checkout) {
        options.checkout = config.checkout;
      }

      // method: payment method overrides — disable COD, enable/disable UPI etc.
      if (config.method) {
        options.method = config.method;
      }

      // line_items: order line items displayed inside the Razorpay modal.
      if (config.line_items && config.line_items.length > 0) {
        options.line_items = config.line_items;
      }

      // line_items_total: sum of (item.offer_price * item.quantity) across
      // all line_items, in paise.
      if (config.line_items_total !== undefined) {
        options.line_items_total = config.line_items_total;
      }

      // FIX: retry/timeout were silently dropped — not the cause of the
      // Magic Checkout activation bug, but fixed for a faithful pass-through.
      if (config.retry) {
        options.retry = config.retry;
      }

      if (config.timeout !== undefined) {
        options.timeout = config.timeout;
      }

      // console.log(
      //   "[RazorpayLoader] Initializing Razorpay checkout with options:",
      //   options,
      // );

      const rzp = new window.Razorpay(options);

      // FIX: previously this guarded on `if (!handlerCalled)` and then set
      // `handlerCalled = true` itself before calling safeReject — bypassing
      // safeReject's own guard inconsistently. Now it just calls safeReject,
      // which is idempotent and safe to call even if already settled.
      rzp.on("payment.failed", (response) => {
        console.error(
          "[RazorpayLoader] Razorpay payment.failed event:",
          response,
        );
        // console.log("Payment Failed");
        safeReject(new Error(response.error?.description || "Payment failed"));
      });

      rzp.open();
    } catch (error) {
      console.error(
        "[RazorpayLoader] Error while opening Razorpay checkout:",
        error,
      );
      safeReject(error);
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
