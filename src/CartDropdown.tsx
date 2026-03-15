"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import LoadingSpinner from "./LoadingSpinner";
import { getMarketplaceBase } from "./marketplaceRouteUtils";

interface CartItem {
  id: string;
  quantity: number;
  selectedVariants?: string | null;
  variant?: {
    id: string;
    price: number;
  } | null;
  product: {
    id: string;
    name: string;
    price: number;
    stock: number;
    secure_url?: string;
    image?: string;
    business: {
      id: string;
      name: string;
    };
  };
}

interface CartDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onCartChange?: () => void;
}

export default function CartDropdown({ isOpen, onClose, onCartChange }: CartDropdownProps) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const marketplaceBase = getMarketplaceBase(pathname);

  useEffect(() => {
    if (isOpen) {
      fetchCart();
    }
  }, [isOpen]);

  const fetchCart = async () => {
    try {
      const response = await fetch("/api/marketplace/cart", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setCartItems(data.cartItems || []);
        console.log(data.cartItems)
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    try {
      const response = await fetch(`/api/marketplace/cart/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ quantity: newQuantity }),
      });

      if (response.ok) {
        fetchCart();
        onCartChange?.();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to update quantity");
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      const response = await fetch(`/api/marketplace/cart/${itemId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        await fetchCart();
        onCartChange?.();
      }
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const itemPrice = item.variant?.price ?? item.product.price;
      return total + (itemPrice * item.quantity);
    }, 0);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />

          {/* Cart Dropdown */}
          <motion.div
            className="fixed right-0 top-0 h-full w-full md:w-96 bg-white dark:bg-zinc-900 shadow-xl z-50 flex flex-col"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
          >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Cart</h2>
          <button
            onClick={onClose}
            className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : cartItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">Your cart is empty</p>
            <button
              onClick={onClose}
              className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-6 py-2 rounded-lg font-medium hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3 p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700"
                >
                  {/* Product Image */}
                  {item.product.secure_url || item.product.image ? (
                    <img
                      src={item.product.secure_url || item.product.image}
                      alt={item.product.name}
                      className="w-20 h-20 object-cover rounded"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-zinc-300 dark:bg-zinc-700 rounded flex items-center justify-center">
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">No Image</span>
                    </div>
                  )}

                  {/* Product Details */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-zinc-900 dark:text-white text-sm line-clamp-1">
                      {item.product.name}
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">
                      By: {item.product.business.name}
                    </p>
                    
                    {/* Display selected variants */}
                    {item.selectedVariants && (
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">
                        {Object.entries(JSON.parse(item.selectedVariants)).map(([key, value]) => (
                          <span key={key}>{key}: {value as string} • </span>
                        ))}
                      </p>
                    )}
                    
                    <p className="text-sm font-bold text-zinc-900 dark:text-white">
                      ₦{(item.variant?.price ?? item.product.price).toFixed(2)}
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="w-7 h-7 flex items-center justify-center bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-white rounded hover:bg-zinc-300 dark:hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        −
                      </button>
                      <span className="text-sm font-medium text-zinc-900 dark:text-white w-8 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stock}
                        className="w-7 h-7 flex items-center justify-center bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-white rounded hover:bg-zinc-300 dark:hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="ml-auto text-red-600 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>

                    {/* Subtotal */}
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                      Subtotal: ₦{((item.variant?.price ?? item.product.price) * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t border-zinc-200 dark:border-zinc-800 p-4 space-y-4">
              {/* Total */}
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-zinc-900 dark:text-white">Total:</span>
                <span className="text-xl font-bold text-zinc-900 dark:text-white">
                  ₦{calculateTotal().toFixed(2)}
                </span>
              </div>

              {/* Checkout Button */}
              <Link
                href={`${marketplaceBase}/checkout`}
                onClick={onClose}
                className="block w-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-center py-3 rounded-lg font-semibold hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors"
              >
                Checkout
              </Link>
            </div>
          </>
        )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

