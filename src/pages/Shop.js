import { useState, useEffect, useMemo, useCallback } from "react";

import { motion } from "framer-motion";

import { Helmet } from "react-helmet-async";

import { toast } from "sonner";

import ProductCard from "@/components/ProductCard";
import { useProductsSync } from "@/hooks/useProductsSync";

import axios from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api";

const Shop = () => {
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search + Filter
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [category, setCategory] = useState("All");

  const handleSearch = useCallback(() => {
    setSearchQuery(searchInput.trim());
  }, [searchInput]);

  const clearSearch = useCallback(() => {
    setSearchInput("");
    setSearchQuery("");
  }, []);

  // Dynamic Categories
  const categories = useMemo(() => {
    return [
      "All",

      ...new Set(products.map((product) => product.category).filter(Boolean)),
    ];
  }, [products]);

  // Fetch Products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('/api/products');
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
        const message = getApiErrorMessage(error);
        toast.error(message);
        setError(message);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Listen for product updates via Socket.IO
  useProductsSync((eventType, product) => {
    console.log(`🔄 Shop: Product ${eventType}`, product?.id);
    // Refetch products to stay in sync
    const refetchProducts = async () => {
      try {
        const response = await axios.get('/api/products');
        setProducts(response.data);
        if (eventType === 'created') {
          toast.success('New product added!');
        } else if (eventType === 'updated') {
          toast.success('Product updated!');
        } else if (eventType === 'deleted') {
          toast.success('Product removed!');
        }
      } catch (error) {
        console.error('Error refetching products:', error);
      }
    };
    refetchProducts();
  });

  // Filter Logic
  const filteredProducts = useMemo(() => {
    const normalizedQuery = searchQuery.toLowerCase();
    return products.filter((product) => {
      const matchesSearch = product.name
        .toLowerCase()
        .includes(normalizedQuery);

      const matchesCategory =
        category === "All" ? true : product.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, category]);

  return (
    <>
      <Helmet>
        <title>Shop — BREE Amla Wellness Shots</title>

        <meta
          name="description"
          content="Shop BREE wellness shots and daily immunity packs."
        />
      </Helmet>

      <div className="pt-24 min-h-screen bg-bree-bg">
        {/* Hero */}
        <section className="py-16 md:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <motion.div
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.6,
              }}
              className="text-center"
            >
              <span className="text-xs tracking-[0.2em] uppercase font-semibold text-bree-primary">
                Our Products
              </span>

              <h1 className="font-outfit text-4xl md:text-5xl tracking-tight leading-tight font-light text-bree-text-primary mt-4">
                Shop BREE
              </h1>

              <p className="text-bree-text-secondary mt-4 max-w-2xl mx-auto">
                Discover premium wellness shots crafted to energize your daily
                lifestyle.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Search + Filters */}
        <section className="pt-8 pb-6 md:pt-12 md:pb-10">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            {/* Wrapper */}
            <div className="flex flex-col items-center">
              {/* Search */}
              <div className="w-full max-w-2xl mb-6">
                <div className="flex items-center gap-3">
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
                    className="flex-1 h-14 px-6 rounded-3xl border border-bree-primary/40 bg-white outline-none focus:border-bree-primary transition-all text-bree-text-primary placeholder:text-bree-text-secondary shadow-sm"
                  />

                  {searchInput && (
                    <button
                      onClick={clearSearch}
                      className="h-14 px-5 rounded-3xl bg-white border border-bree-border text-bree-text-secondary hover:text-bree-primary transition"
                      aria-label="Clear search"
                    >
                      Clear
                    </button>
                  )}

                  <button
                    onClick={handleSearch}
                    className="h-14 px-5 rounded-3xl bg-bree-primary text-white font-medium hover:bg-bree-primary-hover transition"
                  >
                    Search
                  </button>
                </div>
              </div>

              {/* Categories */}
              <div className="w-full overflow-x-auto scrollbar-hide">
                <div className="flex flex-nowrap md:flex-wrap justify-start md:justify-center gap-3 min-w-max md:min-w-0 pb-2">
                  {categories.map((item) => (
                    <button
                      key={item}
                      onClick={() => setCategory(item)}
                      className={`px-5 md:px-6 h-11 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                        category === item
                          ? "bg-bree-primary text-white shadow-md"
                          : "bg-white border border-bree-border text-bree-text-secondary hover:border-bree-primary hover:text-bree-primary"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Products */}
        <section data-testid="shop-products" className="pb-20 md:pb-24">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="spinner w-12 h-12" />
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20">
                <h3 className="text-2xl font-semibold text-bree-text-primary">
                  No Products Found
                </h3>

                <p className="text-bree-text-secondary mt-3">
                  {searchQuery
                    ? `No products matched "${searchQuery}"`
                    : "Try another search or category."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto">
                {filteredProducts.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    index={index}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Benefits */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              {/* Shipping */}
              <motion.div
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{
                  once: true,
                }}
                className="p-6"
              >
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-bree-accent/30 flex items-center justify-center">
                  <span className="text-2xl">🚚</span>
                </div>

                <h3 className="font-outfit font-semibold text-bree-text-primary mb-2">
                  Free Shipping
                </h3>

                <p className="text-bree-text-secondary text-sm">
                  On all wellness packs
                </p>
              </motion.div>

              {/* Payment */}
              <motion.div
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{
                  once: true,
                }}
                transition={{
                  delay: 0.1,
                }}
                className="p-6"
              >
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-bree-accent/30 flex items-center justify-center">
                  <span className="text-2xl">🔒</span>
                </div>

                <h3 className="font-outfit font-semibold text-bree-text-primary mb-2">
                  Secure Payment
                </h3>

                <p className="text-bree-text-secondary text-sm">
                  Fast & secure checkout
                </p>
              </motion.div>

              {/* Natural */}
              <motion.div
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{
                  once: true,
                }}
                transition={{
                  delay: 0.2,
                }}
                className="p-6"
              >
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-bree-accent/30 flex items-center justify-center">
                  <span className="text-2xl">💯</span>
                </div>

                <h3 className="font-outfit font-semibold text-bree-text-primary mb-2">
                  100% Natural
                </h3>

                <p className="text-bree-text-secondary text-sm">
                  No preservatives or additives
                </p>
              </motion.div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Shop;
