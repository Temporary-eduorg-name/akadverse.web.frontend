"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { calculateDeliveryDate, getRelativeDeliveryTime, formatDeliveryDate } from "@/utils/deliveryDate";
import { formatNaira } from "@/utils/currency";

interface VariantValue {
  id: string;
  value: string;
  field: {
    id: string;
    name: string;
  };
}

interface Variant {
  id: string;
  price: number;
  isCustomPrice: boolean;
  stock: number;
  variantValues: Array<{
    id: string;
    value: VariantValue;
  }>;
}

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
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
      serviceDays?: string;
      serviceTimes?: string;
    };
    variants: Variant[];
    variantFields: Array<{
      id: string;
      name: string;
    }>;
  };
}

export default function ProductDetailModal({
  isOpen,
  onClose,
  product,
}: ProductDetailModalProps) {
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  // Initialize with first variant values when modal opens
  useEffect(() => {
    if (isOpen && product.variantFields.length > 0) {
      const initialVariants: Record<string, string> = {};
      product.variantFields.forEach((field) => {
        const fieldVariants = Array.from(
          new Set(
            product.variants
              .flatMap((v) =>
                v.variantValues
                  .filter((vv) => vv.value.field.id === field.id)
                  .map((vv) => vv.value.value)
              )
          )
        );
        // Set first variant value as default
        if (fieldVariants.length > 0) {
          initialVariants[field.name] = fieldVariants[0];
        }
      });
      
      setSelectedVariants(initialVariants);
      setQuantity(1); // Reset quantity when modal opens
    } else if (!isOpen) {
      // Reset when modal closes
      setSelectedVariants({});
      setQuantity(1);
    }
  }, [isOpen, product]);

  // Reset quantity if it exceeds selected variant stock
  useEffect(() => {
    const maxStock = getSelectedVariantStock();
    if (quantity > maxStock) {
      setQuantity(Math.max(1, maxStock));
    }
  }, [selectedVariants]);

  const getSelectedVariantPrice = () => {
    if (product.variants.length === 0) return product.price;

    // Find matching variant based on selected values
    console.log(selectedVariants)
    if (Object.keys(selectedVariants).length > 0) {
      const matchingVariant = product.variants.find((variant) => {
        return Object.entries(selectedVariants).every(([fieldName, value]) =>
          variant.variantValues.some(
            (vv) => vv.value.field.name === fieldName && vv.value.value === value
          )
        );
      });
      return matchingVariant ? matchingVariant.price : product.price;
    }

    return product.price;
  };

  const getSelectedVariantStock = () => {
    if (product.variants.length === 0) return product.stock;

    // Find matching variant based on selected values
    if (Object.keys(selectedVariants).length > 0) {
      const matchingVariant = product.variants.find((variant) => {
        return Object.entries(selectedVariants).every(([fieldName, value]) =>
          variant.variantValues.some(
            (vv) => vv.value.field.name === fieldName && vv.value.value === value
          )
        );
      });
      return matchingVariant ? matchingVariant.stock : product.stock;
    }

    return product.stock;
  };

  const handleAddToCart = async () => {
    setAdding(true);
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          productId: product.id,
          quantity,
          selectedVariants: Object.keys(selectedVariants).length > 0 ? selectedVariants : null,
        }),
      });

      if (response.ok) {
        alert("Added to cart!");
        // Notify Navbar to update cart count
        window.dispatchEvent(new Event('cartUpdated'));
        onClose();
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

  // Calculate expected delivery date
  const deliveryDate = useMemo(() => {
    if (product.business.serviceDays && product.business.serviceTimes) {
      return calculateDeliveryDate(
        product.business.serviceDays,
        product.business.serviceTimes
      );
    }
    return null;
  }, [product.business.serviceDays, product.business.serviceTimes]);

  const currentPrice = getSelectedVariantPrice();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-zinc-900 rounded-lg shadow-2xl"
          >
            <div className="p-8">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 text-2xl"
              >
                ×
              </button>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Product Image */}
                <div>
                  {product.secure_url ? (
                    <img
                      src={product.secure_url}
                      alt={product.name}
                      className="w-full h-80 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-80 bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-700 dark:to-zinc-800 rounded-lg flex items-center justify-center">
                      <span className="text-zinc-400">No Image</span>
                    </div>
                  )}
                </div>

                {/* Product Details */}
                <div className="space-y-6">
                  <div>
                    <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
                      {product.name}
                    </h2>
                    <Link
                      href={`/business/${product.business.id}`}
                      className="text-zinc-600 dark:text-zinc-400 hover:underline text-sm"
                    >
                      By {product.business.name}
                    </Link>
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-4">
                    <p className="text-3xl font-bold text-zinc-900 dark:text-white">
                      {formatNaira(currentPrice)}
                    </p>
                    {product.rating > 0 && (
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-500">⭐</span>
                        <span className="text-sm text-zinc-600 dark:text-zinc-400">
                          {product.rating.toFixed(1)} ({product.stock} in stock)
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <h3 className="font-semibold text-zinc-900 dark:text-white mb-2">
                      Description
                    </h3>
                    <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
                      {product.description}
                    </p>
                  </div>

                  {/* Expected Delivery */}
                  {deliveryDate && (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                      <h3 className="font-semibold text-green-900 dark:text-green-100 mb-1 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Expected Delivery
                      </h3>
                      <p className="text-green-700 dark:text-green-300 text-sm">
                        <span className="font-medium">{getRelativeDeliveryTime(deliveryDate)}</span>
                        {getRelativeDeliveryTime(deliveryDate) !== formatDeliveryDate(deliveryDate) && (
                          <span className="text-xs block mt-1 text-green-600 dark:text-green-400">
                            {formatDeliveryDate(deliveryDate)}
                          </span>
                        )}
                      </p>
                    </div>
                  )}

                  {/* Variants */}
                  {product.variantFields.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="font-semibold text-zinc-900 dark:text-white">
                        Customize
                      </h3>
                      {product.variantFields.map((field) => {
                        const fieldVariants = Array.from(
                          new Set(
                            product.variants
                              .flatMap((v) =>
                                v.variantValues
                                  .filter((vv) => vv.value.field.id === field.id)
                                  .map((vv) => vv.value.value)
                              )
                          )
                        );

                        return (
                          <div key={field.id}>
                            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 block mb-2">
                              {field.name}
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                              {fieldVariants.map((value) => (
                                <button
                                  key={`${field.id}-${value}`}
                                  onClick={() =>
                                    setSelectedVariants({
                                      ...selectedVariants,
                                      [field.name]: value,
                                    })
                                  }
                                  className={`py-2 px-3 rounded border text-sm transition-colors ${
                                    selectedVariants[field.name] === value
                                      ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-zinc-900 dark:border-white"
                                      : "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white border-zinc-200 dark:border-zinc-700 hover:border-zinc-900 dark:hover:border-white"
                                  }`}
                                >
                                  {value}
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Quantity */}
                  <div>
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 block mb-2">
                      Quantity {product.variantFields.length > 0 && (
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">
                          ({getSelectedVariantStock()} available)
                        </span>
                      )}
                    </label>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                        className="w-10 h-10 rounded border border-zinc-300 dark:border-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        −
                      </button>
                      <span className="w-8 text-center text-zinc-900 dark:text-white font-medium">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(Math.min(getSelectedVariantStock(), quantity + 1))}
                        disabled={quantity >= getSelectedVariantStock()}
                        className="w-10 h-10 rounded border border-zinc-300 dark:border-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Add to Cart Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAddToCart}
                    disabled={adding}
                    className="w-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 py-3 rounded-lg font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors disabled:opacity-50"
                  >
                    {adding ? "Adding..." : "Add to Cart"}
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
