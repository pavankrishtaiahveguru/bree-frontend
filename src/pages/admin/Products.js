import { useEffect, useState, useMemo, useCallback } from "react";

import AdminLayout from "@/components/admin/AdminLayout";

import ProductModal from "@/components/admin/ProductModal";
import ProductRelationsModal from "@/components/admin/ProductRelationsModal";

import { Search, X, Plus, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import axios from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api";
import { toast } from "sonner";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [relationsOpen, setRelationsOpen] = useState(false);
  const [relationTarget, setRelationTarget] = useState(null);
  const [relations, setRelations] = useState([]);
  const [relationsLoading, setRelationsLoading] = useState(false);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = searchQuery.toLowerCase();
    return products.filter((item) =>
      item.name.toLowerCase().includes(normalizedQuery),
    );
  }, [products, searchQuery]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/admin/products?limit=100");
      setProducts(response.data.products || []);
    } catch (error) {
      console.error("Failed to load products", error);
      toast.error(getApiErrorMessage(error));
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = useCallback(() => {
    setSearchQuery(searchInput.trim());
  }, [searchInput]);

  const clearSearch = useCallback(() => {
    setSearchInput("");
    setSearchQuery("");
  }, []);

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAdd = () => {
    setEditing(null);
    setOpen(true);
  };

  const handleEdit = (product) => {
    setEditing(product);
    setOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/admin/products/${id}`);
      setProducts((prev) => prev.filter((item) => item.id !== id));
      toast.success("Product deleted");
    } catch (error) {
      console.error("Failed to delete product", error);
      toast.error(getApiErrorMessage(error));
    }
  };

  const handleSave = async (data) => {
    setLoading(true);
    try {
      const buildFormData = () => {
        const formData = new FormData();
        if (data.imageFile) {
          formData.append("image", data.imageFile);
        }
        formData.append("name", data.name);
        formData.append("category", data.category);
        formData.append("description", data.description);
        formData.append("price", data.price.toString());
        formData.append("mrp", data.mrp.toString());
        formData.append("quantity", data.quantity.toString());
        formData.append("stockQty", data.stockQty.toString());
        formData.append("popular", data.popular ? "true" : "false");
        formData.append("status", data.status);
        formData.append(
          "features",
          Array.isArray(data.features)
            ? data.features.join(", ")
            : data.features || "",
        );
        return formData;
      };

      const shouldUseMultipart = !!data.imageFile;
      const payload = shouldUseMultipart
        ? buildFormData()
        : {
            ...data,
            features: Array.isArray(data.features)
              ? data.features
              : data.features || [],
          };

      if (editing) {
        const response = shouldUseMultipart
          ? await axios.put(`/api/admin/products/${editing.id}`, payload)
          : await axios.put(`/api/admin/products/${editing.id}`, payload);
        setProducts((prev) =>
          prev.map((item) => (item.id === editing.id ? response.data : item)),
        );
        toast.success("Product updated");
      } else {
        const response = shouldUseMultipart
          ? await axios.post("/api/admin/products", payload)
          : await axios.post("/api/admin/products", payload);
        setProducts((prev) => [response.data, ...prev]);
        toast.success("Product added");
      }
    } catch (error) {
      console.error("Failed to save product", error);
      toast.error(getApiErrorMessage(error));
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleManageRelations = async (product) => {
    setRelationTarget(product);
    setRelationsLoading(true);
    setRelationsOpen(true);

    try {
      const response = await axios.get(
        `/api/admin/products/${product.id}/relations`,
      );
      setRelations(response.data || []);
    } catch (error) {
      console.error("Failed to load relations", error);
      toast.error(getApiErrorMessage(error));
      setRelations([]);
    } finally {
      setRelationsLoading(false);
    }
  };

  const handleSaveRelations = async (updatedRelations) => {
    if (!relationTarget) return;
    try {
      await axios.post(`/api/admin/products/${relationTarget.id}/relations`, {
        relations: updatedRelations,
      });
      toast.success("Product relations updated");
      setRelations(updatedRelations);
      setRelationsOpen(false);
    } catch (error) {
      console.error("Failed to save relations", error);
      toast.error(getApiErrorMessage(error));
    }
  };

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-bree-text-primary">
            Products
          </h1>

          <p className="text-bree-text-secondary mt-1">
            Manage your wellness products
          </p>
        </div>

        <Button
          onClick={handleAdd}
          className="bg-bree-primary hover:bg-bree-primary-hover text-white rounded-full px-6"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Search */}
      <div className="bg-white border border-bree-border rounded-3xl p-5 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-bree-text-secondary" />

            <input
              type="text"
              placeholder="Search products..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSearch();
                }
              }}
              className="w-full h-12 pl-11 pr-12 rounded-2xl border border-bree-border outline-none focus:border-bree-primary"
            />

            {searchInput && (
              <button
                onClick={clearSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-bree-text-secondary hover:text-bree-primary"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <Button onClick={handleSearch} className="h-12 rounded-2xl px-6">
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
        </div>
      </div>

      {/* Desktop Table */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-3xl border border-bree-border p-16 text-center">
          <p className="text-xl font-semibold text-bree-text-primary">
            No products found
          </p>
          <p className="text-bree-text-secondary mt-2">
            {searchQuery
              ? `No products matched "${searchQuery}"`
              : "Try another search or category."}
          </p>
        </div>
      ) : (
        <>
          <div className="hidden lg:block bg-white rounded-3xl border border-bree-border overflow-hidden">
            <table className="w-full">
              <thead className="bg-bree-bg">
            <tr className="text-left">
              <th className="px-6 py-4 text-sm font-semibold text-bree-text-secondary">
                Product
              </th>

              <th className="px-6 py-4 text-sm font-semibold text-bree-text-secondary">
                Category
              </th>

              <th className="px-6 py-4 text-sm font-semibold text-bree-text-secondary">
                Pricing
              </th>

              <th className="px-6 py-4 text-sm font-semibold text-bree-text-secondary">
                Status
              </th>

              <th className="px-6 py-4 text-sm font-semibold text-bree-text-secondary">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredProducts.map((product) => {
              const discount =
                product.mrp > 0
                  ? Math.floor(
                      ((product.mrp - product.price) / product.mrp) * 100,
                    )
                  : 0;

              return (
                <tr key={product.id} className="border-t border-bree-border">
                  {/* Product */}
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-bree-bg flex items-center justify-center overflow-hidden">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-12 h-12 object-contain"
                        />
                      </div>

                      <div>
                        <h3 className="font-semibold text-bree-text-primary">
                          {product.name}
                        </h3>

                        <p className="text-sm text-bree-text-secondary mt-1">
                          {product.quantity}
                          -Day Wellness Pack
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="px-6 py-5 text-bree-text-secondary">
                    {product.category}
                  </td>

                  {/* Pricing */}
                  <td className="px-6 py-5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-bree-text-primary">
                          ₹{product.price}
                        </span>

                        <span className="text-sm text-red-400 line-through">
                          ₹{product.mrp}
                        </span>
                      </div>

                      <div className="mt-2">
                        <span className="text-xs bg-red-50 text-red-500 px-3 py-1 rounded-full">
                          {discount}% OFF
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-5">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        product.status === "In Stock"
                          ? "bg-green-50 text-green-600"
                          : "bg-red-50 text-red-500"
                      }`}
                    >
                      {product.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleManageRelations(product)}
                        className="w-10 h-10 rounded-xl bg-bree-bg hover:bg-bree-primary/10 flex items-center justify-center transition"
                        title="Manage relations"
                      >
                        <span className="text-sm font-semibold text-bree-primary">
                          R
                        </span>
                      </button>
                      <button
                        onClick={() => handleEdit(product)}
                        className="w-10 h-10 rounded-xl bg-bree-bg hover:bg-bree-primary/10 flex items-center justify-center transition"
                        title="Edit product"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="w-10 h-10 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition"
                        title="Delete product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-4">
        {filteredProducts.map((product) => {
          const discount = Math.round(
            ((product.mrp - product.price) / product.mrp) * 100,
          );

          return (
            <div
              key={product.id}
              className="bg-white border border-bree-border rounded-3xl p-5"
            >
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 rounded-2xl bg-bree-bg flex items-center justify-center overflow-hidden flex-shrink-0">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-14 h-14 object-contain"
                  />
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-bree-text-primary">
                        {product.name}
                      </h3>

                      <p className="text-sm text-bree-text-secondary mt-1">
                        {product.category}
                      </p>
                    </div>

                    {product.popular && (
                      <span className="text-[10px] bg-bree-primary text-white px-2 py-1 rounded-full">
                        Popular
                      </span>
                    )}
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-bree-text-primary">
                        ₹{product.price}
                      </span>

                      <span className="text-sm text-red-400 line-through">
                        ₹{product.mrp}
                      </span>
                    </div>

                    <span className="inline-block mt-2 text-xs bg-red-50 text-red-500 px-3 py-1 rounded-full">
                      {discount}% OFF
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-5">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        product.status === "In Stock"
                          ? "bg-green-50 text-green-600"
                          : "bg-red-50 text-red-500"
                      }`}
                    >
                      {product.status}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleManageRelations(product)}
                        className="w-9 h-9 rounded-xl bg-bree-bg flex items-center justify-center"
                        title="Manage relations"
                      >
                        <span className="text-sm font-semibold text-bree-primary">
                          R
                        </span>
                      </button>
                      <button
                        onClick={() => handleEdit(product)}
                        className="w-9 h-9 rounded-xl bg-bree-bg flex items-center justify-center"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDelete(product.id)}
                        className="w-9 h-9 rounded-xl bg-red-50 text-red-500 flex items-center justify-center"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
        </>
      )}

      {/* Modal */}
      <ProductModal
        open={open}
        onClose={() => setOpen(false)}
        onSave={handleSave}
        initial={editing}
      />

      <ProductRelationsModal
        open={relationsOpen}
        onClose={() => setRelationsOpen(false)}
        product={relationTarget}
        products={products}
        relations={relations}
        onSave={handleSaveRelations}
        loading={relationsLoading}
      />
    </AdminLayout>
  );
};

export default Products;
