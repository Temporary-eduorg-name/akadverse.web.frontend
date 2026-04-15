"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import LoadingSpinner from "@/components/LoadingSpinner";
import ProductDetailModal from "@/components/ProductDetailModal";
import { handleViewProductDetails } from "@/utils/productDetailHandler";

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

interface ProductDetails {
  id: string;
  name: string;
  description: string;
  price: number;
  secure_url?: string;
  stock: number;
  rating: number;
  business: {
    id: string;
    name: string;
  };
  variants: Array<{
    id: string;
    price: number;
    isCustomPrice: boolean;
    stock: number;
    variantValues: Array<{
      id: string;
      value: {
        id: string;
        value: string;
        field: {
          id: string;
          name: string;
        };
      };
    }>;
  }>;
  variantFields: Array<{
    id: string;
    name: string;
  }>;
}

interface ProductDetailsResponse {
  product: ProductDetails;
}

interface Business {
  id: string;
  name: string;
  industry: string;
  description: string;
  location: string;
  _count: {
    products: number;
  };
}

interface Skill {
  id: string;
  name: string;
  description: string;
  displayName: string;
  expertiseLevel: string;
  profilePicture?: string;
  yearsOfExperience: number;
  startingPrice: number;
  user: {
    id: string;
    firstName: string;
    lastName: string;
  };
  _count?: {
    offers: number;
    reviews: number;
  };
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const skillType = searchParams.get("skillType") || "";

  const [products, setProducts] = useState<Product[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState<string | null>(null);
  const [productData, setProductData] = useState<ProductDetails | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("q", query);
        if (category) {
          params.set("category", category);
        }
        if (skillType) {
          params.set("skillType", skillType);
        }

        const response = await fetch(`/api/marketplace/search?${params.toString()}`);
        if (response.ok) {
          const data = await response.json();
          setProducts(data.products || []);
          setBusinesses(data.businesses || []);
          setSkills(data.skills || []);
        }
      } catch (error) {
        console.error("Error fetching search results:", error);
      } finally {
        setLoading(false);
      }
    };

    if (query) {
      fetchResults();
    }
  }, [query, category, skillType]);

  if (!query) {
    return (
      <div className="flex-1 bg-zinc-50 dark:bg-black min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-4">
            Search Products
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Enter a search query to get started
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {productData && (
        <ProductDetailModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          product={productData}
        />
      )}

      <div className="flex-1 bg-zinc-50 dark:bg-black min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-4">
            Search Results
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            {loading ? "Searching..." : skillType 
              ? `Found ${skills.length} skill${skills.length !== 1 ? "s" : ""}`
              : `Found ${products.length} product${products.length !== 1 ? "s" : ""}, ${businesses.length} business${businesses.length !== 1 ? "es" : ""}, and ${skills.length} skill${skills.length !== 1 ? "s" : ""}`
            }
          </p>

          {/* Show selected filters as chips */}
          {(category || skillType) && (
            <div className="mt-4 flex items-center gap-2">
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                {category ? "Category:" : "Skill Type:"}
              </span>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-full font-medium">
                {category || skillType}
              </div>
            </div>
          )}
        </div>

        {/* Products Grid - Only show when skillType is NOT applied */}
        {!skillType && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">
              Products
            </h2>
            {loading ? (
              <LoadingSpinner size="md" />
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-lg text-zinc-600 dark:text-zinc-400">
                  No products found matching your search
                </p>
              </div>
            ) : (
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
                          onClick={(e) =>
                            handleViewProductDetails<ProductDetailsResponse>(product.id, e, {
                              onLoadStart: (id) => setLoadingDetails(id),
                              onLoadEnd: () => setLoadingDetails(null),
                              onSuccess: (data) => {
                                setProductData(data.product);
                                setModalOpen(true);
                              },
                              onError: () => {},
                            })
                          }
                          disabled={loadingDetails === product.id}
                          className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white px-6 py-3 rounded-lg font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loadingDetails === product.id ? "Loading..." : "View Details"}
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

                    <div className="flex justify-between items-start">
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
                      By: <Link href={`/staffdashboard/main-menu/marketplace/business/${product.business.id}`} className="hover:underline text-zinc-700 dark:text-zinc-300 font-medium" onClick={(e) => e.stopPropagation()}>{product.business.name}</Link>
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
          )}
          </div>
        )}

        {/* Skills Section - BETWEEN PRODUCTS AND BUSINESSES - Only show when skillType is applied or no category filter */}
        {skills.length > 0 && !category && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">
              Skill Owners
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {skills.map((skill) => (
                <Link
                  key={skill.id}
                  href={`/staffdashboard/main-menu/marketplace/dashboard/skills/${skill.id}`}
                  className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg overflow-hidden border border-zinc-200 dark:border-zinc-700 hover:shadow-xl transition-shadow"
                >
                  {/* Profile Picture */}
                  <div className="relative">
                    {skill.profilePicture ? (
                      <img
                        src={skill.profilePicture}
                        alt={skill.name}
                        className="w-full h-48 object-cover"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-purple-200 to-blue-300 dark:from-purple-900 dark:to-blue-900 flex items-center justify-center">
                        <span className="text-4xl font-bold text-white">
                          {skill.displayName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}

                    {/* Expertise Badge */}
                    <div className="absolute top-2 right-2 bg-black/70 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      {skill.expertiseLevel.charAt(0).toUpperCase() +
                        skill.expertiseLevel.slice(1)}
                    </div>
                  </div>

                  {/* Skill Details */}
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2 line-clamp-1">
                      {skill.name}
                    </h3>

                    <p className="text-sm text-blue-600 dark:text-blue-400 mb-3 font-medium">
                      by {skill.user.firstName} {skill.user.lastName}
                    </p>

                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4 line-clamp-2">
                      {skill.description}
                    </p>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-4 pb-4 border-b border-zinc-200 dark:border-zinc-700">
                      <div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          Experience
                        </p>
                        <p className="text-lg font-bold text-zinc-900 dark:text-white">
                          {skill.yearsOfExperience}+ yrs
                        </p>
                      </div>
                      {skill._count && (
                        <div className="text-right">
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            Reviews
                          </p>
                          <p className="text-lg font-bold text-zinc-900 dark:text-white">
                            {skill._count.reviews}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Businesses Section - BELOW PRODUCTS AND SKILLS - Only show when skillType is NOT applied */}
        {businesses.length > 0 && !skillType && (
          <div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">
              Businesses
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {businesses.map((business) => (
                <Link
                  key={business.id}
                  href={`/staffdashboard/main-menu/marketplace/business/${business.id}`}
                  className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-700 hover:shadow-xl transition-shadow overflow-hidden p-6"
                >
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2 line-clamp-1">
                    {business.name}
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3 line-clamp-2">
                    {business.description}
                  </p>
                  <div className="space-y-2">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      <span className="font-semibold">Category:</span> {business.industry}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      <span className="font-semibold">Location:</span> {business.location}
                    </p>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                      {business._count.products} Product{business._count.products !== 1 ? "s" : ""}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
      </div>
    </>
  );
}
