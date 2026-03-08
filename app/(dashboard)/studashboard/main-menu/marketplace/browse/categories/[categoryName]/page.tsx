"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import LoadingSpinner from "@/src/LoadingSpinner";

interface Business {
  id: string;
  name: string;
  industry: string;
  description: string;
  location: string;
  visitors: number;
  yearEstablished?: number;
  _count: {
    products: number;
    orders: number;
  };
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  rating: number;
  secure_url?: string;
  image?: string;
  business: {
    id: string;
    name: string;
    industry: string;
  };
}

export default function CategoryPage() {
  const params = useParams();
  const categoryName = decodeURIComponent(params.categoryName as string);

  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const [adding, setAdding] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategoryData = async () => {
      setLoading(true);
      try {
        // Fetch both businesses and products in parallel
        const [businessesResponse, productsResponse] = await Promise.all([
          fetch(`/api/businesses/by-category?category=${encodeURIComponent(categoryName)}`),
          fetch(`/api/products/by-category?category=${encodeURIComponent(categoryName)}`)
        ]);

        if (businessesResponse.ok) {
          const businessData = await businessesResponse.json();
          setBusinesses(businessData.businesses || []);
        }

        if (productsResponse.ok) {
          const productData = await productsResponse.json();
          setProducts(productData.products || []);
        }
      } catch (error) {
        console.error("Error fetching category data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryData();
  }, [categoryName]);

  const handleAddToCart = async (productId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setAdding(productId);

    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ productId, quantity: 1 }),
      });

      if (response.ok) {
        alert("Added to cart!");
      } else if (response.status === 401) {
        window.location.href = "/login";
      } else {
        const data = await response.json();
        alert(data.error || "Failed to add to cart");
      }
    } catch (error) {
      console.error("Add to cart error:", error);
      alert("Failed to add to cart");
    } finally {
      setAdding(null);
    }
  };

  return (
    <div className="flex-1 bg-zinc-50 dark:bg-black min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
            {categoryName}
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            {loading
              ? "Loading..."
              : `Found ${businesses.length} business${businesses.length !== 1 ? "es" : ""} and ${products.length} product${products.length !== 1 ? "s" : ""}`}
          </p>
        </div>

        {loading ? (
          <LoadingSpinner size="md" />
        ) : (
          <>
            {/* Businesses Section */}
            {businesses.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">
                  Businesses
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {businesses.map((business) => (
                    <Link
                      key={business.id}
                      href={`/business/${business.id}`}
                      className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg overflow-hidden border border-zinc-200 dark:border-zinc-700 hover:shadow-xl transition-all"
                    >
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2 line-clamp-1">
                          {business.name}
                        </h3>

                        <p className="text-sm text-blue-600 dark:text-blue-400 mb-3 font-medium">
                          {business.industry}
                        </p>

                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4 line-clamp-2">
                          {business.description}
                        </p>

                        <div className="grid grid-cols-2 gap-3 mb-4 pb-4 border-b border-zinc-200 dark:border-zinc-700">
                          <div>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                              Products
                            </p>
                            <p className="text-lg font-bold text-zinc-900 dark:text-white">
                              {business._count.products}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                              Views
                            </p>
                            <p className="text-lg font-bold text-zinc-900 dark:text-white">
                              {business.visitors}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            📍 {business.location}
                          </p>
                          {business.yearEstablished && (
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                              Est. {business.yearEstablished}
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Products Section */}
            {products.length > 0 ? (
              <div>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">
                  Products
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg overflow-hidden border border-zinc-200 dark:border-zinc-700 hover:shadow-xl transition-shadow"
                    >
                      <div
                        className="relative"
                        onMouseEnter={() => setHoveredProduct(product.id)}
                        onMouseLeave={() => setHoveredProduct(null)}
                      >
                        {product.secure_url || product.image ? (
                          <img
                            src={product.secure_url || product.image}
                            alt={product.name}
                            className="w-full h-48 object-cover"
                          />
                        ) : (
                          <div className="w-full h-48 bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-700 dark:to-zinc-800 flex items-center justify-center">
                            <span className="text-zinc-400 dark:text-zinc-500 text-sm">
                              No Image
                            </span>
                          </div>
                        )}

                        {hoveredProduct === product.id && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <button
                              onClick={(e) => handleAddToCart(product.id, e)}
                              disabled={adding === product.id || product.stock === 0}
                              className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white px-6 py-3 rounded-lg font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {adding === product.id
                                ? "Adding..."
                                : product.stock === 0
                                ? "Out of Stock"
                                : "Add to Cart"}
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="p-4">
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2 line-clamp-1">
                          {product.name}
                        </h3>

                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3 line-clamp-2">
                          {product.description}
                        </p>

                        <div className="flex justify-between items-center mb-2">
                          <div>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                              Price
                            </p>
                            <p className="text-xl font-bold text-zinc-900 dark:text-white">
                              ₦{product.price.toFixed(2)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                              Rating
                            </p>
                            <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                              {product.rating.toFixed(1)} ⭐
                            </p>
                          </div>
                        </div>

                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                          By:{" "}
                          <Link
                            href={`/business/${product.business.id}`}
                            className="hover:underline text-zinc-700 dark:text-zinc-300 font-medium"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {product.business.name}
                          </Link>
                        </p>

                        <p className="text-xs text-zinc-600 dark:text-zinc-400">
                          {product.stock > 0 ? (
                            <span className="text-green-600 dark:text-green-400">
                              In Stock ({product.stock} units)
                            </span>
                          ) : (
                            <span className="text-red-600 dark:text-red-400">
                              Out of Stock
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : businesses.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-lg text-zinc-600 dark:text-zinc-400">
                  No businesses or products found in this category
                </p>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
