// Central order lifecycle configuration used across frontend components.
export const ORDER_STEPS = [
  'pending',
  'confirmed',
  'dispatched',
  'delivered',
];

export const STATUS_LABELS = {
  pending: 'Order Placed',
  confirmed: 'Confirmed',
  dispatched: 'Dispatched',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export const STATUS_DISPLAY = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  dispatched: 'Dispatched',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export const STATUS_BADGE_CLASSES = {
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  confirmed: 'bg-sky-100 text-sky-700 border-sky-200',
  dispatched: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  delivered: 'bg-green-100 text-green-700 border-green-200',
  cancelled: 'bg-red-100 text-red-600 border-red-200',
};

export const getStatusIndex = (status) => ORDER_STEPS.indexOf(status);

export const getStatusLabel = (status) => STATUS_DISPLAY[status] || status;

export const getValidNextStatuses = (currentStatus) => {
  const currentIndex = getStatusIndex(currentStatus);
  if (currentIndex < 0) return [currentStatus];
  if (currentStatus === 'delivered' || currentStatus === 'cancelled') {
    return [currentStatus];
  }
  const nextIndex = Math.min(currentIndex + 1, ORDER_STEPS.length - 1);
  const options = [currentStatus, ORDER_STEPS[nextIndex]];
  return options;
};
