import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { ShoppingBag, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import axios from "@/lib/api";
import { toast } from "sonner";
import { loadRazorpayScript, openRazorpayCheckout } from "@/lib/razorpayLoader";
import CartUpdateModal from "@/components/CartUpdateModal";

// ── Magic Checkout helpers ────────────────────────────────────────────────────

/**
 * Build the line_items array for Razorpay Magic Checkout.
 * Razorpay documented shape per item:
 *   { type, sku, unit, name, description, image_url, amount, quantity }
 * amount = per-unit price in paise (integer).
 */
const buildLineItems = (cartItems) =>
  cartItems.map((item) => ({
    type: "e-commerce",
    sku: String(item.id),
    unit: "quantity",
    name: item.name,
    description: item.name,
    image_url: item.image || "",
    amount: Math.round(Number(item.price) * 100), // per-unit in paise
    quantity: item.quantity,
  }));

/**
 * Sum of (amount × quantity) across all line_items, in paise.
 * Razorpay cross-validates this against the Razorpay order amount.
 */
const buildLineItemsTotal = (lineItems) =>
  lineItems.reduce((sum, item) => sum + item.amount * item.quantity, 0);

// ── Loading phase labels shown to the user ────────────────────────────────────
const LOADING_PHASE = {
  idle: null,
  creating: "Preparing your order…",
  opening: "Opening payment…",
  verifying: "Verifying payment…",
};

// ── Component ─────────────────────────────────────────────────────────────────

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, cartTotal, syncCart } = useCart();

  // ── State ─────────────────────────────────────────────────────────────────
  const [isInitialising, setIsInitialising] = useState(true);
  const [loadingPhase, setLoadingPhase] = useState("idle"); // idle | creating | opening | verifying
  const [profile, setProfile] = useState(null); // { name, email, phone }
  const [showCartModal, setShowCartModal] = useState(false);
  const [cartModalItems, setCartModalItems] = useState([]);
  const [acceptedChanges, setAcceptedChanges] = useState(false);

  const isLoading = loadingPhase !== "idle";

  // ── On mount: sync cart, fetch profile + addresses silently ───────────────
  const initialise = useCallback(async () => {
    setIsInitialising(true);
    try {
      // 1. Sync cart prices/stock with backend
      if (typeof syncCart === "function") {
        const syncRes = await syncCart();
        if (syncRes?.anyChange) {
          const flagged = (syncRes.items || []).filter(
            (i) =>
              i.priceChanged ||
              i.outOfStock ||
              i.insufficientStock ||
              !i.available,
          );
          if (flagged.length) {
            setCartModalItems(flagged);
            setShowCartModal(true);
          } else {
            toast.info("Your cart has been updated with the latest prices.");
          }
        }
      }

      // 2. Fetch profile and addresses in parallel (silent — used only for
      //    create-order payload and Razorpay prefill, not shown in the UI)
      const [profileRes, addressRes] = await Promise.allSettled([
        axios.get("/api/profile"),
        axios.get("/api/addresses"),
      ]);

      if (profileRes.status === "fulfilled") {
        const p = profileRes.value.data;
        setProfile({
          name: p.name || "",
          email: p.email || "",
          phone: p.phone || "",
        });
      }

      if (addressRes.status === "fulfilled") {
        const list = Array.isArray(addressRes.value.data)
          ? addressRes.value.data
          : [];
        const addr = list.find((a) => a.is_default) || list[0] || null;
      }
    } catch (err) {
      // Non-fatal — payment flow has its own error handling
      console.error("[Checkout] Initialisation error:", err);
    } finally {
      setIsInitialising(false);
    }
  }, [syncCart]);

  useEffect(() => {
    if (!cartItems.length && loadingPhase === "idle") {
      navigate("/shop");
      return;
    }
    initialise();
  }, [cartItems.length, loadingPhase, navigate, initialise]);

  // ── Main payment handler ──────────────────────────────────────────────────
  const handleProceedToPayment = async () => {
    if (!cartItems.length) {
      toast.error("Your cart is empty.");
      return;
    }
    if (isLoading) return;

    try {
      // ── Re-sync cart before payment ──────────────────────────────────────
      const syncResult = await syncCart();
      if (syncResult?.anyChange && !acceptedChanges) {
        const flagged = (syncResult.items || []).filter(
          (i) =>
            i.priceChanged ||
            i.outOfStock ||
            i.insufficientStock ||
            !i.available,
        );
        setCartModalItems(flagged);
        setShowCartModal(true);
        return; // wait for user to accept or review
      }
      if (acceptedChanges) setAcceptedChanges(false);

      // ── STEP 1: Create Razorpay order on backend ─────────────────────────
      // The backend requires customerName, email, mobileNumber, and
      // shippingAddress at order-creation time (for the DB record).
      // We pass the profile data fetched on mount as the pre-auth values.
      // Razorpay Magic Checkout collects and confirms the final details
      // (name, phone, email, shipping address) during the payment popup.
      setLoadingPhase("creating");

      const createOrderPayload = {
        amount: cartTotal,
        currency: "INR",
        items: cartItems.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
          name: item.name,
          price: item.price,
        })),
        customerName: profile?.name || "Guest",
        email: profile?.email || "",
        mobileNumber: profile?.phone || "",
        // Use the user's saved default address as the pre-auth shipping address.
        // If no address is saved, Magic Checkout will collect one from the customer.
        shippingAddress: undefined,
      };

      console.log("[Checkout] Creating order:", createOrderPayload);
      const paymentResponse = await axios.post(
        "/api/payment/create-order",
        createOrderPayload,
      );
      const razorpayOrder = paymentResponse.data;

      // FIX: required debug log to surface field mapping issues
      console.log("Razorpay Response:", paymentResponse.data);
      console.log(
        "[DEBUG FULL RESPONSE]",
        JSON.stringify(paymentResponse.data, null, 2),
      );
      console.log("[Checkout] Order created:", {
        // FIX: backend returns order_id (not razorpay_order_id or id)
        order_id: razorpayOrder.order_id,
        // FIX: backend returns key_id (not key)
        key_id: razorpayOrder.key_id,
        order_db_id: razorpayOrder.order_db_id,
        amount: razorpayOrder.amount,
      });

      // ── STEP 2: Load Razorpay SDK ─────────────────────────────────────────
      setLoadingPhase("opening");
      try {
        await loadRazorpayScript();
      } catch (loadErr) {
        console.error("[Checkout] Script load failed:", loadErr);
        toast.error("Failed to load payment gateway. Please try again.");
        setLoadingPhase("idle");
        return;
      }

      // ── STEP 3: Build Magic Checkout options ──────────────────────────────
      const lineItems = buildLineItems(cartItems);
      const lineItemsTotal = buildLineItemsTotal(lineItems);

      const apiBaseUrl =
        process.env.REACT_APP_BACKEND_URL || "http://localhost:4000";

      const checkoutOptions = {
        // Razorpay core fields
        // FIX: pass key_id (not key) so razorpayLoader.js can read config.key_id correctly.
        // razorpayLoader also accepts config.key as a fallback, but key_id is the
        // canonical field name matching the backend response shape.
        key_id: razorpayOrder.key_id,

        amount: razorpayOrder.amount,

        currency: razorpayOrder.currency || "INR",

        name: "BREE Wellness",

        description: "Order Payment",

        // FIX: backend returns order_id — do NOT fall back to .razorpay_order_id or .id
        // as those fields do not exist in this backend's response shape.
        order_id: razorpayOrder.order_id,

        // User prefill
        prefill: {
          name: profile?.name || "",
          email: profile?.email || "",
          contact: profile?.phone || "",
        },

        // Magic Checkout
        integration: "magic_checkout",

        // Product line items
        line_items: lineItems,

        line_items_total: lineItemsTotal,

        // Payment methods
        method: {
          upi: true,
          card: true,
          netbanking: true,
          wallet: true,
          paylater: false,
          cod: false,
        },

        // Commerce APIs
        checkout: {
          one_click_checkout: true,
          show_coupons: true,

          shipping_info: {
            url: `${apiBaseUrl}/api/payment/shipping-info`,
            method: "POST",
            body: {
              items: cartItems.map((item) => ({
                product_id: item.id,
                quantity: item.quantity,
                price: item.price,
              })),
            },
          },

          promotions: {
            url: `${apiBaseUrl}/api/payment/promotions`,
            method: "POST",
            body: {
              items: cartItems.map((item) => ({
                product_id: item.id,
                quantity: item.quantity,
                price: item.price,
              })),
              email: profile?.email || "",
              amount: cartTotal,
            },
          },
        },

        theme: {
          color: "#84A95A",
        },

        retry: {
          enabled: true,
          max_count: 3,
        },

        timeout: 900,

        modal: {
          ondismiss: () => {
            setLoadingPhase("idle");
            toast.info("Payment cancelled.");
          },
        },

        // Success callback
        onSuccess: async (response) => {
          console.log("[Checkout] Payment success:", response);

          setLoadingPhase("verifying");

          try {
            const verifyPayload = {
              razorpay_order_id: response.razorpay_order_id,

              razorpay_payment_id: response.razorpay_payment_id,

              razorpay_signature: response.razorpay_signature,

              customerName: response.name || "",

              email: response.email || "",

              mobileNumber: response.contact || "",

              shippingAddress: response.address || null,
            };

            const verifyResponse = await axios.post(
              "/api/payment/verify",
              verifyPayload,
            );

            console.log("[Checkout] Verify response:", verifyResponse.data);

            if (!verifyResponse.data.success) {
              throw new Error(
                verifyResponse.data.message || "Payment verification failed",
              );
            }

            const savedOrderId = verifyResponse.data.order_id;

            console.log("Verify Response:", verifyResponse.data);
            console.log("Saved Order ID:", savedOrderId);
            console.log("Navigating to success page...");

            navigate(`/checkout/success?orderId=${savedOrderId}`, {
              replace: true,
            });

            // Do NOT clear cart here
          } catch (verifyErr) {
            console.error("[Checkout] Verify failed:", verifyErr);

            toast.error(
              verifyErr?.response?.data?.message ||
                verifyErr.message ||
                "Payment verification failed",
            );

            setLoadingPhase("idle");
          }
        },
      };

      // ── STEP 4: Validate + open Razorpay Magic Checkout ───────────────────
      // FIX: log the exact fields that Razorpay SDK will receive before opening
      console.log("Checkout Options:", {
        key: checkoutOptions.key_id,
        order_id: checkoutOptions.order_id,
        amount: checkoutOptions.amount,
      });

      // FIX: hard-fail fast with a clear message rather than letting the SDK
      // open with undefined key/order_id (which produces the cryptic
      // "Authentication key was missing during initialization" error)
      if (!checkoutOptions.key_id) {
        throw new Error("Razorpay key missing");
      }
      if (!checkoutOptions.order_id) {
        throw new Error("Razorpay order_id missing");
      }

      console.log("[Checkout] Opening Razorpay Magic Checkout", {
        orderId: checkoutOptions.order_id,
        amount: checkoutOptions.amount,
        currency: checkoutOptions.currency,
      });

      try {
        await openRazorpayCheckout(checkoutOptions);

        console.log("[Checkout] Razorpay popup closed successfully");
      } catch (error) {
        console.error("[Checkout] Razorpay checkout failed:", error);

        if (error?.message === "Payment cancelled") {
          toast.info("Payment cancelled. You can retry anytime.");
        } else {
          toast.error(
            error?.message || "Unable to process payment. Please try again.",
          );
        }

        throw error; // let outer catch handle cleanup
      }
    } catch (err) {
      // openRazorpayCheckout rejects on payment.failed or modal dismiss
      if (err?.message === "Payment cancelled") {
        toast.info("Payment cancelled. You can retry anytime.");
      } else {
        toast.error(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to process payment. Please try again.",
        );
      }

      console.error("[Checkout] Payment flow error:", err);
    } finally {
      // Reset to idle unless verification is running
      setLoadingPhase((prev) => (prev !== "verifying" ? "idle" : prev));
    }
  };

  // ── Cart modal handlers ───────────────────────────────────────────────────
  const handleAcceptChanges = async () => {
    setShowCartModal(false);
    setAcceptedChanges(true);
    await handleProceedToPayment();
  };

  const handleReviewChanges = () => {
    setShowCartModal(false);
    toast.info("Please review your updated cart.");
  };

  // ── Full-screen initialising spinner ─────────────────────────────────────
  if (isInitialising) {
    return (
      <div className="min-h-screen bg-bree-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-2 border-bree-primary border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-bree-text-secondary">Loading your cart…</p>
        </div>
      </div>
    );
  }

  // ── Main render ───────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen mt-10 bg-bree-bg py-8 px-4">
      <div className="max-w-2xl mt-10 mx-auto">
        {/* Page heading */}
        <div className="flex items-center gap-3 mb-8">
          <ShoppingBag className="w-6 h-6 text-bree-primary" />
          <h1 className="text-2xl font-bold text-bree-text-primary">
            Review Your Order
          </h1>
        </div>

        {/* Cart items card */}
        <div className="bg-white rounded-3xl shadow-sm border border-bree-border p-6 mb-6">
          <h2 className="text-base font-semibold text-bree-text-primary mb-5">
            Items in your cart
          </h2>

          <div className="space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 pb-4 border-b border-bree-border last:border-0 last:pb-0"
              >
                {/* Product image */}
                <div className="w-16 h-16 rounded-xl bg-bree-bg border border-bree-border flex items-center justify-center flex-shrink-0 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-contain p-1.5"
                  />
                </div>

                {/* Name + qty + change badges */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-bree-text-primary truncate">
                    {item.name}
                  </p>
                  <p className="text-sm text-bree-text-secondary mt-0.5">
                    Qty: {item.quantity}
                  </p>
                  {item._priceChanged && (
                    <span className="mt-1 inline-block text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                      Price updated
                    </span>
                  )}
                  {item._unavailable && (
                    <span className="mt-1 inline-block text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                      Availability changed
                    </span>
                  )}
                </div>

                {/* Line total */}
                <div className="text-right flex-shrink-0">
                  <p className="font-semibold text-bree-text-primary">
                    ₹
                    {(Number(item.price) * item.quantity).toLocaleString(
                      "en-IN",
                    )}
                  </p>
                  <p className="text-xs text-bree-text-secondary mt-0.5">
                    ₹{Number(item.price).toLocaleString("en-IN")} each
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Order totals */}
          <div className="mt-6 pt-4 border-t border-bree-border space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-bree-text-secondary">Subtotal</span>
              <span className="font-medium text-bree-text-primary">
                ₹{cartTotal.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-bree-text-secondary">Shipping</span>
              <span className="font-semibold text-bree-primary">Free</span>
            </div>
            <div className="flex justify-between items-center text-lg font-bold pt-3 border-t border-bree-border">
              <span className="text-bree-text-primary">Total</span>
              <span className="text-bree-primary">
                ₹{cartTotal.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>

        {/* Info banner */}
        <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6">
          <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-800">
            Your name, phone, email, and delivery address will be collected
            securely inside the Razorpay payment window.
          </p>
        </div>

        {/* Proceed to Payment CTA */}
        <Button
          onClick={handleProceedToPayment}
          disabled={isLoading || !cartItems.length}
          className="w-full rounded-full bg-bree-primary hover:bg-bree-primary-hover text-white py-4 text-base font-semibold transition-all duration-300 disabled:opacity-60"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              {LOADING_PHASE[loadingPhase]}
            </span>
          ) : (
            "Proceed to Payment"
          )}
        </Button>

        <p className="text-xs text-bree-text-secondary text-center mt-4">
          Payments are processed securely via Razorpay. Cash on Delivery is not
          available.
        </p>
      </div>

      {/* Cart update modal — shown when syncCart detects price/stock changes */}
      <CartUpdateModal
        visible={showCartModal}
        items={cartModalItems}
        onAccept={handleAcceptChanges}
        onReview={handleReviewChanges}
        onClose={() => setShowCartModal(false)}
      />
    </div>
  );
};

export default Checkout;
