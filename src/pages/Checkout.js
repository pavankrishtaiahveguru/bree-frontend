import { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { Check, MapPin, User, Package, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import axios from "@/lib/api";
import { toast } from "sonner";
import { openRazorpayCheckout } from "@/lib/razorpayLoader";

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, cartTotal, clearCart } = useCart();

  // State
  const [step, setStep] = useState("validate"); // validate, address, contact, summary, payment, confirm
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: "Home",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    isDefault: true,
  });
  const [contactInfo, setContactInfo] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [cartValidation, setCartValidation] = useState(null);
  const [isValidating, setIsValidating] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [orderCreated, setOrderCreated] = useState(null);

  // Fetch user data on mount
  useEffect(() => {
    if (!cartItems.length) {
      navigate("/shop");
      return;
    }
    validateAndLoadData();
  }, []);

  // Validate cart and load addresses
  const validateAndLoadData = async () => {
    setIsValidating(true);
    try {
      // 1. Validate cart
      const validationResponse = await axios.post("/api/orders/validate-cart", {
        cartItems: cartItems.map((item) => ({
          id: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
      });

      setCartValidation(validationResponse.data);

      // If cart has errors, show them
      if (!validationResponse.data.valid) {
        toast.error("Your cart has items that need attention");
        setStep("cart-update");
        setIsValidating(false);
        return;
      }

      // 2. Fetch user addresses
      const addressResponse = await axios.get("/api/addresses");
      setAddresses(addressResponse.data);

      // Set default address if available
      const defaultAddr = addressResponse.data.find((a) => a.is_default);
      if (defaultAddr) {
        setSelectedAddress(defaultAddr.id);
      }

      // Fetch user profile for contact info
      const profileResponse = await axios.get("/api/profile");
      setContactInfo({
        name: profileResponse.data.name || "",
        email: profileResponse.data.email || "",
        phone: profileResponse.data.phone || "",
      });

      setStep("address");
      setIsValidating(false);
    } catch (error) {
      console.error("Validation error:", error);
      toast.error("Failed to load checkout data");
      setIsValidating(false);
    }
  };

  // Handle address selection
  const handleAddressSelect = (addressId) => {
    setSelectedAddress(addressId);
  };

  const handleNewAddressChange = (field, value) => {
    setNewAddress((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveAddress = async () => {
    const { line1, city, state, pincode, country } = newAddress;
    if (!line1 || !city || !state || !pincode || !country) {
      toast.error("Please fill in all required address fields");
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.post("/api/addresses", newAddress);
      const savedAddress = response.data;
      setAddresses((prev) => [...prev, savedAddress]);
      setSelectedAddress(savedAddress.id);
      setShowAddressForm(false);
      toast.success("Address added successfully");
    } catch (error) {
      console.error("Save address error:", error);
      toast.error(error.response?.data?.message || "Failed to save address");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle contact info change
  const handleContactChange = (field, value) => {
    setContactInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");

      script.src = "https://checkout.razorpay.com/v1/checkout.js";

      script.onload = () => resolve(true);

      script.onerror = () => resolve(false);

      document.body.appendChild(script);
    });
  };

  // Proceed to order confirmation
  const handleProceedToConfirm = async () => {
    if (!selectedAddress) {
      toast.error("Please select a delivery address");
      return;
    }

    if (!contactInfo.name || !contactInfo.email || !contactInfo.phone) {
      toast.error("Please fill in all contact information");
      return;
    }

    setStep("summary");
  };

  const handleConfirmOrder = async () => {
    if (!cartItems.length) {
      toast.error("Your cart is empty.");
      return;
    }

    if (!selectedAddress) {
      toast.error("Please select a delivery address.");
      return;
    }

    try {
      setIsLoading(true);

      // STEP 1: Validate latest cart prices before payment
      const validationResponse = await axios.post("/api/orders/validate-cart", {
        cartItems: cartItems.map((item) => ({
          id: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
      });

      if (!validationResponse.data.valid) {
        toast.error(
          "Some product prices changed. Please review your cart again.",
        );

        setCartValidation(validationResponse.data);
        setStep("summary");
        return;
      }

      const selectedAddressObject = addresses.find(
        (address) => String(address.id) === String(selectedAddress),
      );

      const shippingAddress = selectedAddressObject
        ? [
            selectedAddressObject.line1 ||
              selectedAddressObject.address_line_1 ||
              selectedAddressObject.addressLine1,
            selectedAddressObject.line2 ||
              selectedAddressObject.address_line_2 ||
              selectedAddressObject.addressLine2,
            selectedAddressObject.city,
            selectedAddressObject.state,
            selectedAddressObject.pincode,
            selectedAddressObject.country,
          ]
            .filter(Boolean)
            .join(", ")
        : "";

      if (!shippingAddress) {
        toast.error(
          "Unable to resolve shipping address. Please choose another address.",
        );
        return;
      }

      const paymentResponse = await axios.post("/api/payment/create-order", {
        amount: cartTotal,
        currency: "INR",
        items: cartItems.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
          name: item.name,
          price: item.price,
        })),
        customerName: contactInfo.name,
        email: contactInfo.email,
        mobileNumber: contactInfo.phone,
        shippingAddress,
      });

      const razorpayOrder = paymentResponse.data;

      const razorpayLoaded = await loadRazorpay();

      if (!razorpayLoaded) {
        setIsLoading(false);
        toast.error("Failed to load payment gateway");
        return;
      }

      await openRazorpayCheckout({
        key_id: razorpayOrder.key_id || process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "BREE Wellness",
        description: "Order Payment",
        order_id: razorpayOrder.razorpay_order_id || razorpayOrder.id,
        prefill: {
          name: contactInfo.name,
          email: contactInfo.email,
          contact: contactInfo.phone,
        },
        theme: {
          color: "#84A95A",
        },
        onSuccess: async (response) => {
          const verifyResponse = await axios.post("/api/payment/verify", {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });

          if (!verifyResponse.data.success) {
            throw new Error(
              verifyResponse.data.message || "Payment verification failed.",
            );
          }

          const savedOrderId = verifyResponse.data.order_id;
          if (!savedOrderId) {
            throw new Error(
              "Could not resolve order after payment verification.",
            );
          }

          clearCart();
          navigate(`/checkout/success?order_id=${savedOrderId}`);
        },
      });
    } catch (error) {
      console.error("Order creation error:", error.response?.data || error);
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Failed to initialize payment",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (isValidating) {
    return (
      <div className="min-h-screen bg-bree-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-2 border-bree-primary border-t-transparent animate-spin mx-auto mb-4"></div>
          <p className="text-bree-text-secondary">Validating your cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mt-10 bg-bree-bg py-8 px-4">
      <div className="max-w-7xl mt-10 mx-auto">
        {/* Stepper */}
        <div className="mb-10">
          {(() => {
            const checkoutSteps = [
              { key: "address", label: "Address" },
              { key: "contact", label: "Contact" },
              { key: "summary", label: "Summary" },
              { key: "payment", label: "Payment" },
            ];

            const currentStepIndex = checkoutSteps.findIndex(
              (item) => item.key === step,
            );

            return (
              <div className="flex items-center justify-center">
                {checkoutSteps.map((item, index) => {
                  const isCompleted = index < currentStepIndex;
                  const isActive = index === currentStepIndex;

                  return (
                    <div key={item.key} className="flex items-center">
                      {/* Step Circle */}
                      <div
                        className={`
                  relative
                  w-12 h-12
                  rounded-full
                  flex items-center justify-center
                  text-sm font-semibold
                  transition-all duration-300
                  ${
                    isCompleted
                      ? "bg-bree-primary text-white"
                      : isActive
                        ? "bg-bree-primary text-white ring-4 ring-bree-primary/20"
                        : "bg-white border-2 border-bree-border text-bree-text-secondary"
                  }
                `}
                      >
                        {isCompleted ? (
                          <Check className="w-5 h-5" />
                        ) : (
                          index + 1
                        )}
                      </div>

                      {/* Step Label */}
                      <div className="hidden md:block ml-3 mr-6">
                        <p
                          className={`
                    text-sm font-medium transition-colors duration-300
                    ${
                      isCompleted || isActive
                        ? "text-bree-primary"
                        : "text-bree-text-secondary"
                    }
                  `}
                        >
                          {item.label}
                        </p>
                      </div>

                      {/* Connector Line */}
                      {index !== checkoutSteps.length - 1 && (
                        <div
                          className={`
                    w-10 md:w-20 h-1 rounded-full transition-all duration-300
                    ${
                      index < currentStepIndex
                        ? "bg-bree-primary"
                        : "bg-bree-border"
                    }
                  `}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Address Selection */}
            {step === "address" && (
              <div className="bg-white rounded-3xl p-6 mb-6 shadow-sm border border-bree-border">
                <div className="flex items-center gap-3 mb-6">
                  <MapPin className="w-5 h-5 text-bree-primary" />
                  <h2 className="text-xl font-bold text-bree-text-primary">
                    Delivery Address
                  </h2>
                </div>

                <div className="space-y-3">
                  {addresses.map((address) => (
                    <button
                      key={address.id}
                      onClick={() => handleAddressSelect(address.id)}
                      className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${
                        selectedAddress === address.id
                          ? "border-bree-primary bg-bree-primary/5"
                          : "border-bree-border hover:border-bree-primary/50"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-bree-text-primary">
                            {address.label || "Address"}
                          </p>
                          <p className="text-sm text-bree-text-secondary mt-1">
                            {address.line1}
                            {address.line2 && `, ${address.line2}`}
                          </p>
                          <p className="text-sm text-bree-text-secondary">
                            {address.city}, {address.state} {address.pincode}
                          </p>
                        </div>
                        {selectedAddress === address.id && (
                          <Check className="w-5 h-5 text-bree-primary" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="mt-6 space-y-4">
                  <Button
                    onClick={() => setShowAddressForm((prev) => !prev)}
                    variant="outline"
                    className="w-full rounded-full border-bree-primary text-bree-primary"
                  >
                    {showAddressForm
                      ? "Cancel"
                      : addresses.length
                        ? "Add New Address"
                        : "Add Delivery Address"}
                  </Button>

                  {showAddressForm && (
                    <div className="space-y-4 rounded-3xl border border-bree-border p-5 bg-bree-bg">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                          <label className="block text-sm font-medium text-bree-text-primary mb-2">
                            Address Label
                          </label>
                          <input
                            type="text"
                            value={newAddress.label}
                            onChange={(e) =>
                              handleNewAddressChange("label", e.target.value)
                            }
                            className="w-full px-4 py-3 rounded-xl border border-bree-border focus:outline-none focus:border-bree-primary bg-white"
                            placeholder="Home, Office, etc."
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-bree-text-primary mb-2">
                            Street Address
                          </label>
                          <input
                            type="text"
                            value={newAddress.line1}
                            onChange={(e) =>
                              handleNewAddressChange("line1", e.target.value)
                            }
                            className="w-full px-4 py-3 rounded-xl border border-bree-border focus:outline-none focus:border-bree-primary bg-white"
                            placeholder="Flat / building / area"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                          <label className="block text-sm font-medium text-bree-text-primary mb-2">
                            Landmark (optional)
                          </label>
                          <input
                            type="text"
                            value={newAddress.line2}
                            onChange={(e) =>
                              handleNewAddressChange("line2", e.target.value)
                            }
                            className="w-full px-4 py-3 rounded-xl border border-bree-border focus:outline-none focus:border-bree-primary bg-white"
                            placeholder="Landmark"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-bree-text-primary mb-2">
                            City
                          </label>
                          <input
                            type="text"
                            value={newAddress.city}
                            onChange={(e) =>
                              handleNewAddressChange("city", e.target.value)
                            }
                            className="w-full px-4 py-3 rounded-xl border border-bree-border focus:outline-none focus:border-bree-primary bg-white"
                            placeholder="City"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div>
                          <label className="block text-sm font-medium text-bree-text-primary mb-2">
                            State
                          </label>
                          <input
                            type="text"
                            value={newAddress.state}
                            onChange={(e) =>
                              handleNewAddressChange("state", e.target.value)
                            }
                            className="w-full px-4 py-3 rounded-xl border border-bree-border focus:outline-none focus:border-bree-primary bg-white"
                            placeholder="State"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-bree-text-primary mb-2">
                            Pincode
                          </label>
                          <input
                            type="text"
                            value={newAddress.pincode}
                            onChange={(e) =>
                              handleNewAddressChange("pincode", e.target.value)
                            }
                            className="w-full px-4 py-3 rounded-xl border border-bree-border focus:outline-none focus:border-bree-primary bg-white"
                            placeholder="Pincode"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-bree-text-primary mb-2">
                            Country
                          </label>
                          <input
                            type="text"
                            value={newAddress.country}
                            onChange={(e) =>
                              handleNewAddressChange("country", e.target.value)
                            }
                            className="w-full px-4 py-3 rounded-xl border border-bree-border focus:outline-none focus:border-bree-primary bg-white"
                            placeholder="Country"
                          />
                        </div>
                      </div>

                      <Button
                        onClick={handleSaveAddress}
                        className="w-full rounded-full bg-bree-primary hover:bg-bree-primary-hover text-white"
                      >
                        Save Address
                      </Button>
                    </div>
                  )}
                </div>

                <Button
                  onClick={() => setStep("contact")}
                  className="w-full mt-6 rounded-full bg-bree-primary hover:bg-bree-primary-hover text-white"
                >
                  Continue to Contact Info
                </Button>
              </div>
            )}

            {/* Contact Information */}
            {step === "contact" && (
              <div className="bg-white rounded-3xl p-6 mb-6 shadow-sm border border-bree-border">
                <div className="flex items-center gap-3 mb-6">
                  <User className="w-5 h-5 text-bree-primary" />
                  <h2 className="text-xl font-bold text-bree-text-primary">
                    Contact Information
                  </h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-bree-text-primary mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={contactInfo.name}
                      onChange={(e) =>
                        handleContactChange("name", e.target.value)
                      }
                      className="w-full px-4 py-3 rounded-xl border border-bree-border focus:outline-none focus:border-bree-primary bg-bree-bg"
                      placeholder="Your name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-bree-text-primary mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={contactInfo.email}
                      onChange={(e) =>
                        handleContactChange("email", e.target.value)
                      }
                      className="w-full px-4 py-3 rounded-xl border border-bree-border focus:outline-none focus:border-bree-primary bg-bree-bg"
                      placeholder="your@email.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-bree-text-primary mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={contactInfo.phone}
                      onChange={(e) =>
                        handleContactChange("phone", e.target.value)
                      }
                      className="w-full px-4 py-3 rounded-xl border border-bree-border focus:outline-none focus:border-bree-primary bg-bree-bg"
                      placeholder="+91 9876543210"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button
                    onClick={() => setStep("address")}
                    variant="outline"
                    className="flex-1 rounded-full"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleProceedToConfirm}
                    className="flex-1 rounded-full bg-bree-primary hover:bg-bree-primary-hover text-white"
                  >
                    Review Order
                  </Button>
                </div>
              </div>
            )}

            {/* Order Summary */}
            {step === "summary" && (
              <div className="bg-white rounded-3xl p-6 mb-6 shadow-sm border border-bree-border">
                <div className="flex items-center gap-3 mb-6">
                  <Package className="w-5 h-5 text-bree-primary" />
                  <h2 className="text-xl font-bold text-bree-text-primary">
                    Order Summary
                  </h2>
                </div>

                <div className="space-y-4 mb-6">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 pb-4 border-b border-bree-border"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 rounded-lg object-contain bg-bree-bg p-2"
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-bree-text-primary">
                          {item.name}
                        </p>
                        <p className="text-sm text-bree-text-secondary">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-bree-text-primary">
                          ₹
                          {(item.price * item.quantity).toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Validation Alert if needed */}
                {cartValidation && !cartValidation.valid && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 flex gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-yellow-900">
                        Cart Update
                      </p>
                      <div className="mt-2 space-y-2">
                        {cartValidation?.cartItems
                          ?.filter((item) => !item.valid)
                          ?.map((item) => (
                            <div
                              key={item.productId}
                              className="text-sm text-yellow-900 bg-yellow-100 rounded-lg px-3 py-2"
                            >
                              <p className="font-medium">
                                {item.productName || "Product"}
                              </p>

                              <p>{item.reason}</p>

                              {item.priceChanged && (
                                <p>
                                  ₹{item.previousPrice} → ₹{item.currentPrice}
                                </p>
                              )}
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    onClick={() => setStep("contact")}
                    variant="outline"
                    className="flex-1 rounded-full"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={() => setStep("payment")}
                    className="flex-1 rounded-full bg-bree-primary hover:bg-bree-primary-hover text-white"
                  >
                    Confirm Order
                  </Button>
                </div>
              </div>
            )}

            {/* Payment Section */}
            {step === "payment" && (
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-bree-border">
                <h2 className="text-xl font-bold text-bree-text-primary mb-6">
                  Complete Your Order
                </h2>

                <div className="bg-bree-bg rounded-2xl p-6 mb-6 text-center">
                  <p className="text-sm text-bree-text-secondary mb-2">
                    Order Total
                  </p>
                  <p className="text-4xl font-bold text-bree-primary">
                    ₹{cartTotal.toLocaleString("en-IN")}
                  </p>
                </div>

                {/* RAZORPAY TEMPORARILY DISABLED FOR TESTING */}
                {/* Production: Uncomment Razorpay integration below */}

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                  <p className="text-sm text-blue-900">
                    You will be redirected to Razorpay payment gateway
                  </p>
                </div>

                <Button
                  onClick={handleConfirmOrder}
                  disabled={isLoading}
                  className="w-full rounded-full bg-bree-primary hover:bg-bree-primary-hover text-white py-3 font-semibold"
                >
                  {isLoading ? "Processing..." : "Confirm & Complete Order"}
                </Button>

                <p className="text-xs text-bree-text-secondary text-center mt-4">
                  Your order details will be saved and you can track it anytime
                </p>
              </div>
            )}
          </div>

          {/* Sticky Order Summary (Desktop) */}
          <div className="hidden lg:block">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-bree-border sticky top-6">
              <h3 className="font-bold text-bree-text-primary mb-4">
                Order Details
              </h3>

              <div className="space-y-3 mb-6 pb-6 border-b border-bree-border">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-bree-text-secondary">
                      {item.name} x {item.quantity}
                    </span>
                    <span className="font-semibold text-bree-text-primary">
                      ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 mb-6">
                <div className="flex justify-between">
                  <span className="text-bree-text-secondary">Subtotal</span>
                  <span className="font-semibold text-bree-text-primary">
                    ₹{cartTotal.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-bree-text-secondary">Shipping</span>
                  <span className="font-semibold text-bree-text-primary">
                    Free
                  </span>
                </div>
              </div>

              <div className="border-t border-bree-border pt-4">
                <div className="flex justify-between mb-4">
                  <span className="font-semibold text-bree-text-primary">
                    Total
                  </span>
                  <span className="text-2xl font-bold text-bree-primary">
                    ₹{cartTotal.toLocaleString("en-IN")}
                  </span>
                </div>

                {selectedAddress && (
                  <div className="bg-bree-bg rounded-xl p-3 text-xs">
                    <p className="font-semibold text-bree-text-primary mb-1">
                      Delivery to
                    </p>
                    <p className="text-bree-text-secondary">
                      {addresses.find((a) => a.id === selectedAddress)?.label}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
