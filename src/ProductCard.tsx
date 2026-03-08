"use client";

import { useState } from "react";
import Link from "next/link";
import ProductDetailModal from "./ProductDetailModal";
import { handleViewProductDetails } from "@/utils/productDetailHandler";
import { formatNaira } from "@/utils/currency";

interface VariantField {
  id: string;
  name: string;
}

interface VariantValue {
  id: string;
  value: string;
  field: VariantField;
}

interface ProductVariant {
  id: string;
  price: number;
  isCustomPrice: boolean;
  stock: number;
  variantValues: Array<{ id: string; value: VariantValue }>;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  cost: number;
  stock: number;
  rating: number;
  image?: string;
  secure_url?: string;
  public_id?: string;
  business?: {
    id: string;
    name: string;
  };
  variants?: ProductVariant[];
  variantFields?: VariantField[];
}

interface ProductCardProps {
  product: Product;
  onDelete?: (productId: string) => void;
  showAddToCart?: boolean;
  showViewDetails?: boolean;
  editHref?: string;
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
  variants: ProductVariant[];
  variantFields: VariantField[];
}

interface ProductDetailsResponse {
  product: ProductDetails;
}

export default function ProductCard({
  product,
  onDelete,
  showAddToCart = false,
  showViewDetails = false,
  editHref,
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [adding, setAdding] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [productData, setProductData] = useState<ProductDetails | null>(null);
  const [loading, setLoading] = useState(false);


  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setAdding(true);

    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ productId: product.id, quantity: 1 }),
      });

      if (response.ok) {
        alert("Added to cart!");
        // Notify Navbar to update cart count
        window.dispatchEvent(new Event('cartUpdated'));
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
      setAdding(false);
    }
  };

  return (
    <>
      {productData && (
        <ProductDetailModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          product={productData}
        />
      )}

      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg overflow-hidden border border-zinc-200 dark:border-zinc-700">
        {/* Product Image */}
        <div
          className="relative"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {product.secure_url || product.image ? (
            <img
              src={product.secure_url || product.image}
              alt={product.name}
              className="w-full h-48 object-cover"
            />
          ) : (
            <div className="w-full h-48 bg-gradient-to-br from-zinc-300 to-zinc-400 dark:from-zinc-700 dark:to-zinc-800 flex items-center justify-center">
              <span className="text-zinc-500 dark:text-zinc-400">No Image</span>
            </div>
          )}

          {/* View Details or Add to Cart Button on Hover */}
          {(showViewDetails || showAddToCart) && isHovered && (
            <div className="absolute inset-0 bg-black bg-opacity-25 flex items-center justify-center">
              {showViewDetails ? (
                <button
                  onClick={(e) =>
                    handleViewProductDetails<ProductDetailsResponse>(product.id, e, {
                      onLoadStart: () => setLoading(true),
                      onLoadEnd: () => setLoading(false),
                      onSuccess: (data) => {
                        setProductData(data.product);
                        setModalOpen(true);
                      },
                      onError: () => {},
                    })
                  }
                  disabled={loading}
                  className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white px-6 py-3 rounded-lg font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Loading..." : "View Details"}
                </button>
              ) : (
                <button
                  onClick={handleAddToCart}
                  disabled={adding || product.stock === 0}
                  className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white px-6 py-3 rounded-lg font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {adding
                    ? "Adding..."
                    : product.stock === 0
                    ? "Out of Stock"
                    : "Add to Cart"}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="p-4">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">
            {product.name}
          </h3>

          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3 line-clamp-2">
            {product.description}
          </p>

          <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
            <div>
              <p className="text-zinc-600 dark:text-zinc-400">Price</p>
              <p className="font-semibold text-zinc-900 dark:text-white">
                {formatNaira(product.price)}
              </p>
            </div>
            <div>
              <p className="text-zinc-600 dark:text-zinc-400">Cost</p>
              <p className="font-semibold text-zinc-900 dark:text-white">
                {formatNaira(product.cost)}
              </p>
            </div>
            <div>
              <p className="text-zinc-600 dark:text-zinc-400">Stock</p>
              <p className="font-semibold text-zinc-900 dark:text-white">
                {product.stock} units
              </p>
            </div>
            <div>
              <p className="text-zinc-600 dark:text-zinc-400">Rating</p>
              <p className="font-semibold text-zinc-900 dark:text-white">
                {product.rating.toFixed(1)} ⭐
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            {onDelete && (
              <button
                onClick={() => onDelete(product.id)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-md transition-colors font-medium text-sm"
              >
                Delete
              </button>
            )}
            {editHref ? (
              <Link
                href={editHref}
                className="flex-1 text-center bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md transition-colors font-medium text-sm"
              >
                Edit
              </Link>
            ) : (
              <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md transition-colors font-medium text-sm">
                Edit
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
