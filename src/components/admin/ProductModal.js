import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const EMPTY_FORM = {
  name: "",
  category: "",
  price: "",
  mrp: "",
  image: "",
  description: "",
  quantity: "",
  stockQty: "",
  features: "",
  popular: false,
  status: "In Stock",
};

const validate = (form, imageFile, isEdit) => {
  const errors = {};

  if (!form.name.trim()) errors.name = "Product name is required";
  if (!form.category.trim()) errors.category = "Category is required";
  if (!form.mrp) errors.mrp = "MRP is required";
  if (!form.price) errors.price = "Selling price is required";
  if (!form.quantity) errors.quantity = "Quantity required";
  if (!form.description.trim()) errors.description = "Description required";
  if (!isEdit && !form.image && !imageFile) {
    errors.image = "Product image is required";
  }

  return errors;
};

const ProductModal = ({ open, onClose, onSave, initial = null }) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [preview, setPreview] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [uploadError, setUploadError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileRef = useRef();
  const isEdit = !!initial;

  useEffect(() => {
    if (open) {
      if (initial) {
        setForm({
          ...EMPTY_FORM,
          ...initial,
          stockQty: initial.stock_qty ?? initial.stockQty ?? "",
          features: initial.features?.join(", ") || "",
        });

        setPreview(initial.image || "");
      } else {
        setForm(EMPTY_FORM);
        setPreview("");
      }

      setImageFile(null);
      setUploadError("");
      setErrors({});
    }
  }, [open, initial]);

  const set = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setUploadError("Only JPEG, PNG, and WebP images are allowed.");
      return;
    }

    const maxFileSize = 5 * 1024 * 1024;
    if (file.size > maxFileSize) {
      setUploadError("Image must be 5 MB or smaller.");
      return;
    }

    setUploadError("");
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    const errs = validate(form, imageFile, isEdit);

    if (Object.keys(errs).length || uploadError) {
      setErrors(errs);
      if (uploadError) {
        setErrors((prev) => ({ ...prev, image: uploadError }));
      }
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        ...form,
        price: Number(form.price),
        mrp: Number(form.mrp),
        quantity: Number(form.quantity),
        stockQty: Number(form.stockQty || 0),
        features: form.features.split(",").map((item) => item.trim()),
        imageFile,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.96,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              scale: 0.96,
            }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className=" bg-white rounded-xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto border border-bree-border custom-scrollbar ">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-bree-border">
                <div>
                  <h2 className="text-xl font-semibold text-bree-text-primary">
                    {isEdit ? "Edit Product" : "Add New Product"}
                  </h2>

                  <p className="text-sm text-bree-text-secondary mt-1">
                    Fill product information
                  </p>
                </div>

                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-full hover:bg-bree-bg flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-5">
                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-bree-text-primary">
                    Product Image
                  </label>

                  <div
                    onClick={() => fileRef.current.click()}
                    className="border-2 border-dashed border-bree-border rounded-2xl p-5 flex items-center gap-4 cursor-pointer hover:border-bree-primary transition"
                  >
                    <div className="w-20 h-20 rounded-2xl bg-bree-bg flex items-center justify-center overflow-hidden">
                      {preview ? (
                        <img
                          src={preview}
                          alt="preview"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <Upload className="w-8 h-8 text-bree-primary" />
                      )}
                    </div>

                    <div>
                      <p className="font-medium text-bree-text-primary">
                        Upload Product Image
                      </p>

                      <p className="text-sm text-bree-text-secondary mt-1">
                        PNG, JPG supported
                      </p>
                    </div>

                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      className="hidden"
                      onChange={handleFile}
                    />
                  </div>
                  {errors.image && (
                    <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.image}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-bree-text-primary">
                    Product Name
                  </label>

                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    placeholder="Enter product name"
                    className="w-full h-12 px-4 rounded-2xl border border-bree-border outline-none focus:border-bree-primary"
                  />

                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />

                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-bree-text-primary">
                    Product Category
                  </label>

                  <input
                    type="text"
                    value={form.category}
                    onChange={(e) => set("category", e.target.value)}
                    placeholder="Enter category"
                    className="w-full h-12 px-4 rounded-2xl border border-bree-border outline-none focus:border-bree-primary"
                  />
                </div>

                {/* MRP + Selling */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-bree-text-primary">
                      MRP Price
                    </label>

                    <input
                      type="number"
                      value={form.mrp}
                      onChange={(e) => set("mrp", e.target.value)}
                      placeholder="1299"
                      className="w-full h-12 px-4 rounded-2xl border border-bree-border outline-none focus:border-bree-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-bree-text-primary">
                      Selling Price
                    </label>

                    <input
                      type="number"
                      value={form.price}
                      onChange={(e) => set("price", e.target.value)}
                      placeholder="999"
                      className="w-full h-12 px-4 rounded-2xl border border-bree-border outline-none focus:border-bree-primary"
                    />
                  </div>
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-bree-text-primary">
                    Quantity (Days)
                  </label>

                  <input
                    type="number"
                    value={form.quantity}
                    onChange={(e) => set("quantity", e.target.value)}
                    placeholder="30"
                    className="w-full h-12 px-4 rounded-2xl border border-bree-border outline-none focus:border-bree-primary"
                  />
                </div>

                {/* Stock Quantity */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-bree-text-primary">
                    Stock quantity
                  </label>

                  <input
                    type="number"
                    value={form.stockQty}
                    onChange={(e) => set("stockQty", e.target.value)}
                    placeholder="10"
                    className="w-full h-12 px-4 rounded-2xl border border-bree-border outline-none focus:border-bree-primary"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-bree-text-primary">
                    Availability
                  </label>

                  <select
                    value={form.status}
                    onChange={(e) => set("status", e.target.value)}
                    className="w-full h-12 px-4 rounded-2xl border border-bree-border outline-none focus:border-bree-primary bg-white"
                  >
                    <option value="In Stock">In Stock</option>
                    <option value="Out Of Stock">Out Of Stock</option>
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-bree-text-primary">
                    Description
                  </label>

                  <textarea
                    rows={4}
                    value={form.description}
                    onChange={(e) => set("description", e.target.value)}
                    placeholder="Write product description..."
                    className="w-full p-4 rounded-2xl border border-bree-border outline-none resize-none focus:border-bree-primary"
                  />
                </div>

                {/* Features */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-bree-text-primary">
                    Features
                  </label>

                  <textarea
                    rows={3}
                    value={form.features}
                    onChange={(e) => set("features", e.target.value)}
                    placeholder="30 x 50ml bottles, Save ₹471, Best value"
                    className="w-full p-4 rounded-2xl border border-bree-border outline-none resize-none focus:border-bree-primary"
                  />
                </div>

                {/* Popular */}
                <div className="flex items-center justify-between border border-bree-border rounded-2xl px-4 py-3">
                  <div>
                    <p className="font-medium text-bree-text-primary">
                      Most Popular Product
                    </p>

                    <p className="text-sm text-bree-text-secondary">
                      Highlight this product
                    </p>
                  </div>

                  <input
                    type="checkbox"
                    checked={form.popular}
                    onChange={(e) => set("popular", e.target.checked)}
                    className="w-5 h-5 accent-bree-primary"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-5 border-t border-bree-border flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="rounded-full"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>

                <Button
                  onClick={handleSubmit}
                  className="rounded-full bg-bree-primary hover:bg-bree-primary-hover text-white px-6"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? isEdit
                      ? "Saving..."
                      : "Adding..."
                    : isEdit
                      ? "Save Changes"
                      : "Add Product"}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ProductModal;
