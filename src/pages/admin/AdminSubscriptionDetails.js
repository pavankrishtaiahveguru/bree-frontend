import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Pause, Play, Trash, ArrowLeft, Eye } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  fetchAdminSubscriptionDetails,
  pauseAdminSubscription,
  resumeAdminSubscription,
  cancelAdminSubscription,
} from "@/services/adminSubscriptionService";

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "-";

const formatDateTime = (value) =>
  value
    ? new Date(value).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "-";

const StatusBadge = ({ status }) => {
  const map = {
    active: "bg-emerald-100 text-emerald-700 border-emerald-200",
    paused: "bg-amber-100 text-amber-700 border-amber-200",
    cancelled: "bg-rose-100 text-rose-700 border-rose-200",
    past_due: "bg-red-100 text-red-700 border-red-200",
    expired: "bg-slate-100 text-slate-700 border-slate-200",
    pending: "bg-sky-100 text-sky-700 border-sky-200",
  };

  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${map[status] || map.pending}`}
    >
      {status === "past_due" ? "Payment Failed" : status}
    </span>
  );
};

const ConfirmModal = ({
  open,
  onClose,
  action,
  onConfirm,
  reason,
  setReason,
}) => {
  if (!open) return null;

  const title =
    action === "cancel"
      ? "Cancel Subscription"
      : action === "pause"
        ? "Pause Subscription"
        : "Resume Subscription";
  const description =
    action === "cancel"
      ? "Cancelling will stop all future renewals for this subscription."
      : action === "pause"
        ? "Pausing will stop the subscription until it is resumed."
        : "Resuming will restart renewal attempts for this subscription.";

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="w-full max-w-2xl rounded-3xl bg-white border border-bree-border p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-bree-text-primary">
              {title}
            </h2>
            <p className="text-sm text-bree-text-secondary mt-2">
              {description}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-2xl p-2 hover:bg-bree-bg"
          >
            ×
          </button>
        </div>

        {action === "cancel" && (
          <div className="mt-6">
            <label className="text-sm font-medium text-bree-text-secondary">
              Admin Reason
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              className="mt-2 w-full rounded-3xl border border-bree-border p-4 text-sm text-bree-text-primary outline-none focus:ring-2 focus:ring-bree-primary/30"
              placeholder="Provide a cancellation reason for audit and customer communication"
            />
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} className="rounded-2xl">
            Close
          </Button>
          <Button
            onClick={onConfirm}
            className={`rounded-2xl ${action === "cancel" ? "bg-red-500 hover:bg-red-600 text-white" : "bg-bree-primary hover:bg-bree-primary-hover text-white"}`}
          >
            {action === "cancel"
              ? "Confirm Cancellation"
              : action === "pause"
                ? "Pause Subscription"
                : "Resume Subscription"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

const AdminSubscriptionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [confirm, setConfirm] = useState({ open: false, action: null });
  const [cancelReason, setCancelReason] = useState("");

  const loadDetails = useCallback(async () => {
    setLoading(true);

    try {
      const payload = await fetchAdminSubscriptionDetails(id);
      setData(payload);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Unable to load subscription details.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadDetails();
  }, [loadDetails]);

  const handleAction = async (action) => {
    if (action === "cancel" && !cancelReason.trim()) {
      toast.error("Please enter a cancellation reason.");
      return;
    }

    try {
      if (action === "pause") {
        await pauseAdminSubscription(id);
        toast.success("Subscription paused.");
      }
      if (action === "resume") {
        await resumeAdminSubscription(id);
        toast.success("Subscription resumed.");
      }
      if (action === "cancel") {
        await cancelAdminSubscription(id, cancelReason.trim());
        toast.success("Subscription cancelled.");
      }
      setConfirm({ open: false, action: null });
      loadDetails();
    } catch (err) {
      console.error(err);
      toast.error("Action failed. Please try again.");
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-8 bg-bree-bg min-h-screen">
          <div className="rounded-3xl border border-bree-border bg-white p-8 animate-pulse" />
        </div>
      </AdminLayout>
    );
  }

  if (error || !data?.subscription) {
    return (
      <AdminLayout>
        <div className="p-8 bg-bree-bg min-h-screen">
          <div className="rounded-3xl border border-bree-border bg-white p-8 text-center">
            <p className="text-xl font-semibold text-bree-text-primary">
              Subscription details could not be loaded.
            </p>
            <p className="text-bree-text-secondary mt-3">
              {error || "Please check the subscription ID and try again."}
            </p>
            <div className="mt-6">
              <Button onClick={() => navigate("/admin/subscriptions")}>
                Back to Subscriptions
              </Button>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const { subscription, billingHistory, renewalOrders } = data;
  const hasPause = subscription.subscriptionStatus === "active";
  const hasResume =
    subscription.subscriptionStatus === "paused" ||
    subscription.subscriptionStatus === "past_due";
  const hasCancel =
    subscription.subscriptionStatus !== "cancelled" &&
    subscription.subscriptionStatus !== "expired";

  return (
    <AdminLayout>
      <div className="p-4 md:p-8 bg-bree-bg min-h-screen">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-bree-text-primary">
              Subscription Details
            </h1>
            <p className="text-bree-text-secondary mt-1">
              Manage a single subscription lifecycle and review renewal history.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => navigate(-1)}
              className="rounded-2xl bg-slate-100 text-slate-700 hover:bg-slate-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
            {hasPause && (
              <Button
                onClick={() => setConfirm({ open: true, action: "pause" })}
                className="rounded-2xl bg-amber-100 text-amber-700 hover:bg-amber-200"
              >
                <Pause className="w-4 h-4 mr-2" /> Pause
              </Button>
            )}
            {hasResume && (
              <Button
                onClick={() => setConfirm({ open: true, action: "resume" })}
                className="rounded-2xl bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
              >
                <Play className="w-4 h-4 mr-2" /> Resume
              </Button>
            )}
            {hasCancel && (
              <Button
                onClick={() => setConfirm({ open: true, action: "cancel" })}
                className="rounded-2xl bg-rose-100 text-rose-700 hover:bg-rose-200"
              >
                <Trash className="w-4 h-4 mr-2" /> Cancel
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-6">
          <div className="space-y-6">
            <div className="rounded-3xl bg-white border border-bree-border p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6 gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-bree-text-primary">
                    Subscription Summary
                  </h2>
                  <p className="text-sm text-bree-text-secondary mt-1">
                    Key subscription identifiers and billing cadence.
                  </p>
                </div>
                <StatusBadge status={subscription.subscriptionStatus} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  ["Subscription ID", subscription.id],
                  [
                    "Razorpay Subscription ID",
                    subscription.razorpaySubscriptionId,
                  ],
                  ["Razorpay Plan ID", subscription.razorpayPlanId],
                  ["Frequency", "Monthly"],
                  [
                    "Amount",
                    `₹${subscription.amount?.toLocaleString("en-IN")}`,
                  ],
                  ["Created", formatDateTime(subscription.startDate)],
                  ["Last Renewal", formatDateTime(subscription.lastRenewal)],
                  ["Next Billing", formatDate(subscription.nextBillingDate)],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="text-xs text-bree-text-secondary uppercase tracking-[0.18em] mb-2">
                      {label}
                    </p>
                    <p className="text-sm font-semibold text-bree-text-primary">
                      {value || "-"}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl bg-white border border-bree-border p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-bree-text-primary mb-4">
                Customer Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  ["Name", subscription.customerName],
                  ["Email", subscription.email],
                  ["Phone", subscription.phone],
                  ["Linked Order", subscription.razorpayOrderId || "-"],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="text-xs text-bree-text-secondary uppercase tracking-[0.18em] mb-2">
                      {label}
                    </p>
                    <p className="text-sm font-semibold text-bree-text-primary">
                      {value || "-"}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl bg-white border border-bree-border p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-bree-text-primary mb-4">
                Address Information
              </h3>
              <div className="space-y-3">
                <p className="text-sm text-bree-text-primary font-semibold">
                  {subscription.address.fullName || subscription.customerName}
                </p>
                {subscription.address.line1 && (
                  <p className="text-sm text-bree-text-secondary">
                    {subscription.address.line1}
                  </p>
                )}
                {subscription.address.line2 && (
                  <p className="text-sm text-bree-text-secondary">
                    {subscription.address.line2}
                  </p>
                )}
                <p className="text-sm text-bree-text-secondary">
                  {[
                    subscription.address.city,
                    subscription.address.state,
                    subscription.address.pincode,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </p>
                <p className="text-sm text-bree-text-secondary">
                  {subscription.address.country}
                </p>
                <p className="text-sm text-bree-text-secondary">
                  Phone: {subscription.address.phone || subscription.phone}
                </p>
                {subscription.address.raw && (
                  <p className="text-sm text-bree-text-secondary">
                    {subscription.address.raw}
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-3xl bg-white border border-bree-border p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-bree-text-primary mb-4">
                Product Information
              </h3>
              <div className="divide-y divide-bree-border/70 space-y-4">
                {subscription.productItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-4"
                  >
                    <div>
                      <p className="text-sm font-semibold text-bree-text-primary">
                        {item.product_name}
                      </p>
                      <p className="text-sm text-bree-text-secondary">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-bree-text-primary">
                        ₹
                        {Number(item.product_price || 0).toLocaleString(
                          "en-IN",
                        )}
                      </p>
                      <p className="text-sm text-bree-text-secondary">
                        Subtotal: ₹
                        {Number(item.subtotal || 0).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl bg-white border border-bree-border p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-bree-text-primary mb-4">
                Razorpay Information
              </h3>
              <div className="space-y-4">
                {[
                  [
                    "Razorpay Subscription ID",
                    subscription.razorpaySubscriptionId,
                  ],
                  ["Razorpay Plan ID", subscription.razorpayPlanId],
                  ["Subscription Status", subscription.subscriptionStatus],
                  ["Payment Status", subscription.paymentStatus],
                  ["Cancel Reason", subscription.cancelReason],
                  ["Cancelled By", subscription.cancelledBy],
                  [
                    "Cancelled At",
                    subscription.cancelledAt
                      ? formatDateTime(subscription.cancelledAt)
                      : "-",
                  ],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="text-xs text-bree-text-secondary uppercase tracking-[0.18em] mb-2">
                      {label}
                    </p>
                    <p className="text-sm font-semibold text-bree-text-primary">
                      {value || "-"}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl bg-white border border-bree-border p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-bree-text-primary mb-4">
                Billing History
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full text-left">
                  <thead className="bg-bree-bg/60">
                    <tr>
                      {[
                        "Payment Date",
                        "Amount",
                        "Order ID",
                        "Payment ID",
                        "Status",
                      ].map((heading) => (
                        <th
                          key={heading}
                          className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-bree-text-secondary"
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {billingHistory.length ? (
                      billingHistory.map((payment) => (
                        <tr
                          key={payment.id}
                          className="border-t border-bree-border hover:bg-bree-bg/50 transition-colors"
                        >
                          <td className="px-4 py-3 text-sm text-bree-text-secondary">
                            {formatDateTime(payment.updated_at)}
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold text-bree-text-primary">
                            ₹
                            {Number(payment.amount || 0).toLocaleString(
                              "en-IN",
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-bree-text-primary">
                            {payment.order_id}
                          </td>
                          <td className="px-4 py-3 text-sm text-bree-text-secondary">
                            {payment.razorpay_payment_id || "-"}
                          </td>
                          <td className="px-4 py-3 text-sm text-bree-text-secondary">
                            {payment.status}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-4 py-10 text-center text-sm text-bree-text-secondary"
                        >
                          No billing records found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-3xl bg-white border border-bree-border p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-bree-text-primary">
                  Renewal Orders
                </h3>
                <Button
                  size="sm"
                  className="rounded-2xl bg-slate-100 text-slate-700 hover:bg-slate-200"
                  onClick={() => navigate("/admin/orders")}
                >
                  View Orders
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-left">
                  <thead className="bg-bree-bg/60">
                    {[
                      "Order ID",
                      "Renewal Date",
                      "Amount",
                      "Order Status",
                      "Payment Status",
                    ].map((heading) => (
                      <th
                        key={heading}
                        className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-bree-text-secondary"
                      >
                        {heading}
                      </th>
                    ))}
                  </thead>
                  <tbody>
                    {renewalOrders.length ? (
                      renewalOrders.map((order) => (
                        <tr
                          key={order.id}
                          className="border-t border-bree-border hover:bg-bree-bg/50 transition-colors"
                        >
                          <td className="px-4 py-3 text-sm font-medium text-bree-text-primary">
                            {order.id}
                          </td>
                          <td className="px-4 py-3 text-sm text-bree-text-secondary">
                            {formatDateTime(order.created_at)}
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold text-bree-text-primary">
                            ₹{Number(order.total || 0).toLocaleString("en-IN")}
                          </td>
                          <td className="px-4 py-3 text-sm text-bree-text-secondary">
                            {order.order_status}
                          </td>
                          <td className="px-4 py-3 text-sm text-bree-text-secondary">
                            {order.payment_status}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-4 py-10 text-center text-sm text-bree-text-secondary"
                        >
                          No renewal orders found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {confirm.open && (
          <ConfirmModal
            open={confirm.open}
            action={confirm.action}
            onClose={() => setConfirm({ open: false, action: null })}
            onConfirm={() => handleAction(confirm.action)}
            reason={cancelReason}
            setReason={setCancelReason}
          />
        )}
      </AnimatePresence>
    </AdminLayout>
  );
};

export default AdminSubscriptionDetails;
