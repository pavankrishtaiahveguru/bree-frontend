import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";

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
    <section className="bg-[#F8FAF4] pt-32 pb-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <div className="mb-20 text-center">
          <span className="inline-flex items-center rounded-full border border-[#DCE6D4] bg-white px-5 py-2 text-sm font-medium text-[#7FA35C]">
            BULK & CORPORATE BOOKINGS
          </span>

          <h1 className="mt-6 text-5xl md:text-6xl font-light text-[#2D3A2E] leading-tight">
            Healthy Refreshments
            <br />
            <span className="font-semibold">For Teams & Celebrations</span>
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-lg text-[#667085]">
            At BREE, we bring fresh, healthy and naturally crafted detox drinks
            to workplaces, corporate events, wellness programs, conferences,
            exhibitions and special occasions.
          </p>
        </div>

        {/* Stats */}
        <div className="mb-20 grid gap-6 md:grid-cols-3">
          <div className="rounded-3xl bg-white border border-[#E7ECE3] p-8 text-center shadow-sm">
            <h3 className="text-4xl font-bold text-[#7FA35C]">200+</h3>
            <p className="mt-2 text-[#667085]">Minimum Order Quantity</p>
          </div>

          <div className="rounded-3xl bg-white border border-[#E7ECE3] p-8 text-center shadow-sm">
            <h3 className="text-4xl font-bold text-[#7FA35C]">100%</h3>
            <p className="mt-2 text-[#667085]">Custom Branding Available</p>
          </div>

          <div className="rounded-3xl bg-white border border-[#E7ECE3] p-8 text-center shadow-sm">
            <h3 className="text-4xl font-bold text-[#7FA35C]">PAN India</h3>
            <p className="mt-2 text-[#667085]">Corporate & Event Support</p>
          </div>
        </div>

        {/* Services */}
        <div className="mb-20 grid gap-8 md:grid-cols-3">
          <div className="rounded-3xl bg-white border border-[#E7ECE3] p-8 shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
            <h3 className="mb-4 text-2xl font-semibold text-[#2D3A2E]">
              Corporate Orders
            </h3>

            <ul className="space-y-3 text-[#667085]">
              <li>✓ Employee wellness programs</li>
              <li>✓ Office pantry supplies</li>
              <li>✓ Team meetings and conferences</li>
              <li>✓ Client events and corporate gifting</li>
            </ul>
          </div>

          <div className="rounded-3xl bg-white border border-[#E7ECE3] p-8 shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
            <h3 className="mb-4 text-2xl font-semibold text-[#2D3A2E]">
              Event Bookings
            </h3>

            <ul className="space-y-3 text-[#667085]">
              <li>✓ Exhibitions & Trade Shows</li>
              <li>✓ Product Launches</li>
              <li>✓ Workshops & Seminars</li>
              <li>✓ Weddings & Celebrations</li>
              <li>✓ Fitness & Wellness Events</li>
            </ul>
          </div>

          <div className="rounded-3xl bg-white border border-[#E7ECE3] p-8 shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
            <h3 className="mb-4 text-2xl font-semibold text-[#2D3A2E]">
              Subscription Plans
            </h3>

            <ul className="space-y-3 text-[#667085]">
              <li>✓ Offices</li>
              <li>✓ Co-working Spaces</li>
              <li>✓ Gyms & Fitness Centers</li>
              <li>✓ Wellness Clinics</li>
            </ul>
          </div>
        </div>

        {/* Branding & MOQ */}
        <div className="mb-20 grid gap-8 lg:grid-cols-2">
          <div className="rounded-3xl border border-[#DCE6D4] bg-[#F2F7EC] p-8">
            <h3 className="mb-5 text-3xl font-semibold text-[#2D3A2E]">
              Custom Branding Available
            </h3>

            <ul className="space-y-4 text-[#667085]">
              <li>✓ Customized bottle labels</li>
              <li>✓ Corporate logo branding</li>
              <li>✓ Personalized event messages</li>
              <li>✓ Special packaging for gifting</li>
            </ul>
          </div>

          <div className="rounded-3xl border border-[#DCE6D4] bg-white p-8">
            <h3 className="mb-5 text-3xl font-semibold text-[#2D3A2E]">
              Minimum Order Quantity
            </h3>

            <ul className="space-y-4 text-[#667085]">
              <li>✓ Bulk orders start from 200 bottles</li>
              <li>✓ Special pricing available for larger quantities</li>
              <li>✓ Advance booking recommended</li>
            </ul>
          </div>
        </div>

        {/* Form */}
        <div className="rounded-[32px] border border-[#E7ECE3] bg-white p-8 shadow-sm md:p-12">
          <div className="mb-10 text-center">
            <h2 className="text-4xl font-light text-[#2D3A2E]">
              Request a <span className="font-semibold">Quote</span>
            </h2>

            <p className="mt-3 text-[#667085]">
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
              required
              className="w-full rounded-2xl border border-[#DCE6D4] bg-[#FAFCF8] px-5 py-4 outline-none focus:border-[#7FA35C]"
            />

            <input
              type="text"
              name="contactPerson"
              value={formData.contactPerson}
              onChange={handleChange}
              placeholder="Contact Person *"
              required
              className="w-full rounded-2xl border border-[#DCE6D4] bg-[#FAFCF8] px-5 py-4 outline-none focus:border-[#7FA35C]"
            />

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email Address *"
              required
              className="w-full rounded-2xl border border-[#DCE6D4] bg-[#FAFCF8] px-5 py-4 outline-none focus:border-[#7FA35C]"
            />

            <input
              type="tel"
              name="mobileNumber"
              value={formData.mobileNumber}
              onChange={handleChange}
              placeholder="Mobile Number *"
              required
              className="w-full rounded-2xl border border-[#DCE6D4] bg-[#FAFCF8] px-5 py-4 outline-none focus:border-[#7FA35C]"
            />

            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Location"
              className="w-full rounded-2xl border border-[#DCE6D4] bg-[#FAFCF8] px-5 py-4 outline-none focus:border-[#7FA35C]"
            />

            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              placeholder="Estimated Quantity"
              className="w-full rounded-2xl border border-[#DCE6D4] bg-[#FAFCF8] px-5 py-4 outline-none focus:border-[#7FA35C]"
            />

            <textarea
              rows="5"
              name="requirements"
              value={formData.requirements}
              onChange={handleChange}
              placeholder="Additional Requirements"
              className="md:col-span-2 rounded-2xl border border-[#DCE6D4] bg-[#FAFCF8] p-5 outline-none focus:border-[#7FA35C]"
            />

            <button
              type="submit"
              disabled={loading}
              className="md:col-span-2 rounded-full bg-[#7FA35C] px-8 py-4 font-medium text-white transition-all hover:bg-[#6E9250] hover:scale-[1.01] disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Request a Quote"}
            </button>
          </form>
        </div>

        {/* CTA */}
        <div className="mt-24 rounded-[40px] bg-gradient-to-r from-[#203520] to-[#2D4A2D] px-8 py-16 text-center text-white">
          <h3 className="text-4xl md:text-5xl font-light">
            Hydrate. Refresh. <span className="font-semibold">Thrive.</span>
          </h3>

          <p className="mt-4 text-lg text-white/80">
            Healthy Refreshments for Teams, Events & Corporate Gatherings.
          </p>
        </div>
      </div>
    </section>
  );
}
