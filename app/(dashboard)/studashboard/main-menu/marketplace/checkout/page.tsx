"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/LoadingSpinner";

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
    secure_url?: string;
    image?: string;
    business: {
      name: string;
    };
  };
}

interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  location: string | null;
}

interface PaystackResponse {
  reference: string;
  status: string;
  message: string;
  transaction: string;
  amount: number;
}

declare global {
  interface Window {
    PaystackPop: {
      setup: (config: any) => { openIframe: () => void };
    };
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [user, setUser] = useState<UserData | null>(null);
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const paystackScriptLoaded = useRef(false);

  useEffect(() => {
    // Load Paystack script
    if (!paystackScriptLoaded.current) {
      const script = document.createElement("script");
      script.src = "https://js.paystack.co/v1/inline.js";
      script.async = true;
      script.onload = () => {
        paystackScriptLoaded.current = true;
        console.log("Paystack script loaded successfully!");
      };
      script.onerror = () => {
        console.error("Failed to load Paystack script");
      };
      document.head.appendChild(script);
    }
    fetchUserAndCart();
  }, []);

  const fetchUserAndCart = async () => {
    try {
      // Fetch user data
      const userResponse = await fetch("/api/marketplace/user");
      if (!userResponse.ok) {
        router.push("/studashboard/main-menu/marketplace");
        return;
      }
      const userData = await userResponse.json();
      const resolvedUser = userData.user || userData;
      setUser(resolvedUser);
      setLocation(resolvedUser.location || "");

      // Fetch cart items
      const cartResponse = await fetch("/api/marketplace/cart");
      if (!cartResponse.ok) {
        throw new Error("Failed to fetch cart");
      }
      const cartData = await cartResponse.json();
      setCartItems(cartData.cartItems || cartData);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load checkout information");
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => {
      const itemPrice = item.variant?.price ?? item.product.price;
      return sum + itemPrice * item.quantity;
    }, 0);
  };

  const updateLocation = async () => {
    if (!location.trim()) {
      alert("Please enter a location");
      return;
    }

    try {
      const response = await fetch("/api/marketplace/user/location", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location }),
      });

      if (!response.ok) {
        throw new Error("Failed to update location");
      }

      const updatedUser = await response.json();
      setUser(updatedUser);
      alert("Location updated successfully!");
    } catch (error) {
      console.error("Error updating location:", error);
      alert("Failed to update location");
    }
  };

  const handlePayment = async () => {
    if (!location.trim()) {
      alert("Please enter or update your delivery location");
      return;
    }

    if (cartItems.length === 0) {
      alert("Your cart is empty");
      return;
    }

    setProcessing(true);
    setError("");

    try {
      // Wait for Paystack to be available
      let attempts = 0;
      while (!window.PaystackPop && attempts < 50) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        attempts++;
      }

      if (!window.PaystackPop) {
        throw new Error("Paystack payment gateway failed to load");
      }

      // Get Paystack public key from environment
      const paystackPublicKey = process.env.NEXT_PUBLIC_PAYSTACK_KEY;
      if (!paystackPublicKey) {
        throw new Error("Paystack public key not configured");
      }

      // Generate a unique reference for this transaction (Paystack will recognize this)
      const uniqueRef = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      console.log("Generated payment reference:", uniqueRef);

      // Configure Paystack payment - let Paystack handle the full flow
      const handler = window.PaystackPop.setup({
        key: paystackPublicKey,
        email: user?.email || "",
        amount: Math.round(calculateTotal() * 100),
        ref: uniqueRef,
        currency: "NGN",
        callback: function(response: PaystackResponse) {
          console.log("Payment callback - Paystack response:", response);
          console.log("Paystack returned reference:", response.reference);
          
          // Verify payment with backend using Paystack's returned reference
          fetch(`/api/marketplace/payment/verify?reference=${response.reference}`, {
            method: "GET",
          })
            .then((verifyResponse) => {
              if (!verifyResponse.ok) {
                return verifyResponse.json().then((data) => {
                  throw new Error(data.error || "Payment verification failed");
                });
              }
              return verifyResponse.json();
            })
            .then((verifyData) => {
              console.log("Verification successful:", verifyData);
              alert("Payment successful! Your orders have been placed.");
              router.push("/studashboard/main-menu/marketplace");
            })
            .catch((error) => {
              console.error("Verification error:", error);
              setError("Payment was processed but verification failed: " + error.message);
              setProcessing(false);
            });
        },
        onClose: function() {
          console.log("Payment modal closed");
          setProcessing(false);
        },
      });

      handler.openIframe();
    } catch (error) {
      console.error("Payment error:", error);
      setError(error instanceof Error ? error.message : "Failed to process payment. Please try again.");
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="md" />
          <p className="text-zinc-900 dark:text-white mt-4">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">
            Your cart is empty
          </h1>
          <button
            onClick={() => router.push("/studashboard/main-menu/marketplace")}
            className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-6 py-2 rounded-md hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-8">
          Checkout
        </h1>

        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-md">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-4">
                Order Summary
              </h2>

              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800"
                  >
                    <div className="relative w-20 h-20 flex-shrink-0 bg-zinc-200 dark:bg-zinc-800 rounded-md overflow-hidden">
                      {item.product.secure_url ? (
                        <img
                          src={item.product.secure_url}
                          alt={item.product.name}
                          className="absolute inset-0 h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-400">
                          No image
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <h3 className="font-medium text-zinc-900 dark:text-white">
                        {item.product.name}
                      </h3>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        {item.product.business.name}
                      </p>
                      
                      {/* Display selected variants */}
                      {item.selectedVariants && (
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                          {Object.entries(JSON.parse(item.selectedVariants)).map(([key, value], idx) => (
                            <span key={key}>
                              {key}: <span className="font-semibold">{value as string}</span>
                              {idx < Object.keys(JSON.parse(item.selectedVariants || '{}')).length - 1 ? ' • ' : ''}
                            </span>
                          ))}
                        </p>
                      )}
                      
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                        Quantity: {item.quantity}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-semibold text-zinc-900 dark:text-white">
                        ₦{((item.variant?.price ?? item.product.price) * item.quantity).toFixed(2)}
                      </p>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        ₦{(item.variant?.price ?? item.product.price).toFixed(2)} each
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span className="text-zinc-900 dark:text-white">Total:</span>
                  <span className="text-zinc-900 dark:text-white">
                    ₦{calculateTotal().toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery & Payment */}
          <div className="space-y-6">
            {/* Delivery Address */}
            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-4">
                Delivery Address
              </h2>

              {user && (
                <div className="mb-4">
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">
                    Name:
                  </p>
                  <p className="text-zinc-900 dark:text-white font-medium">
                    {user.firstName} {user.lastName}
                  </p>
                </div>
              )}

              <div className="mb-4">
                <label
                  htmlFor="location"
                  className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
                >
                  Location:
                </label>
                <input
                  type="text"
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Enter your delivery location"
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
                />
              </div>

              {user?.location !== location && location.trim() && (
                <button
                  onClick={updateLocation}
                  className="w-full mb-4 bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-white px-4 py-2 rounded-md hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors text-sm"
                >
                  Update Location
                </button>
              )}
            </div>

            {/* Payment Button */}
            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-4">
                Payment
              </h2>

              <div className="mb-4 p-4 bg-zinc-100 dark:bg-zinc-800 rounded-md">
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
                  Total Amount:
                </p>
                <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                  ₦{calculateTotal().toFixed(2)}
                </p>
              </div>

              <button
                onClick={handlePayment}
                disabled={processing || !location.trim()}
                className="w-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-6 py-3 rounded-md hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? "Processing..." : "Pay Now"}
              </button>

              <p className="mt-4 text-xs text-center text-zinc-500 dark:text-zinc-400">
                A secure payment modal will open to complete your transaction
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
