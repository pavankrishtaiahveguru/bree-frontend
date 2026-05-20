import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const RELATION_TYPES = [
  { value: "recommend", label: "Recommend" },
  { value: "upsell", label: "Upsell" },
  { value: "alternative", label: "Alternative" },
];

const ProductRelationsModal = ({
  open,
  onClose,
  product,
  products,
  relations = [],
  onSave,
  loading,
}) => {
  const [localRelations, setLocalRelations] = useState([]);

  useEffect(() => {
    if (open) {
      setLocalRelations(relations.map((relation) => ({
        ...relation,
        related_product_id: Number(relation.id) || Number(relation.related_product_id),
      })));
    }
  }, [open, relations]);

  const availableProducts = products.filter((item) => item.id !== product?.id);

  const handleAddRelation = () => {
    setLocalRelations((prev) => [
      ...prev,
      { related_product_id: "", relation_type: "recommend", weight: 0 },
    ]);
  };

  const handleUpdateRelation = (index, field, value) => {
    setLocalRelations((prev) =>
      prev.map((item, idx) =>
        idx === index
          ? {
              ...item,
              [field]: field === "related_product_id" ? Number(value) : field === "weight" ? Number(value) : value,
            }
          : item,
      ),
    );
  };

  const handleRemoveRelation = (index) => {
    setLocalRelations((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = () => {
    const validRelations = localRelations
      .filter((relation) => relation.related_product_id)
      .map((relation) => ({
        related_product_id: relation.related_product_id,
        relation_type: relation.relation_type,
        weight: Number(relation.weight || 0),
      }));

    onSave(validRelations);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-bree-border">
              <div className="flex items-center justify-between px-6 py-5 border-b border-bree-border">
                <div>
                  <h2 className="text-xl font-semibold text-bree-text-primary">
                    Manage Relations
                  </h2>
                  <p className="text-sm text-bree-text-secondary mt-1">
                    Connect {product?.name} with related products.
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-full hover:bg-bree-bg flex items-center justify-center"
                  aria-label="Close relations modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                {loading ? (
                  <div className="py-12 text-center text-bree-text-secondary">Loading relations…</div>
                ) : (
                  <>
                    <div className="flex flex-col gap-4">
                      {localRelations.length === 0 ? (
                        <div className="rounded-3xl border border-dashed border-bree-border bg-bree-bg p-8 text-center text-bree-text-secondary">
                          No relations configured yet.
                        </div>
                      ) : (
                        localRelations.map((relation, index) => (
                          <div
                            key={`${relation.related_product_id}-${index}`}
                            className="grid grid-cols-1 md:grid-cols-[1.3fr_1fr_0.9fr_0.4fr] gap-3 items-end rounded-3xl border border-bree-border p-4"
                          >
                            <label className="space-y-2 text-sm">
                              <span className="font-medium text-bree-text-primary">Related product</span>
                              <select
                                value={relation.related_product_id || ""}
                                onChange={(e) => handleUpdateRelation(index, "related_product_id", e.target.value)}
                                className="w-full h-12 rounded-2xl border border-bree-border px-3 outline-none focus:border-bree-primary"
                              >
                                <option value="">Select product</option>
                                {availableProducts.map((item) => (
                                  <option key={item.id} value={item.id}>
                                    {item.name}
                                  </option>
                                ))}
                              </select>
                            </label>

                            <label className="space-y-2 text-sm">
                              <span className="font-medium text-bree-text-primary">Relation type</span>
                              <select
                                value={relation.relation_type}
                                onChange={(e) => handleUpdateRelation(index, "relation_type", e.target.value)}
                                className="w-full h-12 rounded-2xl border border-bree-border px-3 outline-none focus:border-bree-primary"
                              >
                                {RELATION_TYPES.map((type) => (
                                  <option key={type.value} value={type.value}>
                                    {type.label}
                                  </option>
                                ))}
                              </select>
                            </label>

                            <label className="space-y-2 text-sm">
                              <span className="font-medium text-bree-text-primary">Weight</span>
                              <input
                                type="number"
                                value={relation.weight ?? 0}
                                onChange={(e) => handleUpdateRelation(index, "weight", e.target.value)}
                                className="w-full h-12 rounded-2xl border border-bree-border px-3 outline-none focus:border-bree-primary"
                                min={0}
                              />
                            </label>

                            <button
                              type="button"
                              onClick={() => handleRemoveRelation(index)}
                              className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center"
                              aria-label="Remove relation"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <Button
                        variant="outline"
                        onClick={handleAddRelation}
                        className="rounded-full"
                      >
                        <Plus className="w-4 h-4 mr-2" /> Add relation
                      </Button>

                      <div className="text-sm text-bree-text-secondary">
                        Relations help power recommendations and upsells.
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="px-6 py-5 border-t border-bree-border flex flex-col gap-3 sm:flex-row sm:justify-end">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="rounded-full"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="rounded-full bg-bree-primary hover:bg-bree-primary-hover text-white"
                >
                  Save Relations
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ProductRelationsModal;
