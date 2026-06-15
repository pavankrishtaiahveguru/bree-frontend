import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import {
  PauseCircle,
  PlayCircle,
  Trash2,
  Loader2,
  CheckCircle2,
  Clock,
  XCircle,
  Truck,
  RefreshCw,
  Bell,
  ShieldCheck,
  ChevronRight,
  CalendarDays,
  Sparkles,
  HeadphonesIcon,
  LayoutGrid,
  TrendingUp,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getSubscriptions,
  pauseSubscription,
  resumeSubscription,
  cancelSubscription,
} from "@/services/subscriptionService";
import { toast } from "sonner";

/* ─────────────────────── helpers ─────────────────────── */

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
  if (!amount) return null;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

const statusStyles = {
  active: "bg-bree-success/10 text-bree-success border border-bree-success/20",
  paused: "bg-orange-100 text-orange-600 border border-orange-200",
  cancelled: "bg-red-100 text-red-600 border border-red-200",
  pending: "bg-bree-primary/10 text-bree-primary border border-bree-primary/20",
};

/* ─────────────────── sub-components ──────────────────── */

function StatusBadge({ status }) {
  const s = (status || "").toLowerCase();
  if (s === "active" || s === "created")
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        Active
      </span>
    );
  if (s === "paused" || s === "pending")
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
        Paused
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider bg-red-50 text-red-600 border border-red-200">
      <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
      Cancelled
    </span>
  );
}

