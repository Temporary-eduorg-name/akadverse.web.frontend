"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import LoadingSpinner from "@/components/LoadingSpinner";

interface Business {
  id: string;
  name: string;
  industry: string;
  description: string;
  location: string;
  visitors: number;
  image?:string;
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
  const [hoveredBusiness, setHoveredBusiness] = useState<string | null>(null);

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
          fetch(`/api/marketplace/businesses/by-category?category=${encodeURIComponent(categoryName)}`),
          fetch(`/api/marketplace/products/by-category?category=${encodeURIComponent(categoryName)}`)
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
      const response = await fetch("/api/marketplace/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ productId, quantity: 1 }),
      });

      if (response.ok) {
        alert("Added to cart!");
      } else if (response.status === 401) {
        window.location.href = "/studashboard/main-menu/marketplace";
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
    <div className="flex-1 bg-zinc-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            {categoryName}
          </h1>
          <p className="text-slate-600">
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
                <h2 className="text-2xl font-bold text-slate-900 mb-6">
                  Businesses
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {businesses.map((business) => (
                    <Link
                      className="flex w-[240px] p-4 gap-4 bg-white rounded-2xl border border-zinc-100 shadow group hover:shadow-lg transition-all duration-300 cursor-pointer"
                      key={business.id}
                      href={`/studashboard/main-menu/marketplace/business/${business.id}`}
                      onMouseEnter={() => setHoveredBusiness(business.id)}
                      onMouseLeave={() => setHoveredBusiness(null)}
                    >
                      {/* Business Image with Fallback */}
                      <div className="flex items-center justify-center">
                        {business.image ? (
                          <img
                            src={business.image}
                            alt={business.name}
                            className="w-16 h-16 object-cover rounded-xl border border-zinc-200 bg-zinc-50"
                          />
                        ) : (
                          <div className="w-16 h-16 flex items-center justify-center rounded-xl border border-zinc-200 bg-gradient-to-br from-zinc-200 to-zinc-300">
                            <span className="text-zinc-400 text-xs">No Image</span>
                          </div>
                        )}
                      </div>
                      {/* Business Details */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="font-bold text-slate-900 truncate mb-1 text-base" title={business.name}>{business.name}</h4>
                          <p className="text-xs text-slate-500 font-medium truncate">{business.industry}</p>
                        </div>
                        {/* Star rating and reviews (static for demo) */}
                        {/* <div className="flex items-center gap-1">
                      <span className="text-amber-400 text-base">★</span>
                      <span className="text-sm font-semibold text-zinc-800">{business.rating ?? (4.5 + (idx % 3) * 0.1).toFixed(1)}</span>
                      <span className="text-xs text-zinc-500 ml-1">({business.reviews ?? (200 + idx * 37)})</span>
                    </div> */}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Products Section */}
            {products.length > 0 ? (
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-6">
                  Products
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className="group flex flex-col w-[260px] bg-white rounded-2xl overflow-hidden border border-slate-200/60 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer"
                      onMouseEnter={() => setHoveredProduct(product.id)}
                      onMouseLeave={() => setHoveredProduct(null)}
                    >
                      {/* Product Image with Hover Overlay */}
                      <div className="aspect-[4/3] relative overflow-hidden bg-slate-100">
                        {product.secure_url || product.image ? (
                          <img
                            src={product.secure_url || product.image}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 rounded-t-2xl"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-200 to-zinc-300">
                            <span className="text-zinc-400 text-3xl font-bold">
                              {product.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        {hoveredProduct === product.id && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
                            <button
                              onClick={(e) => {/* TODO: Open product detail modal here */ }}
                              className="bg-white text-zinc-900 px-6 py-3 rounded-lg font-semibold hover:bg-zinc-100 transition-colors"
                            >
                              View Details
                            </button>
                          </div>
                        )}
                      </div>
                      {/* Product Details */}
                      <div className="flex-1 flex flex-col justify-between p-4">
                        <div>
                          <h4 className="font-bold text-slate-900 truncate mb-1" title={product.name}>{product.name}</h4>
                          <p className="text-xs text-slate-500 font-medium truncate mb-2">by {product.business.name}</p>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <span className="font-bold text-indigo-600 text-lg">₦{product.price.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : businesses.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-lg text-slate-600">
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
