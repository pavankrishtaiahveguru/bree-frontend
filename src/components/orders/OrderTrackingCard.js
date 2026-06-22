import React from "react";
import { getStatusLabel, STATUS_BADGE_CLASSES } from "./orderStatus";

// Card showing order header and summary
const OrderTrackingCard = ({ order }) => {
  const statusKey = order.status || order.order_status || "pending";
  const badgeClass =
    STATUS_BADGE_CLASSES[statusKey] ||
    "bg-gray-100 text-gray-700 border-gray-200";

  const orderDateValue =
    order.created_at || order.order_date || order.createdAt || null;
  const parsedOrderDate = orderDateValue ? new Date(orderDateValue) : null;
  const orderDateString =
    parsedOrderDate instanceof Date && !isNaN(parsedOrderDate)
      ? parsedOrderDate.toLocaleString("en-IN", {
          dateStyle: "medium",
          timeStyle: "short",
        })
      : null;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-premium border border-bree-border">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs text-bree-text-secondary">Order Number</p>
          <h3 className="font-outfit text-lg font-semibold text-bree-text-primary">
            #{order.order_number || order.id}
          </h3>
          <p className="text-sm text-bree-text-secondary mt-1">
            {orderDateString || "Date unavailable"}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-bree-text-secondary">Status</p>
          <div
            className={`mt-1 inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${badgeClass}`}
          >
            <span>{getStatusLabel(statusKey)}</span>
          </div>
          <p className="text-xs text-bree-text-secondary mt-2">
            Payment:{" "}
            <span className="font-medium capitalize">
              {order.payment_status || "pending"}
            </span>
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="text-sm text-bree-text-secondary">
          <div>Subtotal</div>
          <div className="font-medium text-bree-text-primary">
            ₹{Number(order.subtotal ?? order.total ?? 0).toLocaleString()}
          </div>
        </div>
        <div className="text-sm text-bree-text-secondary">
          <div>Shipping</div>
          <div className="text-green-600 font-medium">Free</div>
        </div>
      </div>
    </div>
  );
};

export default OrderTrackingCard;
