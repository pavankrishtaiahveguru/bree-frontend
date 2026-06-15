import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  Repeat,
  PauseCircle,
  Trash2,
  TrendingUp,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { fetchAdminSubscriptionAnalytics } from "@/services/adminSubscriptionService";

const formatCurrency = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN")}`;

const AnalyticsCard = ({ icon: Icon, label, value, note, color }) => (
  <motion.div
    initial={{ opacity: 0, y: 18 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    className="rounded-3xl border border-bree-border bg-white p-6 shadow-sm"
  >
    <div className="flex items-center justify-between mb-4">
      <div
        className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color}`}
      >
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
    <p className="text-sm text-bree-text-secondary mb-2">{label}</p>
    <p className="text-3xl font-semibold text-bree-text-primary">{value}</p>
    {note && <p className="text-xs text-bree-text-secondary mt-3">{note}</p>}
  </motion.div>
);

const SubscriptionAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadAnalytics = async () => {
    setLoading(true);

    try {
      const payload = await fetchAdminSubscriptionAnalytics();
      setAnalytics(payload);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load subscription analytics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const maxRevenue =
    analytics?.monthlyTrend?.reduce(
      (max, item) => Math.max(max, item.revenue),
      0,
    ) || 1;

  return (
    <AdminLayout>
      <div className="p-4 md:p-8 bg-bree-bg min-h-screen">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-bree-text-primary">
              Subscription Analytics
            </h1>
            <p className="text-bree-text-secondary mt-1">
              Monitor recurring revenue, renewal performance, and subscription
              status trends.
            </p>
          </div>
          <Button
            onClick={loadAnalytics}
            className="rounded-2xl bg-bree-primary hover:bg-bree-primary-hover text-white"
          >
            Refresh
          </Button>
        </div>

        {loading || !analytics ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {[...Array(3)].map((_, index) => (
              <div
                key={index}
                className="h-40 rounded-3xl bg-white border border-bree-border animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-6">
            <AnalyticsCard
              icon={Repeat}
              label="Total Active Subscriptions"
              value={analytics.totalActiveSubscriptions}
              note="Currently billing subscriptions"
              color="bg-bree-primary"
            />
            <AnalyticsCard
              icon={PauseCircle}
              label="Paused Subscriptions"
              value={analytics.pausedSubscriptions}
              note="Subscriptions currently on hold"
              color="bg-amber-500"
            />
            <AnalyticsCard
              icon={Trash2}
              label="Cancelled Subscriptions"
              value={analytics.cancelledSubscriptions}
              note="Subscriptions stopped by admin or customer"
              color="bg-red-500"
            />
            <AnalyticsCard
              icon={TrendingUp}
              label="Monthly Recurring Revenue"
              value={formatCurrency(analytics.monthlyRecurringRevenue)}
              note="Active subscription revenue"
              color="bg-emerald-500"
            />
            <AnalyticsCard
              icon={BarChart3}
              label="Expected Next Month Revenue"
              value={formatCurrency(analytics.expectedNextMonthRevenue)}
              note="Forecast from active subscriptions"
              color="bg-sky-500"
            />
            <AnalyticsCard
              icon={BarChart3}
              label="Renewal Success Rate"
              value={`${analytics.renewalSuccessRate}%`}
              note="Based on last 30 days of subscription payments"
              color="bg-violet-500"
            />
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-6">
          <div className="rounded-3xl bg-white border border-bree-border p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-bree-text-primary mb-4">
              Subscription Status
            </h2>
            <div className="space-y-3">
              {(analytics?.statusBreakdown || []).map((statusItem) => (
                <div
                  key={statusItem.status}
                  className="flex items-center justify-between gap-4"
                >
                  <div>
                    <p className="text-sm font-semibold text-bree-text-primary capitalize">
                      {statusItem.status === "past_due"
                        ? "Payment Failed"
                        : statusItem.status}
                    </p>
                    <p className="text-xs text-bree-text-secondary">
                      {statusItem.count} subscriptions
                    </p>
                  </div>
                  <div className="text-sm font-semibold text-bree-text-primary">
                    {statusItem.count}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-white border border-bree-border p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-bree-text-primary">
                  Monthly Growth
                </h2>
                <p className="text-sm text-bree-text-secondary mt-1">
                  Subscription count and revenue for the last 6 months.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              {(analytics?.monthlyTrend || []).map((item) => (
                <div key={item.month} className="space-y-2">
                  <div className="flex items-center justify-between text-sm text-bree-text-secondary">
                    <span>{item.month}</span>
                    <span className="font-semibold text-bree-text-primary">
                      ₹{item.revenue.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="h-3 rounded-full bg-bree-bg overflow-hidden">
                    <div
                      className="h-full rounded-full bg-bree-primary"
                      style={{
                        width: `${Math.max((item.revenue / Math.max(maxRevenue, 1)) * 100, 5)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default SubscriptionAnalytics;