function SummaryCard({ icon, label, value, sub, accent }) {
  return (
    <div
      className={`rounded-[22px] bg-white border p-5 shadow-sm flex flex-col gap-2 ${accent ? "border-bree-primary/25" : "border-bree-border"}`}
    >
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center ${accent ? "bg-bree-primary/10 text-bree-primary" : "bg-bree-bg text-bree-text-secondary"}`}
      >
        {icon}
      </div>
      <div>
        <p className="text-[11px] uppercase tracking-widest text-bree-text-secondary font-semibold">
          {label}
        </p>
        <p className="text-2xl font-bold text-bree-text-primary leading-none mt-1">
          {value}
        </p>
        {sub && (
          <p className="text-xs text-bree-text-secondary mt-0.5">{sub}</p>
        )}
      </div>
    </div>
  );
}

function BenefitRow({ label }) {
  return (
    <li className="flex items-center gap-2 text-sm text-bree-text-secondary">
      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
      {label}
    </li>
  );
}

/* ──────────────────── subscription card ──────────────── */

function SubscriptionCard({
  subscription,
  actionLoadingId,
  onAction,
  onNavigate,
}) {
  const subId = subscription.razorpay_subscription_id || subscription.order_id;
  const isLoading = actionLoadingId === subId;
  const rawStatus = (subscription.subscription_status || "").toLowerCase();
  const isActive = rawStatus === "active" || rawStatus === "created";
  const isPaused = rawStatus === "paused" || rawStatus === "pending";
  const isCancelled = !isActive && !isPaused;
  const product = subscription.items?.[0] || {};

  return (
    <div className="rounded-[28px] bg-white border border-bree-border shadow-sm overflow-hidden flex flex-col">
      {/* card hero gradient top */}
      <div className="bg-gradient-to-br from-bree-primary/80 to-bree-primary px-6 py-5 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 85% 15%, white 0%, transparent 55%)",
          }}
        />
        <div className="flex items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 overflow-hidden flex items-center justify-center shrink-0">
              <img
                src={product.image || "/images/default-product.png"}
                alt={product.name || "Product"}
                className="h-full w-full object-contain p-0.5"
                onError={(e) => {
                  e.currentTarget.src = "/images/default-product.png";
                }}
              />
            </div>
            <div className="min-w-0">
              <p className="text-white/65 text-[10px] uppercase tracking-widest font-semibold">
                Subscription
              </p>
              <h2 className="text-white text-base font-semibold leading-snug mt-0.5 line-clamp-2">
                {product.name || "Wellness Plan"}
              </h2>
            </div>
          </div>
          {/* status chip in white overlay style */}
          <span
            className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border ${
              isActive
                ? "bg-emerald-400/25 text-white border-emerald-300/40"
                : isPaused
                  ? "bg-amber-400/25 text-white border-amber-300/40"
                  : "bg-red-400/20 text-white border-red-300/30"
            }`}
          >
            {subscription.statusLabel}
          </span>
        </div>
      </div>

      {/* card body */}
      <div className="flex-1 flex flex-col p-5 gap-4">
        {/* key stats row */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Frequency", value: subscription.frequencyLabel },
            {
              label: "Next Renewal",
              value: formatShortDate(subscription.next_billing_date),
            },
            {
              label: "Amount",
              value: product.price
                ? formatAmount(product.price)
                : subscription.amount
                  ? formatAmount(subscription.amount)
                  : "—",
            },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="rounded-2xl bg-bree-bg border border-bree-border p-3"
            >
              <p className="text-[10px] uppercase tracking-widest text-bree-text-secondary font-semibold leading-none">
                {label}
              </p>
              <p className="text-sm font-bold text-bree-text-primary mt-1.5 leading-snug">
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* next renewal highlight */}
        {!isCancelled && subscription.next_billing_date && (
          <div className="rounded-2xl bg-bree-primary/5 border border-bree-primary/15 px-4 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-bree-primary">
              <CalendarDays className="w-4 h-4 shrink-0" />
              <span className="text-xs font-semibold">Next Renewal</span>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-bree-text-primary">
                {formatDate(subscription.next_billing_date)}
              </p>
              <p className="text-[10px] text-bree-text-secondary mt-0.5">
                Auto Renewal Enabled
              </p>
            </div>
          </div>
        )}

        {/* subscription id */}
        <div className="rounded-2xl bg-bree-bg border border-bree-border px-4 py-2.5">
          <p className="text-[10px] uppercase tracking-widest text-bree-text-secondary font-semibold">
            Subscription ID
          </p>
          <p className="text-xs font-medium text-bree-text-primary mt-0.5 break-all">
            {subscription.razorpay_subscription_id || "—"}
          </p>
        </div>

        {/* benefits mini strip */}
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
          {[
            "Free Shipping",
            "Auto Renewal",
            "Email Reminders",
            "Cancel Anytime",
          ].map((b) => (
            <div
              key={b}
              className="flex items-center gap-1.5 text-[11px] text-bree-text-secondary font-medium"
            >
              <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
              {b}
            </div>
          ))}
        </div>

        {/* actions */}
        <div className="flex flex-wrap gap-2 pt-1 mt-auto">
          {isActive && (
            <Button
              type="button"
              onClick={() => onAction(subId, "pause")}
              disabled={isLoading}
              variant="outline"
              className="rounded-full px-4 py-2.5 text-sm border-amber-300 text-amber-700 hover:bg-amber-50 font-medium"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <PauseCircle className="w-4 h-4 mr-1.5" />
                  Pause
                </>
              )}
            </Button>
          )}
          {isPaused && (
            <Button
              type="button"
              onClick={() => onAction(subId, "resume")}
              disabled={isLoading}
              className="rounded-full px-4 py-2.5 text-sm bg-bree-primary hover:bg-bree-primary-hover text-white font-medium"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <PlayCircle className="w-4 h-4 mr-1.5" />
                  Resume
                </>
              )}
            </Button>
          )}
          {!isCancelled && (
            <Button
              type="button"
              onClick={() => onAction(subId, "cancel")}
              disabled={isLoading}
              variant="outline"
              className="rounded-full px-4 py-2.5 text-sm border-red-200 text-red-600 hover:bg-red-50 font-medium"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-1.5" />
                  Cancel
                </>
              )}
            </Button>
          )}
          <Button
            type="button"
            onClick={() =>
              onNavigate(
                subscription.order_id || subscription.razorpay_subscription_id,
              )
            }
            variant="outline"
            className="rounded-full px-4 py-2.5 text-sm border-bree-border font-medium ml-auto"
          >
            View Details <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────── main page ──────────────────── */

