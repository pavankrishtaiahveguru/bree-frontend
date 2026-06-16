import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import axios from "@/lib/api";
import { Loader2 } from "lucide-react";
import TrackingTimeline from "@/components/orders/TrackingTimeline";
import OrderTrackingCard from "@/components/orders/OrderTrackingCard";
import useOrdersSync from "@/hooks/useOrdersSync";

const formatStatusLabel = (status) => {
  if (!status) return "";
  return String(status)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const API = `${
  process.env.REACT_APP_BACKEND_URL || "http://localhost:4000"
}/api`;

const OrderTracking = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [tracking, setTracking] = useState([]);
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  const fetch = useCallback(async () => {
    setLoading(true);

    try {
      const res = await axios.get(`${API}/orders/${id}/tracking`, {
        withCredentials: true,
      });

      // console.log("API RESPONSE", res.data);
      // console.log("ORDER ITEMS", res.data.order?.items);

      if (res.data?.order) {
        setOrder(res.data.order);
        setTracking(res.data.history || []);
        const resolvedItems =
          (res.data.order?.items?.length ? res.data.order.items : null) ||
          (res.data.items?.length ? res.data.items : null) ||
          (res.data.orderItems?.length ? res.data.orderItems : null) ||
          [];
        setItems(resolvedItems);
        // console.log("Order", res.data.order);
        // console.log("Items", resolvedItems);
        // console.log("Shipping", res.data.order.shipping_address);
        setError("");
      } else {
        setError("Order not found. Please verify the order ID and try again.");
      }
    } catch (e) {
      console.error(e);
      setError(
        e?.response?.status === 404
          ? "Order not found. Please verify the order ID."
          : "Unable to load tracking details. Please try again later.",
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  useOrdersSync((updated) => {
    if (!updated || String(updated.id) !== String(id)) return;
    fetch();
  });

  const steps = useMemo(() => {
    // Build steps from order status history
    const historySteps = tracking.map((item, index) => ({
      id: item.id || `${item.order_id}-${item.created_at}`,
      key: item.id || `${item.order_id}-${item.created_at}`,
      status: item.new_status || item.status,
      label: formatStatusLabel(item.new_status || item.status),
      timestamp: item.created_at,
      notes: item.notes,
      state: index === tracking.length - 1 ? "active" : "completed",
    }));

    // If no "pending" status in history, prepend it with order.created_at
    const hasPending = historySteps.some(
      (step) =>
        String(step.status).toLowerCase() === "pending" ||
        String(step.label).toLowerCase() === "pending",
    );

    if (!hasPending && order?.created_at) {
      // console.log(
      //   "[DEBUG Timeline]",
      //   "Injecting pending status with created_at:",
      //   order.created_at,
      // );
      return [
        {
          id: `pending-${order.id}`,
          key: `pending-${order.id}`,
          status: "pending",
          label: "Pending",
          timestamp: order.created_at,
          notes: null,
          state: "completed",
        },
        ...historySteps,
      ];
    }

    // console.log(
    //   "[DEBUG Timeline]",
    //   "Pending already in history or no order.created_at",
    // );
    return historySteps;
  }, [tracking, order]);

  const subtotal =
    order?.subtotal != null
      ? Number(order.subtotal)
      : items.reduce(
          (sum, item) =>
            sum +
            Number(item.product_price || item.price || 0) *
              Number(item.quantity || 1),
          0,
        );

  const total =
    order?.total != null
      ? Number(order.total)
      : order?.amount != null
        ? Number(order.amount)
        : subtotal;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-bree-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bree-bg px-6">
        <div className="max-w-xl w-full bg-white rounded-3xl shadow-premium border border-bree-border p-8 text-center">
          <h1 className="text-xl font-semibold text-bree-text-primary mb-3">
            Unable to load tracking details
          </h1>
          <p className="text-sm text-bree-text-secondary mb-6">{error}</p>
          <button
            type="button"
            onClick={() => navigate("/profile")}
            className="inline-flex items-center justify-center rounded-full bg-bree-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-bree-primary-hover"
          >
            Back to profile
          </button>
        </div>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="pt-24 pb-12 min-h-screen bg-bree-bg">
      <Helmet>
        <title>Track Order #{order.id} — BREE</title>
      </Helmet>

      <div className="max-w-5xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <OrderTrackingCard order={order} />

            <div className="bg-white rounded-2xl p-6 shadow-premium border border-bree-border">
              <h3 className="font-semibold text-bree-text-primary mb-4">
                Tracking Timeline
              </h3>

              {steps.length === 0 ? (
                <div className="text-sm text-bree-text-secondary">
                  No tracking updates available
                </div>
              ) : (
                <TrackingTimeline
                  steps={steps}
                  currentStatus={order.status || order.order_status}
                />
              )}
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-premium border border-bree-border">
              <h3 className="font-semibold text-bree-text-primary mb-4">
                Shipping Address
              </h3>

              <div className="text-sm text-bree-text-secondary">
                <div className="font-medium text-bree-text-primary">
                  {order.contact_name || order.customer_name}
                </div>

                <div className="mt-1">
                  {order.contact_email || order.email || order.mobile_number}
                </div>

                <div className="mt-2 text-sm">
                  {order.shipping_address ||
                    order.address_snapshot ||
                    order.shippingAddress ||
                    ""}
                </div>
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-premium border border-bree-border">
              <h4 className="text-sm text-bree-text-secondary mb-3">
                Order Items
              </h4>

              <div className="space-y-3">
                {items.length === 0 ? (
                  <div className="text-sm text-bree-text-secondary">
                    No items found
                  </div>
                ) : (
                  items.map((it) => (
                    <div
                      key={it.id || it.product_id}
                      className="flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        {it.product_image || it.image ? (
                          <img
                            src={it.product_image || it.image}
                            alt={it.product_name || it.name}
                            className="w-12 h-12 rounded-md object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "/images/product-placeholder.png";
                            }}
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center text-xs text-gray-500">
                            No Image
                          </div>
                        )}

                        <div>
                          <div className="text-sm font-medium text-bree-text-primary">
                            {it.product_name || it.name}
                          </div>

                          <div className="text-xs text-bree-text-secondary">
                            Qty: {it.quantity}
                          </div>
                        </div>
                      </div>

                      <div className="text-sm font-medium">
                        ₹
                        {Number(
                          it.product_price || it.price || it.subtotal || 0,
                        ).toLocaleString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-premium border border-bree-border">
              <h4 className="text-sm text-bree-text-secondary mb-3">
                Order Summary
              </h4>

              <div className="text-sm text-bree-text-secondary">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{Number(subtotal).toLocaleString()}</span>
                </div>

                <div className="flex justify-between mt-2">
                  <span>Shipping</span>
                  <span className="text-green-600 font-medium">Free</span>
                </div>

                <div className="flex justify-between mt-2 font-semibold">
                  <span>Total</span>
                  <span>₹{Number(total).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
