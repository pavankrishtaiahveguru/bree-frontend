import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  Copy,
  Check,
  CheckCircle2,
  Clock,
  XCircle,
  Truck,
  RefreshCw,
  Bell,
  ShieldCheck,
  Package,
  Sparkles,
  HeadphonesIcon,
  ChevronRight,
  CalendarDays,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSubscription } from "@/services/subscriptionService";
import { toast } from "sonner";

/* ─────────────────────────────── helpers ─────────────────────────── */

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const formatShortDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatAmount = (amount) => {
  if (!amount) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

/* ─────────────────────────── sub-components ──────────────────────── */

function StatusBadge({ status }) {
  const s = (status || "").toLowerCase();
  if (s === "active" || s === "created")
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest bg-emerald-50 text-emerald-700 border border-emerald-200">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        Active
      </span>
    );
  if (s === "paused" || s === "pending")
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest bg-amber-50 text-amber-700 border border-amber-200">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
        Paused
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest bg-red-50 text-red-600 border border-red-200">
      <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
      Cancelled
    </span>
  );
}

function CopyField({ label, value }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(value || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-bree-bg border border-bree-border px-5 py-4">
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-widest text-bree-text-secondary font-semibold mb-0.5">
          {label}
        </p>
        <p className="text-sm font-medium text-bree-text-primary break-all leading-snug">
          {value || "—"}
        </p>
      </div>
      <button
        onClick={copy}
        className="shrink-0 w-8 h-8 rounded-xl bg-white border border-bree-border flex items-center justify-center text-bree-text-secondary hover:text-bree-primary hover:border-bree-primary transition-colors"
        title="Copy"
      >
        {copied ? (
          <Check className="w-3.5 h-3.5" />
        ) : (
          <Copy className="w-3.5 h-3.5" />
        )}
      </button>
    </div>
  );
}

function HealthStat({ label, value, sub }) {
  return (
    <div className="rounded-2xl bg-bree-bg border border-bree-border p-5 flex flex-col gap-1">
      <p className="text-[11px] uppercase tracking-widest text-bree-text-secondary font-semibold">
        {label}
      </p>
      <p className="text-2xl font-bold text-bree-text-primary leading-none mt-1">
        {value}
      </p>
      {sub && <p className="text-xs text-bree-text-secondary mt-0.5">{sub}</p>}
    </div>
  );
}

