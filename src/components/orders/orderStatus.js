// Central order lifecycle configuration used across frontend components.
// frontend /components/orders/orderStatus.js
export const ORDER_STEPS = [
  "pending",
  "confirmed",
  "processing",
  "dispatched",
  "delivered",
];

export const STATUS_LABELS = {
  pending: "Order Placed",
  confirmed: "Confirmed",
  processing: "Processing",
  dispatched: "Dispatched",
  delivered: "Delivered",
};

export const STATUS_DISPLAY = {
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  dispatched: "Dispatched",
  delivered: "Delivered",
};

export const STATUS_BADGE_CLASSES = {
  pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
  confirmed: "bg-sky-100 text-sky-700 border-sky-200",
  processing: "bg-sky-100 text-sky-700 border-sky-200",
  dispatched: "bg-emerald-100 text-emerald-700 border-emerald-200",
  delivered: "bg-green-100 text-green-700 border-green-200",
};

export const getStatusIndex = (status) => ORDER_STEPS.indexOf(status);

export const getStatusLabel = (status) => STATUS_DISPLAY[status] || status;

export const getValidNextStatuses = (currentStatus) => {
  const currentIndex = getStatusIndex(currentStatus);

  if (currentIndex < 0) return [currentStatus];

  if (currentStatus === "delivered") {
    return [currentStatus];
  }

  const nextIndex = Math.min(currentIndex + 1, ORDER_STEPS.length - 1);

  return [currentStatus, ORDER_STEPS[nextIndex]];
};
