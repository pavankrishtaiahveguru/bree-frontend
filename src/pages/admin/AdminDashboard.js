import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ShoppingBag,
  Users,
  Clock,
  Package,
  TrendingUp,
  Briefcase,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import axios from "axios";
import useOrdersSync from "@/hooks/useOrdersSync";

const API = `${process.env.REACT_APP_BACKEND_URL || "http://localhost:4000"}/api/admin`;

// Animated counter hook
const useCounter = (end, duration = 1500, started = false) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!started || end === 0) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [end, duration, started]);
  return count;
};

const StatCard = ({
  icon: Icon,
  label,
  value,
  prefix = "",
  suffix = "",
  note,
  color,
  delay,
}) => {
  const [visible, setVisible] = useState(false);
  const ref = useRef();
  const count = useCounter(
    typeof value === "number" ? value : 0,
    1400,
    visible,
  );

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="bg-white rounded-2xl p-6 shadow-premium border border-bree-border hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between mb-4">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      <p className="text-bree-text-secondary text-sm mb-1">{label}</p>
      <p className="font-outfit text-3xl font-semibold text-bree-text-primary">
        {prefix}
        {typeof value === "number" ? count.toLocaleString() : value}
        {suffix}
      </p>
      {note && <p className="text-xs text-bree-text-secondary mt-3">{note}</p>}
    </motion.div>
  );
};

const OrderRow = ({ order, delay }) => {
  const statusColors = {
    delivered: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
    processing: "bg-blue-100 text-blue-700",
    cancelled: "bg-red-100 text-red-500",
  };
  return (
    <motion.tr
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="border-b border-bree-border last:border-0 hover:bg-bree-bg/50 transition-colors"
    >
      <td className="py-3 px-4 text-sm font-medium text-bree-primary">
        #{order.order_id || order.id}
      </td>
      <td className="py-3 px-4 text-sm text-bree-text-primary">
        {order.customer_name}
      </td>
      <td className="py-3 px-4 text-sm text-bree-text-secondary">
        {order.product_name || order.items?.[0]?.name || "Unknown product"}
      </td>
      <td className="py-3 px-4 text-sm font-medium text-bree-text-primary">
        ₹{Number(order.total ?? order.amount ?? 0).toLocaleString()}
      </td>
      <td className="py-3 px-4">
        <span
          className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${statusColors[order.order_status?.toLowerCase()] || "bg-gray-100 text-gray-600"}`}
        >
          {order.order_status || "Unknown"}
        </span>
      </td>
    </motion.tr>
  );
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, ordersRes] = await Promise.all([
          axios.get(`${API}/dashboard`, { withCredentials: true }),
          axios.get(`${API}/orders?limit=5`, { withCredentials: true }),
        ]);
        setStats(statsRes.data);
        setRecentOrders(ordersRes.data?.orders || []);
      } catch {
        setStats({
          total_orders: 0,
          total_revenue: 0,
          total_customers: 0,
          pending_orders: 0,
          total_bulk_bookings: 0,
        });
        setRecentOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // subscribe to order updates and refresh stats/recent orders
  useOrdersSync(async (order) => {
    try {
      const [statsRes, ordersRes] = await Promise.all([
        axios.get(`${API}/dashboard`, { withCredentials: true }),
        axios.get(`${API}/orders?limit=5`, { withCredentials: true }),
      ]);
      setStats(statsRes.data);
      setRecentOrders(ordersRes.data?.orders || []);
    } catch (e) {
      console.warn("Failed to refresh dashboard after order update", e);
    }
  });

  const STAT_CARDS = [
    {
      icon: ShoppingBag,
      label: "Total Orders",
      value: stats?.total_orders || 0,
      note: stats?.total_orders ? "Real-time" : "Awaiting data",
      color: "bg-bree-primary",
    },

    {
      icon: TrendingUp,
      label: "Total Revenue",
      value: stats?.total_revenue || 0,
      prefix: "₹",
      note: stats?.total_revenue ? "Real-time" : "Awaiting data",
      color: "bg-violet-500",
    },

    {
      icon: Users,
      label: "Total Customers",
      value: stats?.total_customers || 0,
      note: stats?.total_customers ? "Real-time" : "Awaiting data",
      color: "bg-sky-500",
    },

    {
      icon: Clock,
      label: "Pending Orders",
      value: stats?.pending_orders || 0,
      note: stats?.pending_orders ? "Real-time" : "Awaiting data",
      color: "bg-amber-500",
    },

    {
      icon: Briefcase,
      label: "Bulk Bookings",
      value: stats?.total_bulk_bookings || 0,
      note: stats?.total_bulk_bookings
        ? "Corporate inquiries"
        : "No inquiries yet",
      color: "bg-indigo-500",
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="font-outfit text-2xl font-semibold text-bree-text-primary">
            Dashboard
          </h1>
          <p className="text-bree-text-secondary text-sm mt-1">
            Welcome back, Admin. Here's what's happening.
          </p>
        </div>

        {/* Quick Actions removed */}

        {/* Stats */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-5">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 animate-pulse border border-bree-border"
              >
                <div className="w-12 h-12 bg-bree-bg rounded-xl mb-4" />
                <div className="h-3 bg-bree-bg rounded w-20 mb-3" />
                <div className="h-8 bg-bree-bg rounded w-28" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            {STAT_CARDS.map((card, i) => (
              <StatCard key={card.label} {...card} delay={i * 0.1} />
            ))}
          </div>
        )}

        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-premium border border-bree-border overflow-hidden"
        >
          <div className="px-6 py-5 border-b border-bree-border flex items-center justify-between">
            <div>
              <h2 className="font-outfit font-semibold text-bree-text-primary">
                Recent Orders
              </h2>
              <p className="text-bree-text-secondary text-xs mt-0.5">
                {recentOrders.length > 0
                  ? "Last 5 orders placed"
                  : "Orders from customers will appear here after purchases begin."}
              </p>
            </div>
            <Link
              to="/admin/orders"
              className="text-sm text-bree-primary font-medium hover:underline flex items-center gap-1"
            >
              View all <Package className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            {recentOrders.length === 0 ? (
              <div className="min-h-[260px] flex flex-col items-center justify-center rounded-3xl border border-dashed border-bree-border bg-white p-10 text-center">
                <div className="mb-5 w-16 h-16 rounded-full bg-bree-primary/10 text-bree-primary flex items-center justify-center">
                  <ShoppingBag className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-semibold text-bree-text-primary mb-2">
                  No orders yet
                </h3>
                <p className="max-w-sm text-sm text-bree-text-secondary">
                  Orders from customers will appear here after purchases begin.
                  Keep this dashboard open to monitor activity in real time.
                </p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-bree-bg/50">
                    {[
                      "Order ID",
                      "Customer",
                      "Product",
                      "Amount",
                      "Status",
                    ].map((h) => (
                      <th
                        key={h}
                        className="py-3 px-4 text-left text-xs font-semibold text-bree-text-secondary uppercase tracking-wide"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order, i) => (
                    <OrderRow
                      key={order.id || i}
                      order={order}
                      delay={0.5 + i * 0.05}
                    />
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </motion.div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
