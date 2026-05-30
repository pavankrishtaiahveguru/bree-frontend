import { useEffect, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import {
  CheckCircle,
  Loader2,
  Calendar,
  User,
  Mail,
  Phone,
  MapPin,
  Package,
  ArrowRight,
  Download,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { fetchOrderSuccess, getApiErrorMessage } from "@/lib/api";

const formatMoney = (value) => {
  const amount = Number(value ?? 0);
  return `₹${amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatDate = (value) => {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const OrderSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");
  const [orderDetails, setOrderDetails] = useState(null);
  const [items, setItems] = useState([]);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const orderId = searchParams.get("orderId");

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setStatus("error");
        setErrorMessage(
          "Missing order reference. Please check your order confirmation link.",
        );
        return;
      }

      try {
        const response = await fetchOrderSuccess(orderId);
        setOrderDetails(response.data.order);
        setItems(response.data.items || []);
        setPaymentDetails(response.data.paymentDetails || null);
        setStatus("success");
      } catch (error) {
        console.error("Order success fetch error:", error);
        setErrorMessage(getApiErrorMessage(error));
        setStatus("error");
      }
    };

    fetchOrder();
  }, [orderId]);

  const handleTrackOrder = () => {
    if (orderId) {
      navigate(`/order/${orderId}/tracking`);
    }
  };

  return (
    <>
      <Helmet>
        <title>Order Successfully Placed | BREE Wellness</title>
        <meta
          name="description"
          content="Your order has been successfully placed. View the order summary, payment details, and next steps."
        />
      </Helmet>

      <div className="pt-24 min-h-screen bg-bree-bg">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-10">
          {status === "loading" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-24"
            >
              <Loader2 className="w-14 h-14 mx-auto animate-spin text-bree-primary" />
              <h2 className="mt-6 text-3xl font-semibold text-bree-text-primary">
                Finalizing your order
              </h2>
              <p className="mt-3 text-bree-text-secondary">
                Please wait while we confirm your payment and save your order.
              </p>
            </motion.div>
          )}

          {status === "error" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl shadow-sm border border-bree-border p-10 text-center"
            >
              <div className="w-24 h-24 mx-auto rounded-full bg-red-100 flex items-center justify-center">
                <Package className="w-12 h-12 text-red-600" />
              </div>
              <h2 className="mt-6 text-3xl font-semibold text-bree-text-primary">
                Sorry, we could not find your order.
              </h2>
              <p className="mt-3 text-bree-text-secondary max-w-xl mx-auto">
                {errorMessage ||
                  "Please try again or contact our support team."}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Link to="/shop">
                  <Button className="w-full sm:w-auto">
                    Continue Shopping
                  </Button>
                </Link>
                <Link to="/profile?tab=orders">
                  <Button variant="outline" className="w-full sm:w-auto">
                    View My Orders
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}

          {status === "success" && orderDetails && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="bg-white rounded-3xl shadow-sm border border-bree-border p-8">
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="w-14 h-14 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-bree-primary font-semibold">
                      Order Successfully Placed
                    </p>
                    <h1 className="mt-4 text-4xl font-bold text-bree-text-primary">
                      Thank you for your purchase!
                    </h1>
                  </div>
                  <p className="max-w-2xl text-bree-text-secondary">
                    Your payment was successful and your order is now confirmed.
                    You can track the delivery status or continue shopping for
                    more wellness products.
                  </p>
                </div>

                <div className="mt-10 grid gap-4 md:grid-cols-2">
                  <div className="rounded-3xl border border-bree-border bg-bree-bg p-6">
                    <h2 className="text-lg font-semibold text-bree-text-primary mb-4">
                      Order Information
                    </h2>
                    <div className="space-y-3 text-sm text-bree-text-secondary">
                      <div className="flex justify-between gap-4">
                        <span className="font-medium text-bree-text-primary">
                          Order ID
                        </span>
                        <span>#{orderDetails.id}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="font-medium text-bree-text-primary">
                          Payment ID
                        </span>
                        <span>
                          {paymentDetails?.razorpay_payment_id ||
                            orderDetails.razorpayPaymentId ||
                            "—"}
                        </span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="font-medium text-bree-text-primary">
                          Order Date
                        </span>
                        <span>{formatDate(orderDetails.createdAt)}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="font-medium text-bree-text-primary">
                          Payment Status
                        </span>
                        <span className="capitalize">
                          {orderDetails.paymentStatus}
                        </span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="font-medium text-bree-text-primary">
                          Order Status
                        </span>
                        <span className="capitalize">
                          {orderDetails.orderStatus}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-bree-border bg-bree-bg p-6">
                    <h2 className="text-lg font-semibold text-bree-text-primary mb-4">
                      Customer Information
                    </h2>
                    <div className="space-y-3 text-sm text-bree-text-secondary">
                      <div className="flex items-start gap-3">
                        <User className="w-5 h-5 text-bree-primary mt-0.5" />
                        <div>
                          <p className="font-medium text-bree-text-primary">
                            {orderDetails.contactName}
                          </p>
                          <p>Customer Name</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Mail className="w-5 h-5 text-bree-primary mt-0.5" />
                        <div>
                          <p className="font-medium text-bree-text-primary">
                            {orderDetails.contactEmail}
                          </p>
                          <p>Email</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Phone className="w-5 h-5 text-bree-primary mt-0.5" />
                        <div>
                          <p className="font-medium text-bree-text-primary">
                            {orderDetails.contactPhone}
                          </p>
                          <p>Phone Number</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-bree-primary mt-0.5" />
                        <div>
                          <p className="font-medium text-bree-text-primary">
                            Shipping Address
                          </p>
                          <p className="text-bree-text-secondary">
                            {orderDetails.shippingAddress || "Not available"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-6 xl:grid-cols-[1.6fr_0.9fr]">
                <div className="space-y-6">
                  <div className="bg-white rounded-3xl shadow-sm border border-bree-border p-6">
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <h2 className="text-xl font-semibold text-bree-text-primary">
                          Ordered Products
                        </h2>
                        <p className="text-sm text-bree-text-secondary">
                          Review the items included in this order.
                        </p>
                      </div>
                      <Package className="w-6 h-6 text-bree-primary" />
                    </div>

                    <div className="space-y-4">
                      {items.map((item, index) => (
                        <div
                          key={`${item.product_id}-${index}`}
                          className="flex flex-col gap-4 rounded-3xl border border-bree-border p-4 md:flex-row md:items-center md:justify-between"
                        >
                          <div className="flex items-center gap-4">
                            <div className="h-20 w-20 rounded-3xl bg-bree-bg overflow-hidden flex items-center justify-center">
                              {item.image ? (
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="h-full w-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.src =
                                      "/placeholder-product.png";
                                  }}
                                />
                              ) : (
                                <div className="text-bree-text-secondary text-sm text-center px-2">
                                  No image
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-bree-text-primary">
                                {item.name}
                              </p>
                              <p className="text-sm text-bree-text-secondary mt-1">
                                Qty {item.quantity} ×{" "}
                                {formatMoney(item.unit_price)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-bree-text-secondary">
                              Item Total
                            </p>
                            <p className="font-semibold text-bree-text-primary">
                              {formatMoney(item.subtotal)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-white rounded-3xl shadow-sm border border-bree-border p-6">
                    <h2 className="text-xl font-semibold text-bree-text-primary mb-5">
                      Order Summary
                    </h2>
                    <div className="space-y-3 text-sm text-bree-text-secondary">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>{formatMoney(orderDetails.subtotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shipping Charges</span>
                        <span>{formatMoney(orderDetails.shipping)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax</span>
                        <span>{formatMoney(orderDetails.tax)}</span>
                      </div>
                      <div className="border-t border-bree-border pt-4 flex justify-between text-base font-semibold text-bree-text-primary">
                        <span>Grand Total</span>
                        <span>{formatMoney(orderDetails.total)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-bree-bg rounded-3xl border border-bree-border p-6">
                    <h2 className="text-lg font-semibold text-bree-text-primary mb-4">
                      What would you like to do next?
                    </h2>
                    <div className="grid gap-3">
                      <Button
                        onClick={handleTrackOrder}
                        className="w-full flex items-center justify-center gap-2"
                      >
                        Track Order
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                      <Link to="/profile?tab=orders">
                        <Button variant="outline" className="w-full">
                          View My Orders
                        </Button>
                      </Link>
                      <Link to="/shop">
                        <Button variant="outline" className="w-full">
                          Continue Shopping
                        </Button>
                      </Link>
                      <Link to="/">
                        <Button variant="outline" className="w-full">
                          Home Page
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
};

export default OrderSuccess;
