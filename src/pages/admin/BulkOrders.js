import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Building2,
  Phone,
  Mail,
  MapPin,
  Package,
  Calendar,
  ClipboardList,
} from "lucide-react";

import AdminLayout from "@/components/admin/AdminLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const API = `${process.env.REACT_APP_BACKEND_URL || "http://localhost:4000"}/api/admin`;

const BulkOrders = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchBookings = async () => {
    try {
      const res = await axios.get(`${API}/bulk-bookings`, {
        withCredentials: true,
      });

      setBookings(res.data || []);
    } catch (error) {
      console.error("Failed to fetch bulk bookings", error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const search = searchQuery.toLowerCase();

      return (
        booking.company_name?.toLowerCase().includes(search) ||
        booking.contact_person?.toLowerCase().includes(search) ||
        booking.mobile_number?.includes(search)
      );
    });
  }, [bookings, searchQuery]);

  const totalBookings = bookings.length;

  const totalQuantity = bookings.reduce(
    (acc, item) => acc + Number(item.quantity || 0),
    0,
  );

  const handleSearch = () => {
    setSearchQuery(searchInput.trim());
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-8">
          <h2 className="text-xl font-semibold">Loading Bulk Bookings...</h2>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-4 md:p-8 bg-bree-bg min-h-screen">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-bree-text-primary">
              Bulk Bookings
            </h1>

            <p className="text-bree-text-secondary mt-1">
              Manage corporate and bulk booking enquiries
            </p>
          </div>

          <div className="flex items-center gap-2 w-full lg:w-96">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-bree-text-secondary" />

              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search company, contact person..."
                className="pl-11 h-11 rounded-2xl border-bree-border bg-white"
              />
            </div>

            <Button onClick={handleSearch} className="h-11 rounded-2xl px-4">
              Search
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-bree-border">
            <div className="w-12 h-12 rounded-2xl bg-bree-primary/10 flex items-center justify-center mb-4">
              <Building2 className="w-6 h-6 text-bree-primary" />
            </div>

            <p className="text-sm text-bree-text-secondary">Total Bookings</p>

            <h2 className="text-3xl font-bold mt-2 text-bree-text-primary">
              {totalBookings}
            </h2>
          </div>

          <div className="bg-white rounded-3xl p-5 shadow-sm border border-bree-border">
            <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center mb-4">
              <Package className="w-6 h-6 text-green-600" />
            </div>

            <p className="text-sm text-bree-text-secondary">Total Quantity</p>

            <h2 className="text-3xl font-bold mt-2 text-green-600">
              {totalQuantity}
            </h2>
          </div>
        </div>

        {/* Empty State */}
        {filteredBookings.length === 0 && (
          <div className="bg-white rounded-3xl border border-bree-border p-12 text-center">
            <ClipboardList className="w-12 h-12 mx-auto text-bree-primary mb-4" />

            <h3 className="text-xl font-semibold text-bree-text-primary">
              No Bulk Bookings Found
            </h3>

            <p className="text-bree-text-secondary mt-2">
              No booking enquiries available.
            </p>
          </div>
        )}

        {/* Booking Cards */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <AnimatePresence>
            {filteredBookings.map((booking, index) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.05,
                }}
                className="bg-white rounded-3xl border border-bree-border shadow-sm p-6"
              >
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-14 h-14 rounded-2xl bg-bree-primary/10 flex items-center justify-center">
                    <Building2 className="w-7 h-7 text-bree-primary" />
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-bree-text-primary">
                      {booking.company_name}
                    </h3>

                    <p className="text-bree-text-secondary">
                      {booking.contact_person}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3 text-bree-text-secondary">
                    <Mail className="w-4 h-4" />
                    {booking.email}
                  </div>

                  <div className="flex items-center gap-3 text-bree-text-secondary">
                    <Phone className="w-4 h-4" />
                    {booking.mobile_number}
                  </div>

                  <div className="flex items-center gap-3 text-bree-text-secondary">
                    <MapPin className="w-4 h-4" />
                    {booking.location || "N/A"}
                  </div>

                  <div className="flex items-center gap-3 text-bree-text-secondary">
                    <Package className="w-4 h-4" />
                    Quantity: {booking.quantity || 0}
                  </div>

                  <div className="flex items-center gap-3 text-bree-text-secondary">
                    <Calendar className="w-4 h-4" />
                    {new Date(booking.created_at).toLocaleDateString("en-IN")}
                  </div>
                </div>

                {booking.requirements && (
                  <div className="mt-5 pt-4 border-t border-bree-border">
                    <p className="text-sm font-medium text-bree-text-primary mb-2">
                      Requirements
                    </p>

                    <p className="text-sm text-bree-text-secondary">
                      {booking.requirements}
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </AdminLayout>
  );
};

export default BulkOrders;
