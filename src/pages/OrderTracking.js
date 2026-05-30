import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import axios from "@/lib/api";
import { Loader2 } from "lucide-react";
import TrackingTimeline from "@/components/orders/TrackingTimeline";
import OrderTrackingCard from "@/components/orders/OrderTrackingCard";
import useOrdersSync from "@/hooks/useOrdersSync";

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

  const fetch = useCallback(async () => {
    setLoading(true);

    try {
      const res = await axios.get(`${API}/orders/${id}/tracking`, {
        withCredentials: true,
      });

      if (res.data?.success) {
        setOrder(res.data.order);
        setTracking(res.data.tracking || []);
        setItems(res.data.items || []);
      } else {
        navigate("/profile");
      }
    } catch (e) {
      console.error(e);
      navigate("/profile");
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  useOrdersSync((updated) => {
    if (!updated || String(updated.id) !== String(id)) return;
    fetch();
  });

  const steps = useMemo(() => tracking, [tracking]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-bree-primary" />
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

              <TrackingTimeline
                steps={steps}
                currentStatus={order.status || order.order_status}
              />
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-premium border border-bree-border">
              <h3 className="font-semibold text-bree-text-primary mb-4">
                Shipping Address
              </h3>

              <div className="text-sm text-bree-text-secondary">
                <div className="font-medium text-bree-text-primary">
                  {order.contactName || order.customer_name}
                </div>

                <div className="mt-1">
                  {order.contactPhone || order.mobile_number}
                </div>

                <div className="mt-2 text-sm">
                  {order.shippingAddress || order.address_snapshot || ""}
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
                        <img
                          src={
                            it.product_image ||
                            it.image ||
                            "https://via.placeholder.com/80x80?text=Product"
                          }
                          alt={it.product_name || it.name}
                          className="w-12 h-12 rounded-md object-cover"
                        />

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
                  <span>
                    ₹
                    {Number(
                      order.subtotal ?? order.total ?? 0,
                    ).toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between mt-2">
                  <span>Shipping</span>
                  <span>₹{Number(order.shipping ?? 0).toLocaleString()}</span>
                </div>

                <div className="flex justify-between mt-2 font-semibold">
                  <span>Total</span>
                  <span>
                    ₹{Number(order.total ?? order.amount ?? 0).toLocaleString()}
                  </span>
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
