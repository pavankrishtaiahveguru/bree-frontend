import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Send, Loader2, CheckCircle, X } from "lucide-react";
import axios from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const StarRating = ({ value, onChange }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        onClick={() => onChange(star)}
        className="transition-transform duration-200 hover:scale-110"
      >
        <Star
          className={`w-7 h-7 transition-colors duration-200 ${
            star <= value
              ? "fill-yellow-400 text-yellow-400"
              : "text-gray-300 hover:text-yellow-300"
          }`}
        />
      </button>
    ))}
  </div>
);

const TestimonialForm = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    role: "",
    text: "",
    rating: 0,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.rating) {
      toast.error("Please select a rating");
      return;
    }

    if (!form.name.trim()) {
      toast.error("Please enter your name");
      return;
    }

    if (!form.text.trim()) {
      toast.error("Please write your experience");
      return;
    }

    if (form.text.trim().length < 20) {
      toast.error("Write at least 20 characters");
      return;
    }

    setLoading(true);

    try {
      await axios.post('/api/testimonials', form);
      window.dispatchEvent(new Event('testimonial:submitted'));
      setSubmitted(true);
      setForm({ name: '', role: '', text: '', rating: 0 });
      toast.success('Review submitted successfully');
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to submit. Please try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Trigger Button
  if (!isOpen)
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mt-12"
      >
        <p className="text-bree-text-secondary mb-4 text-lg">
          Tried BREE? Share your experience with the community.
        </p>

        <Button
          onClick={() => setIsOpen(true)}
          variant="outline"
          className="border-bree-primary text-bree-primary hover:bg-bree-primary hover:text-white rounded-full px-8 py-5 font-medium transition-all duration-300"
        >
          <Star className="w-4 h-4 mr-2" />
          Write a Review
        </Button>
      </motion.div>
    );

  // Success Screen
  if (submitted)
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mt-12 max-w-lg mx-auto bg-white rounded-3xl p-8 border border-bree-border text-center shadow-sm"
      >
        <div className="w-16 h-16 bg-bree-accent/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-bree-primary" />
        </div>

        <h3 className="font-outfit text-xl font-semibold text-bree-text-primary mb-2">
          Thank you!
        </h3>

        <p className="text-bree-text-secondary text-sm">
          Your review has been submitted and will appear after a quick review by
          our team.
        </p>
      </motion.div>
    );

  // Form
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-12 max-w-lg mx-auto bg-white rounded-3xl p-8 border border-bree-border shadow-sm"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-outfit text-xl font-semibold text-bree-text-primary">
            Share Your Experience
          </h3>

          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-full hover:bg-bree-bg text-bree-text-secondary transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Rating */}
          <div className="space-y-2">
            <Label className="text-bree-text-secondary text-sm">
              Your Rating *
            </Label>

            <StarRating
              value={form.rating}
              onChange={(v) =>
                setForm((prev) => ({
                  ...prev,
                  rating: v,
                }))
              }
            />
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label className="text-bree-text-secondary text-sm">
              Your Name *
            </Label>

            <Input
              value={form.name}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
              placeholder="User Name or Nickname"
              className="rounded-xl border-bree-border"
            />
          </div>

          {/* Role */}
          <div className="space-y-2">
            <Label className="text-bree-text-secondary text-sm">
              Occupation <span className="text-xs">(optional)</span>
            </Label>

            <Input
              value={form.role}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  role: e.target.value,
                }))
              }
              placeholder="e.g. Yoga Instructor, Student..."
              className="rounded-xl border-bree-border"
            />
          </div>

          {/* Review */}
          <div className="space-y-2">
            <Label className="text-bree-text-secondary text-sm">
              Your Review * ({form.text.length}/300 characters)
            </Label>

            <Textarea
              value={form.text}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  text: e.target.value.slice(0, 300),
                }))
              }
              placeholder="Tell others about your experience with BREE..."
              rows={4}
              className="rounded-xl border-bree-border resize-none"
            />
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-bree-primary hover:bg-bree-primary-hover text-white py-5 rounded-full font-medium transition-all duration-300"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Send className="w-4 h-4" />
                Submit Review
              </span>
            )}
          </Button>

          <p className="text-xs text-bree-text-secondary text-center">
            Reviews are published after a quick moderation check.
          </p>
        </form>
      </motion.div>
    </AnimatePresence>
  );
};

export default TestimonialForm;
