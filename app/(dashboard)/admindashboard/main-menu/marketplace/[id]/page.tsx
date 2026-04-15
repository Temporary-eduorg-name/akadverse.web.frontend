"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import LoadingSpinner from "@/src/LoadingSpinner";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  rating: number;
  secure_url?: string;
  image?: string;
}

interface Business {
  id: string;
  name: string;
  industry: string;
  description: string;
  location: string;
  serviceDays: string | string[];
  serviceTimes: string;
  instagram?: string;
  linkedin?: string;
  website?: string;
  createdAt: string;
  products: Product[];
}

interface RelatedBusiness {
  id: string;
  name: string;
  industry: string;
  description: string;
  location: string;
  productCount: number;
}

export default function BusinessPage() {
  const params = useParams();
  const router = useRouter();
  const businessId = params.id as string;

  const [business, setBusiness] = useState<Business | null>(null);
  const [relatedBusinesses, setRelatedBusinesses] = useState<RelatedBusiness[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const [adding, setAdding] = useState<string | null>(null);

  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        const response = await fetch(`/api/marketplace/businesses/${businessId}/public`);
        if (response.ok) {
          const data = await response.json();
          setBusiness(data.business);
          setRelatedBusinesses(data.relatedBusinesses || []);
        } else {
          router.push("/admindashboard/main-menu/marketplace");
        }
      } catch (error) {
        console.error("Error fetching business:", error);
        router.push("/admindashboard/main-menu/marketplace");
      } finally {
        setLoading(false);
      }
    };

    if (businessId) {
      fetchBusiness();
    }
  }, [businessId, router]);

  const handleAddToCart = async (productId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setAdding(productId);

    try {
      const response = await fetch("/api/marketplace/cart", {
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

  if (loading) {
    return (
      <div className="flex-1 bg-zinc-50 dark:bg-black min-h-screen flex items-center justify-center">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  if (!business) {
    return (
      <div className="flex-1 bg-zinc-50 dark:bg-black min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-600 dark:text-zinc-400 mb-4">
            Business not found
          </p>
          <Link
            href="/admindashboard/main-menu/marketplace"
            className="text-zinc-900 dark:text-white hover:underline"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const serviceDaysDisplay = Array.isArray(business.serviceDays)
    ? business.serviceDays.join(", ")
    : business.serviceDays;

  return (
    <div className="flex-1 bg-zinc-50 dark:bg-black min-h-screen">
      {/* Business Header */}
      <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <Link
            href="/admindashboard/main-menu/marketplace"
            className="inline-flex items-center text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white mb-6 transition-colors"
          >
            ← Back to Home
          </Link>

          <div className="mb-6">
            <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-2">
              {business.name}
            </h1>
            <p className="text-lg text-zinc-600 dark:text-zinc-400">
              {business.industry}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Business Info */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-2">
                  Registered On
                </h3>
                <p className="text-zinc-900 dark:text-white">
                  {new Date(business.createdAt).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-2">
                  About
                </h3>
                <p className="text-zinc-900 dark:text-white">
                  {business.description}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-2">
                  Location
                </h3>
                <p className="text-zinc-900 dark:text-white flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                    />
                  </svg>
                  {business.location}
                </p>
              </div>
            </div>

            {/* Operating Hours */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-2">
                  Service Days
                </h3>
                <p className="text-zinc-900 dark:text-white">
                  {serviceDaysDisplay}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-2">
                  Service Times
                </h3>
                <p className="text-zinc-900 dark:text-white flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {business.serviceTimes}
                </p>
              </div>

              {/* Social Links */}
              {(business.instagram || business.linkedin || business.website) && (
                <div>
                  <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-3">
                    Connect
                  </h3>
                  <div className="flex gap-3">
                    {business.instagram && (
                      <a
                        href={business.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                        title="Instagram"
                      >
                        <svg
                          className="w-6 h-6"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                        </svg>
                      </a>
                    )}
                    {business.linkedin && (
                      <a
                        href={business.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                        title="LinkedIn"
                      >
                        <svg
                          className="w-6 h-6"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                        </svg>
                      </a>
                    )}
                    {business.website && (
                      <a
                        href={business.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                        title="Website"
                      >
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                          />
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-8">
          Products
        </h2>

        {business.products.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700">
            <p className="text-zinc-600 dark:text-zinc-400">
              No products available at the moment
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {business.products.map((product) => (
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
        )}
      </div>

      {/* Related Businesses Section */}
      {relatedBusinesses.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 py-12">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-8">
              Related Businesses
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedBusinesses.map((relatedBusiness) => (
                <Link
                  key={relatedBusiness.id}
                  href={`/admindashboard/main-menu/marketplace/business/${relatedBusiness.id}`}
                  className="bg-zinc-50 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 p-6 hover:shadow-lg hover:border-zinc-400 dark:hover:border-zinc-500 transition-all"
                >
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2 line-clamp-1">
                    {relatedBusiness.name}
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3 line-clamp-2">
                    {relatedBusiness.description}
                  </p>
                  <div className="space-y-1">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      <span className="font-semibold">Category:</span>{" "}
                      {relatedBusiness.industry}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      <span className="font-semibold">Location:</span>{" "}
                      {relatedBusiness.location}
                    </p>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-white mt-2">
                      {relatedBusiness.productCount} Product
                      {relatedBusiness.productCount !== 1 ? "s" : ""}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