function TimelineEntry({
  title,
  description,
  date,
  amount,
  status,
  isLast,
  isUpcoming,
}) {
  const iconMap = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
    failed: <XCircle className="w-4 h-4 text-red-500" />,
    pending: <Clock className="w-4 h-4 text-amber-500" />,
    upcoming: <CalendarDays className="w-4 h-4 text-bree-primary" />,
  };
  const icon = isUpcoming
    ? iconMap.upcoming
    : iconMap[status?.toLowerCase()] || iconMap.success;
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center border-2 shrink-0 ${isUpcoming ? "border-bree-primary bg-bree-primary/5" : "border-bree-border bg-white"}`}
        >
          {icon}
        </div>
        {!isLast && (
          <div className="w-px flex-1 bg-bree-border mt-1 min-h-[24px]" />
        )}
      </div>
      <div className={`pb-6 min-w-0 flex-1 ${isLast ? "" : ""}`}>
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div>
            <p
              className={`text-sm font-semibold ${isUpcoming ? "text-bree-primary" : "text-bree-text-primary"}`}
            >
              {title}
            </p>
            {description && (
              <p className="text-xs text-bree-text-secondary mt-0.5 leading-relaxed">
                {description}
              </p>
            )}
          </div>
          <div className="text-right shrink-0">
            {amount && (
              <p className="text-sm font-bold text-bree-text-primary">
                {formatAmount(amount)}
              </p>
            )}
            {date && (
              <p className="text-xs text-bree-text-secondary mt-0.5">
                {formatShortDate(date)}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function PaymentStatusChip({ status }) {
  const s = (status || "").toLowerCase();
  if (s === "paid" || s === "success" || s === "captured")
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <CheckCircle2 className="w-3 h-3" />
        Paid
      </span>
    );
  if (s === "pending")
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
        <Clock className="w-3 h-3" />
        Pending
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-200">
      <XCircle className="w-3 h-3" />
      Failed
    </span>
  );
}

/* ──────────────────────────── main page ──────────────────────────── */

const SubscriptionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const data = await getSubscription(id);
        if (!data) {
          toast.error("Subscription not found.");
          navigate("/subscriptions", { replace: true });
          return;
        }
        setSubscription(data);
      } catch (error) {
        toast.error(error.message || "Failed to load subscription details.");
        navigate("/subscriptions", { replace: true });
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [id, navigate]);

  const productItem = useMemo(
    () => subscription?.items?.[0] || {},
    [subscription],
  );

  const historyItems = useMemo(() => {
    if (Array.isArray(subscription?.billingHistory))
      return subscription.billingHistory;
    if (Array.isArray(subscription?.events)) return subscription.events;
    return [];
  }, [subscription]);

  /* derived state */
  const rawStatus = (subscription?.subscription_status || "").toLowerCase();
  const isActive = rawStatus === "active" || rawStatus === "created";
  const isPaused = rawStatus === "paused" || rawStatus === "pending";
  const isCancelled = !isActive && !isPaused;

  const totalRenewals = historyItems.filter(
    (e) =>
      (e.event || e.title || "").toLowerCase().includes("renew") ||
      (e.status || "").toLowerCase() === "paid",
  ).length;

  const subscriptionAge = useMemo(() => {
    const created =
      historyItems[0]?.date ||
      historyItems[0]?.created_at ||
      historyItems[0]?.timestamp;
    if (!created) return "—";
    const days = Math.floor(
      (Date.now() - new Date(created).getTime()) / 86400000,
    );
    if (days < 1) return "Today";
    if (days === 1) return "1 day";
    if (days < 30) return `${days} days`;
    const months = Math.floor(days / 30);
    return months === 1 ? "1 month" : `${months} months`;
  }, [historyItems]);

  /* ── loading ── */
  if (isLoading) {
    return (
      <div className="pt-24 min-h-screen bg-bree-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-bree-primary" />
          <p className="text-sm text-bree-text-secondary font-medium">
            Loading your subscription…
          </p>
        </div>
      </div>
    );
  }

  if (!subscription) return null;

  /* ── page ── */
  return (
    <div className="pt-24 min-h-screen bg-bree-bg pb-20">
      <Helmet>
        <title>Subscription Dashboard — BREE Wellness</title>
      </Helmet>

      <div className="max-w-6xl mx-auto px-4 md:px-8 lg:px-12">
        {/* ── top nav ── */}
        <div className="mb-8 flex items-center justify-between">
          <Button
            type="button"
            onClick={() => navigate("/subscriptions")}
            variant="outline"
            className="rounded-full px-4 py-2.5 text-sm font-medium border-bree-border hover:border-bree-primary hover:text-bree-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <StatusBadge status={subscription.subscription_status} />
        </div>

        {/* ── dashboard header ── */}
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.25em] text-bree-primary font-bold mb-2">
            Subscription Dashboard
          </p>
          <h1 className="font-outfit text-3xl md:text-4xl text-bree-text-primary font-light leading-tight">
            {productItem.name || "Your Wellness Plan"}
          </h1>
          <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-bree-text-secondary">
            <span className="flex items-center gap-1.5">
              <CalendarDays className="w-4 h-4 text-bree-primary" />
              Next renewal:{" "}
              <strong className="text-bree-text-primary ml-1">
                {formatDate(subscription.next_billing_date)}
              </strong>
            </span>
            <span className="text-bree-border">·</span>
            <span className="flex items-center gap-1.5">
              <RefreshCw className="w-4 h-4 text-bree-primary" />
              Every {subscription.frequency || 30} days
            </span>
          </div>
        </div>

        {/* ── main grid ── */}
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          {/* ════ LEFT COLUMN ════ */}
          <div className="space-y-6 min-w-0">
            {/* Hero subscription card */}
            <section className="rounded-[28px] overflow-hidden shadow-md border border-bree-border">
              {/* gradient banner */}
              <div className="bg-gradient-to-br from-bree-primary/90 to-bree-primary p-6 pb-8 relative overflow-hidden">
                <div
                  className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 80% 20%, white 0%, transparent 60%)",
                  }}
                />
                <div className="flex items-center gap-5 relative z-10">
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 overflow-hidden flex items-center justify-center shrink-0">
                    <img
                      src={productItem.image || "/images/default-product.png"}
                      alt={productItem.name || "Product"}
                      className="h-full w-full object-contain p-1"
                      onError={(e) => {
                        e.currentTarget.src = "/images/default-product.png";
                      }}
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-white/70 text-xs uppercase tracking-widest font-semibold mb-1">
                      Wellness Subscription
                    </p>
                    <h2 className="text-white text-xl md:text-2xl font-semibold leading-snug">
                      {productItem.name || "BREE Wellness Plan"}
                    </h2>
                    <p className="text-white/80 text-sm mt-1">
                      {productItem.variant ||
                        `${subscription.frequency || 30}-Day Plan`}
                    </p>
                  </div>
                </div>

                {/* price + status row */}
                <div className="flex items-center justify-between mt-5 relative z-10 flex-wrap gap-3">
                  <div>
                    <p className="text-white/60 text-xs uppercase tracking-widest">
                      Subscription Price
                    </p>
                    <p className="text-white text-2xl font-bold mt-0.5">
                      {productItem.price
                        ? formatAmount(productItem.price)
                        : formatAmount(subscription.amount)}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider border ${
                      isActive
                        ? "bg-emerald-400/20 text-white border-emerald-300/40"
                        : isPaused
                          ? "bg-amber-400/20 text-white border-amber-300/40"
                          : "bg-red-400/20 text-white border-red-300/40"
                    }`}
                  >
                    {subscription.subscription_status || "Active"}
                  </span>
                </div>
              </div>

              {/* benefits strip */}
              <div className="bg-white px-6 py-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  {
                    icon: <Truck className="w-4 h-4" />,
                    label: "Free Shipping",
                  },
                  {
                    icon: <RefreshCw className="w-4 h-4" />,
                    label: "Auto Renewal",
                  },
                  {
                    icon: <Bell className="w-4 h-4" />,
                    label: "Email Reminders",
                  },
                  {
                    icon: <ShieldCheck className="w-4 h-4" />,
                    label: "Cancel Anytime",
                  },
                ].map(({ icon, label }) => (
                  <div
                    key={label}
                    className="flex items-center gap-2 text-xs font-medium text-bree-text-secondary"
                  >
                    <span className="text-bree-primary">{icon}</span>
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Subscription Health */}
            <section className="rounded-[28px] bg-white border border-bree-border p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <Zap className="w-4 h-4 text-bree-primary" />
                <h2 className="text-base font-bold text-bree-text-primary uppercase tracking-wide">
                  Subscription Health
                </h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <HealthStat
                  label="Status"
                  value={
                    isActive ? "Active" : isPaused ? "Paused" : "Cancelled"
                  }
                  sub={
                    isActive
                      ? "In good standing"
                      : isPaused
                        ? "On hold"
                        : "No longer active"
                  }
                />
                <HealthStat
                  label="Total Renewals"
                  value={totalRenewals || historyItems.length || "0"}
                  sub="Completed cycles"
                />
                <HealthStat
                  label="Subscription Age"
                  value={subscriptionAge}
                  sub="Since you started"
                />
                <HealthStat
                  label="Renewal Rate"
                  value={totalRenewals > 0 ? "100%" : "—"}
                  sub="Success rate"
                />
              </div>
            </section>

            {/* Next Renewal Card */}
            {!isCancelled && (
              <section className="rounded-[28px] bg-white border border-bree-border p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <CalendarDays className="w-4 h-4 text-bree-primary" />
                  <h2 className="text-base font-bold text-bree-text-primary uppercase tracking-wide">
                    Next Renewal
                  </h2>
                </div>
                <div className="rounded-2xl bg-gradient-to-br from-bree-primary/5 to-bree-primary/10 border border-bree-primary/20 p-5">
                  <p className="text-xs text-bree-text-secondary mb-3 leading-relaxed">
                    Your next automatic renewal is scheduled for
                  </p>
                  <div className="flex items-end justify-between flex-wrap gap-4">
                    <div>
                      <p className="text-3xl font-bold text-bree-text-primary leading-none">
                        {formatDate(subscription.next_billing_date)}
                      </p>
                      <p className="text-sm text-bree-text-secondary mt-1.5">
                        Every {subscription.frequency || 30} days ·{" "}
                        {isPaused ? "Renewal paused" : "Auto-renews"}
                      </p>
                    </div>
                    {(productItem.price || subscription.amount) && (
                      <div className="text-right">
                        <p className="text-xs text-bree-text-secondary uppercase tracking-wide font-semibold mb-1">
                          Amount
                        </p>
                        <p className="text-2xl font-bold text-bree-primary">
                          {formatAmount(
                            productItem.price || subscription.amount,
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* Subscription Info IDs */}
            <section className="rounded-[28px] bg-white border border-bree-border p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <Package className="w-4 h-4 text-bree-primary" />
                <h2 className="text-base font-bold text-bree-text-primary uppercase tracking-wide">
                  Subscription Information
                </h2>
              </div>
              <div className="space-y-3">
                <CopyField
                  label="Subscription ID"
                  value={
                    subscription.razorpay_subscription_id || subscription.id
                  }
                />
                <CopyField label="Order ID" value={subscription.order_id} />
                {subscription.plan_id && (
                  <CopyField label="Plan ID" value={subscription.plan_id} />
                )}
                {subscription.razorpay_subscription_id && (
                  <CopyField
                    label="Razorpay Subscription ID"
                    value={subscription.razorpay_subscription_id}
                  />
                )}
              </div>
            </section>

            {/* Renewal Timeline */}
            <section className="rounded-[28px] bg-white border border-bree-border p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <RefreshCw className="w-4 h-4 text-bree-primary" />
                <h2 className="text-base font-bold text-bree-text-primary uppercase tracking-wide">
                  Renewal Timeline
                </h2>
              </div>

              {historyItems.length > 0 ? (
                <div>
                  {historyItems.map((entry, index) => (
                    <TimelineEntry
                      key={index}
                      title={
                        entry.title ||
                        entry.event ||
                        (index === 0
                          ? "Subscription Created"
                          : `Renewal #${index}`)
                      }
                      description={entry.description || entry.note}
                      date={entry.date || entry.created_at || entry.timestamp}
                      amount={entry.amount}
                      status={entry.status || "success"}
                      isLast={index === historyItems.length - 1 && isCancelled}
                    />
                  ))}
                  {!isCancelled && (
                    <TimelineEntry
                      title="Upcoming Renewal"
                      description="Next automatic billing cycle"
                      date={subscription.next_billing_date}
                      amount={productItem.price || subscription.amount}
                      isLast={true}
                      isUpcoming={true}
                    />
                  )}
                </div>
              ) : (
                <div className="rounded-2xl bg-gradient-to-br from-bree-primary/5 to-bree-bg border border-bree-border p-8 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-bree-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-6 h-6 text-bree-primary" />
                  </div>
                  <p className="font-semibold text-bree-text-primary text-lg mb-2">
                    Subscription Active
                  </p>
                  <p className="text-sm text-bree-text-secondary leading-relaxed max-w-xs mx-auto">
                    Your first renewal hasn't occurred yet. Renewal history will
                    appear here after your next billing cycle.
                  </p>
                </div>
              )}
            </section>

            {/* Payment History */}
            {historyItems.some((e) => e.amount || e.status) && (
              <section className="rounded-[28px] bg-white border border-bree-border p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-5">
                  <ShieldCheck className="w-4 h-4 text-bree-primary" />
                  <h2 className="text-base font-bold text-bree-text-primary uppercase tracking-wide">
                    Payment History
                  </h2>
                </div>
                <div className="overflow-x-auto -mx-1">
                  <table className="w-full text-sm min-w-[420px]">
                    <thead>
                      <tr className="border-b border-bree-border">
                        <th className="text-left pb-3 text-[11px] uppercase tracking-widest text-bree-text-secondary font-semibold px-1">
                          Date
                        </th>
                        <th className="text-left pb-3 text-[11px] uppercase tracking-widest text-bree-text-secondary font-semibold px-1">
                          Description
                        </th>
                        <th className="text-right pb-3 text-[11px] uppercase tracking-widest text-bree-text-secondary font-semibold px-1">
                          Amount
                        </th>
                        <th className="text-right pb-3 text-[11px] uppercase tracking-widest text-bree-text-secondary font-semibold px-1">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-bree-border">
                      {historyItems.map((entry, index) => (
                        <tr
                          key={index}
                          className="hover:bg-bree-bg/50 transition-colors"
                        >
                          <td className="py-3.5 px-1 text-bree-text-secondary whitespace-nowrap">
                            {formatShortDate(
                              entry.date || entry.created_at || entry.timestamp,
                            )}
                          </td>
                          <td className="py-3.5 px-1 text-bree-text-primary font-medium">
                            {entry.title ||
                              entry.event ||
                              `Renewal #${index + 1}`}
                          </td>
                          <td className="py-3.5 px-1 text-right font-bold text-bree-text-primary whitespace-nowrap">
                            {entry.amount ? formatAmount(entry.amount) : "—"}
                          </td>
                          <td className="py-3.5 px-1 text-right">
                            <PaymentStatusChip
                              status={entry.status || "success"}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </div>

          {/* ════ RIGHT SIDEBAR ════ */}
          <aside className="space-y-5 lg:sticky lg:top-28 lg:self-start">
            {/* Subscription Overview */}
            <section className="rounded-[28px] bg-white border border-bree-border p-6 shadow-sm">
              <h2 className="text-base font-bold text-bree-text-primary uppercase tracking-wide mb-5">
                Overview
              </h2>
              <div className="space-y-3 text-sm">
                {[
                  {
                    label: "Status",
                    value: subscription.subscription_status || "Active",
                    highlight: isActive,
                  },
                  {
                    label: "Frequency",
                    value: `Every ${subscription.frequency || 30} days`,
                  },
                  {
                    label: "Next Billing",
                    value: formatDate(subscription.next_billing_date),
                  },
                  {
                    label: "Plan",
                    value: `${subscription.frequency || 30}-Day Plan`,
                  },
                ].map(({ label, value, highlight }) => (
                  <div
                    key={label}
                    className="flex justify-between items-center gap-2 py-2 border-b border-bree-border/50 last:border-0"
                  >
                    <span className="text-bree-text-secondary">{label}</span>
                    <span
                      className={`font-semibold ${highlight ? "text-emerald-600" : "text-bree-text-primary"} text-right`}
                    >
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* Benefits */}
            <section className="rounded-[28px] bg-white border border-bree-border p-6 shadow-sm">
              <h2 className="text-base font-bold text-bree-text-primary uppercase tracking-wide mb-4">
                Your Benefits
              </h2>
              <ul className="space-y-3">
                {[
                  "Free Delivery on every order",
                  "Priority Processing",
                  "Auto Renewal — never miss a cycle",
                  "Subscription pricing savings",
                  "Cancel anytime, no questions",
                ].map((b) => (
                  <li
                    key={b}
                    className="flex items-start gap-3 text-sm text-bree-text-secondary"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Manage Subscription */}
            {!isCancelled && (
              <section className="rounded-[28px] bg-white border border-bree-border p-6 shadow-sm">
                <h2 className="text-base font-bold text-bree-text-primary uppercase tracking-wide mb-1">
                  Manage Subscription
                </h2>
                <p className="text-xs text-bree-text-secondary mb-5">
                  Changes take effect on your next renewal.
                </p>
                <div className="space-y-3">
                  {isActive && (
                    <Button
                      variant="outline"
                      className="w-full rounded-2xl border-amber-300 text-amber-700 hover:bg-amber-50 font-medium"
                    >
                      <Clock className="w-4 h-4 mr-2" />
                      Pause Subscription
                    </Button>
                  )}
                  {isPaused && (
                    <Button className="w-full rounded-2xl bg-bree-primary text-white hover:bg-bree-primary/90 font-medium">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Resume Subscription
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    className="w-full rounded-2xl border-red-200 text-red-600 hover:bg-red-50 font-medium"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Cancel Subscription
                  </Button>
                </div>
              </section>
            )}

            {isCancelled && (
              <section className="rounded-[28px] bg-bree-bg border border-bree-border p-6">
                <p className="text-sm font-semibold text-bree-text-primary mb-1">
                  Subscription Ended
                </p>
                <p className="text-xs text-bree-text-secondary leading-relaxed">
                  This subscription has been cancelled. No further renewals will
                  occur.
                </p>
              </section>
            )}

            {/* Support */}
            <section className="rounded-[28px] border border-bree-primary/20 bg-bree-primary/5 p-6">
              <div className="flex items-center gap-2 mb-3">
                <HeadphonesIcon className="w-4 h-4 text-bree-primary" />
                <h2 className="text-base font-bold text-bree-text-primary">
                  Need Help?
                </h2>
              </div>
              <p className="text-xs text-bree-text-secondary leading-relaxed mb-4">
                Manage renewals, billing issues, address updates and
                subscription changes from your account or contact support.
              </p>
              <button className="w-full flex items-center justify-between rounded-2xl bg-white border border-bree-border px-4 py-3 text-sm font-medium text-bree-text-primary hover:border-bree-primary hover:text-bree-primary transition-colors">
                Contact Support
                <ChevronRight className="w-4 h-4" />
              </button>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionDetails;
