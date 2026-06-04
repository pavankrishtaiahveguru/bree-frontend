import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";

import AdminLayout from "@/components/admin/AdminLayout";

export default function BulkBookings() {
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    companyName: "",
    contactPerson: "",
    email: "",
    mobileNumber: "",
    location: "",
    quantity: "",
    requirements: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.companyName ||
      !formData.contactPerson ||
      !formData.email ||
      !formData.mobileNumber
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);

      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

      const response = await axios.post(
        `${API_URL}/api/bulk-bookings`,
        formData,
      );

      toast.success(
        response.data.message || "Quote request submitted successfully",
      );

      setFormData({
        companyName: "",
        contactPerson: "",
        email: "",
        mobileNumber: "",
        location: "",
        quantity: "",
        requirements: "",
      });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to submit request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Hero */}
          <div className="mb-16 text-center">
            <span className="mb-4 inline-block rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">
              Bulk & Corporate Bookings
            </span>

            <h1 className="mb-6 text-4xl font-bold text-gray-900 md:text-5xl">
              Refreshing Wellness for Teams, Events & Celebrations
            </h1>

            <p className="mx-auto max-w-3xl text-lg text-gray-600">
              At BREE, we bring fresh, healthy, and naturally crafted detox
              drinks to workplaces, corporate events, wellness programs,
              conferences, exhibitions, and special occasions.
            </p>
          </div>

          {/* Services */}
          <div className="mb-16 grid gap-8 md:grid-cols-3">
            <div className="rounded-2xl border border-gray-200 p-8 shadow-sm">
              <h3 className="mb-4 text-2xl font-bold text-gray-900">
                Corporate Orders
              </h3>
              <ul className="space-y-3 text-gray-600">
                <li>• Employee wellness programs</li>
                <li>• Office pantry supplies</li>
                <li>• Team meetings and conferences</li>
                <li>• Client events and corporate gifting</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-gray-200 p-8 shadow-sm">
              <h3 className="mb-4 text-2xl font-bold text-gray-900">
                Event Bookings
              </h3>
              <ul className="space-y-3 text-gray-600">
                <li>• Exhibitions & trade shows</li>
                <li>• Product launches</li>
                <li>• Workshops & seminars</li>
                <li>• Weddings & private celebrations</li>
                <li>• Fitness and wellness events</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-gray-200 p-8 shadow-sm">
              <h3 className="mb-4 text-2xl font-bold text-gray-900">
                Subscription Plans
              </h3>
              <ul className="space-y-3 text-gray-600">
                <li>• Offices</li>
                <li>• Co-working spaces</li>
                <li>• Gyms & fitness centers</li>
                <li>• Wellness clinics</li>
              </ul>
            </div>
          </div>

          {/* Branding + MOQ */}
          <div className="mb-16 grid gap-8 lg:grid-cols-2">
            <div className="rounded-3xl bg-green-50 p-8">
              <h3 className="mb-5 text-3xl font-bold text-gray-900">
                Custom Branding Available
              </h3>

              <ul className="space-y-4 text-gray-700">
                <li>✓ Customized bottle labels</li>
                <li>✓ Corporate logo branding</li>
                <li>✓ Personalized event messages</li>
                <li>✓ Special packaging for gifting</li>
              </ul>
            </div>

            <div className="rounded-3xl bg-orange-50 p-8">
              <h3 className="mb-5 text-3xl font-bold text-gray-900">
                Minimum Order Quantity
              </h3>

              <ul className="space-y-4 text-gray-700">
                <li>✓ Bulk orders start from 200 bottles</li>
                <li>✓ Special pricing for larger quantities</li>
                <li>✓ Advance booking recommended</li>
              </ul>
            </div>
          </div>

          {/* Quote Form */}
          <div className="rounded-3xl border border-gray-200 bg-gray-50 p-8 md:p-12">
            <div className="mb-8 text-center">
              <h2 className="mb-4 text-4xl font-bold text-gray-900">
                Request a Quote
              </h2>

              <p className="text-gray-600">
                Our team will get back to you with a customized quotation.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-2">
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                placeholder="Company / Organization Name *"
                className="rounded-xl border border-gray-300 p-4 outline-none focus:border-green-500"
                required
              />

              <input
                type="text"
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleChange}
                placeholder="Contact Person *"
                className="rounded-xl border border-gray-300 p-4 outline-none focus:border-green-500"
                required
              />

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email Address *"
                className="rounded-xl border border-gray-300 p-4 outline-none focus:border-green-500"
                required
              />

              <input
                type="tel"
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleChange}
                placeholder="Mobile Number *"
                className="rounded-xl border border-gray-300 p-4 outline-none focus:border-green-500"
                required
              />

              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Location"
                className="rounded-xl border border-gray-300 p-4 outline-none focus:border-green-500"
              />

              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                placeholder="Estimated Quantity"
                className="rounded-xl border border-gray-300 p-4 outline-none focus:border-green-500"
              />

              <textarea
                rows="5"
                name="requirements"
                value={formData.requirements}
                onChange={handleChange}
                placeholder="Additional Requirements"
                className="md:col-span-2 rounded-xl border border-gray-300 p-4 outline-none focus:border-green-500"
              />

              <button
                type="submit"
                disabled={loading}
                className="md:col-span-2 rounded-xl bg-green-600 px-8 py-4 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Submitting..." : "Request a Quote"}
              </button>
            </form>
          </div>

          {/* Footer CTA */}
          <div className="mt-16 text-center">
            <h3 className="mb-3 text-3xl font-bold text-gray-900">
              Hydrate. Refresh. Thrive with BREE.
            </h3>

            <p className="text-lg text-gray-600">
              Healthy Refreshments for Teams, Events & Corporate Gatherings.
            </p>
          </div>
        </div>
      </section>
    </AdminLayout>
  );
}