const MySubscriptions = () => {
  const navigate = useNavigate();
  const [subscriptions, setSubscriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getSubscriptions();
        setSubscriptions(data || []);
      } catch (error) {
        toast.error(error.message || "Unable to load subscriptions.");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const updateSubscriptionInList = (id, updater) => {
    setSubscriptions((current) =>
      current.map((subscription) =>
        subscription.order_id === id ||
        subscription.razorpay_subscription_id === id
          ? updater(subscription)
          : subscription,
      ),
    );
  };

  const handleSubscriptionAction = async (subscriptionId, action) => {
    setActionLoadingId(subscriptionId);
    try {
      const response =
        action === "pause"
          ? await pauseSubscription(subscriptionId)
          : action === "resume"
            ? await resumeSubscription(subscriptionId)
            : await cancelSubscription(subscriptionId);

      const status = response.subscription_status || response.status || action;
      updateSubscriptionInList(subscriptionId, (item) => ({
        ...item,
        subscription_status: status,
      }));
      toast.success(`Subscription ${action} requested successfully.`);
    } catch (error) {
      toast.error(error.message || `Unable to ${action} subscription.`);
    } finally {
      setActionLoadingId(null);
    }
  };

  const normalizedSubscriptions = useMemo(() => {
    return subscriptions.map((subscription) => ({
      ...subscription,
      statusLabel:
        subscription.subscription_status === "paused"
          ? "Paused"
          : subscription.subscription_status === "cancelled"
            ? "Cancelled"
            : "Active",
      frequencyLabel: subscription.frequency
        ? `Every ${subscription.frequency} days`
        : "Every 30 Days",
    }));
  }, [subscriptions]);

  /* summary stats */
  const activePlans = normalizedSubscriptions.filter(
    (s) =>
      (s.subscription_status || "").toLowerCase() === "active" ||
      (s.subscription_status || "").toLowerCase() === "created",
  ).length;

  const upcomingRenewals = normalizedSubscriptions.filter(
    (s) =>
      s.next_billing_date &&
      !["cancelled"].includes((s.subscription_status || "").toLowerCase()),
  ).length;

  return (
    <div className="pt-24 min-h-screen bg-bree-bg pb-20">
      <Helmet>
        <title>My Subscriptions — BREE Wellness</title>
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
        {/* ── page header ── */}
        <div className="mb-8 flex flex-col gap-4 md:items-end md:justify-between md:flex-row">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-bree-primary font-bold mb-2">
              BREE Wellness
            </p>
            <h1 className="font-outfit text-3xl md:text-4xl text-bree-text-primary font-light leading-tight">
              My Wellness Memberships
            </h1>
            <p className="text-sm text-bree-text-secondary mt-2">
              Manage your active wellness plans, renewals, and deliveries.
            </p>
          </div>
          <Button
            onClick={() => navigate("/shop")}
            className="bg-bree-primary hover:bg-bree-primary-hover text-white py-3 px-6 rounded-full shrink-0 font-medium"
          >
            Browse Plans
          </Button>
        </div>

        {/* ── summary stat cards ── */}
        {!isLoading && normalizedSubscriptions.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <SummaryCard
              icon={<LayoutGrid className="w-4 h-4" />}
              label="Active Plans"
              value={activePlans}
              sub="Currently running"
              accent
            />
            <SummaryCard
              icon={<CalendarDays className="w-4 h-4" />}
              label="Upcoming Renewals"
              value={upcomingRenewals}
              sub="Next billing cycles"
            />
            <SummaryCard
              icon={<Sparkles className="w-4 h-4" />}
              label="Membership"
              value="Active"
              sub="BREE Wellness Club"
            />
            <SummaryCard
              icon={<TrendingUp className="w-4 h-4" />}
              label="Estimated Savings"
              value={activePlans > 0 ? `${activePlans * 10}%` : "—"}
              sub="vs one-time pricing"
            />
          </div>
        )}

        {/* ── main layout ── */}
        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          {/* ════ subscriptions list ════ */}
          <div>
            {isLoading ? (
              <div className="grid gap-5 sm:grid-cols-2">
                {[1, 2].map((item) => (
                  <div
                    key={item}
                    className="animate-pulse rounded-[28px] bg-white border border-bree-border h-80"
                  />
                ))}
              </div>
            ) : normalizedSubscriptions.length === 0 ? (
              /* ── empty state ── */
              <div className="rounded-[28px] bg-white border border-bree-border p-12 text-center shadow-sm">
                <div className="w-16 h-16 rounded-2xl bg-bree-primary/10 flex items-center justify-center mx-auto mb-5">
                  <Package className="w-8 h-8 text-bree-primary" />
                </div>
                <h2 className="text-2xl font-semibold text-bree-text-primary mb-2">
                  No Wellness Memberships Yet
                </h2>
                <p className="text-bree-text-secondary text-sm mb-6">
                  Start a subscription today and enjoy:
                </p>
                <ul className="inline-flex flex-col items-start gap-2 mb-8 text-sm text-bree-text-secondary">
                  {[
                    "Free Shipping on every order",
                    "Automatic Renewals — never run out",
                    "Exclusive Subscription Pricing",
                  ].map((b) => (
                    <li key={b} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      {b}
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={() => navigate("/shop")}
                  className="bg-bree-primary hover:bg-bree-primary-hover text-white px-8 py-4 rounded-full font-medium"
                >
                  Browse Subscription Plans
                </Button>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2">
                {normalizedSubscriptions.map((subscription) => (
                  <SubscriptionCard
                    key={
                      subscription.order_id ||
                      subscription.razorpay_subscription_id
                    }
                    subscription={subscription}
                    actionLoadingId={actionLoadingId}
                    onAction={handleSubscriptionAction}
                    onNavigate={(id) => navigate(`/subscriptions/${id}`)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* ════ sidebar ════ */}
          <aside className="space-y-5 lg:sticky lg:top-28 lg:self-start">
            {/* Membership Benefits */}
            <section className="rounded-[28px] bg-white border border-bree-border p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck className="w-4 h-4 text-bree-primary" />
                <h2 className="text-base font-bold text-bree-text-primary uppercase tracking-wide">
                  Membership Benefits
                </h2>
              </div>
              <ul className="space-y-3">
                <BenefitRow label="Free Shipping on all subscription orders" />
                <BenefitRow label="Auto Renewal — never miss a cycle" />
                <BenefitRow label="Priority Subscription Support" />
                <BenefitRow label="Flexible Cancellation anytime" />
                <BenefitRow label="Email Reminders before billing" />
              </ul>
            </section>

            {/* quick overview if subscriptions exist */}
            {!isLoading && normalizedSubscriptions.length > 0 && (
              <section className="rounded-[28px] bg-white border border-bree-border p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <RefreshCw className="w-4 h-4 text-bree-primary" />
                  <h2 className="text-base font-bold text-bree-text-primary uppercase tracking-wide">
                    Renewal Summary
                  </h2>
                </div>
                <div className="space-y-3">
                  {normalizedSubscriptions
                    .filter(
                      (s) =>
                        s.next_billing_date &&
                        (s.subscription_status || "").toLowerCase() !==
                          "cancelled",
                    )
                    .slice(0, 3)
                    .map((s) => (
                      <div
                        key={s.order_id}
                        className="rounded-2xl bg-bree-bg border border-bree-border p-3 flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-bree-text-primary truncate">
                            {s.items?.[0]?.name || "Wellness Plan"}
                          </p>
                          <p className="text-[11px] text-bree-text-secondary mt-0.5">
                            {formatShortDate(s.next_billing_date)}
                          </p>
                        </div>
                        <StatusBadge status={s.subscription_status} />
                      </div>
                    ))}
                </div>
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
                Manage billing, renewals, delivery schedules, and subscription
                preferences anytime from your account.
              </p>
              <button
                onClick={() =>
                  window.open(
                    "https://wa.me/918885315072?text=Hi%20BREE%20Support,%20I%20need%20help%20with%20my%20subscription.",
                    "_blank",
                  )
                }
                className="w-full flex items-center justify-between rounded-2xl bg-white border border-bree-border px-4 py-3 text-sm font-medium text-bree-text-primary hover:border-bree-primary hover:text-bree-primary transition-colors"
              >
                WhatsApp Support
                <ChevronRight className="w-4 h-4" />
              </button>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default MySubscriptions;
