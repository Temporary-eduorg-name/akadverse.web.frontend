'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/src/LoadingSpinner';

const BASE = '/admindashboard/main-menu/marketplace';

interface CartItem {
  id: string;
  quantity: number;
  selectedVariants?: string | null;
  variant?: { id: string; price: number } | null;
  product: {
    id: string;
    name: string;
    price: number;
    secure_url?: string;
    image?: string;
    business: { name: string };
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setup: (config: any) => { openIframe: () => void };
    };
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [user, setUser] = useState<UserData | null>(null);
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const paystackScriptLoaded = useRef(false);

  useEffect(() => {
    if (!paystackScriptLoaded.current) {
      const script = document.createElement('script');
      script.src = 'https://js.paystack.co/v1/inline.js';
      script.async = true;
      script.onload = () => { paystackScriptLoaded.current = true; };
      document.head.appendChild(script);
    }
    fetchUserAndCart();
  }, []);

  const fetchUserAndCart = async () => {
    try {
      const userResponse = await fetch('/api/marketplace/user', { credentials: 'include' });
      if (!userResponse.ok) { router.push('/login'); return; }
      const userData = await userResponse.json();
      const resolvedUser = userData.user || userData;
      setUser(resolvedUser);
      setLocation(resolvedUser.location || '');

      const cartResponse = await fetch('/api/marketplace/cart', { credentials: 'include' });
      if (!cartResponse.ok) throw new Error('Failed to fetch cart');
      const cartData = await cartResponse.json();
      setCartItems(cartData.cartItems || cartData);
    } catch (err) {
      setError('Failed to load checkout information');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () =>
    cartItems.reduce((sum, item) => {
      const itemPrice = item.variant?.price ?? item.product.price;
      return sum + itemPrice * item.quantity;
    }, 0);

  const updateLocation = async () => {
    if (!location.trim()) { alert('Please enter a location'); return; }
    try {
      const response = await fetch('/api/marketplace/user/location', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location }),
      });
      if (!response.ok) throw new Error('Failed to update location');
      alert('Location updated successfully!');
    } catch (err) {
      alert('Failed to update location');
    }
  };

  const handlePayment = async () => {
    if (!location.trim()) { alert('Please enter or update your delivery location'); return; }
    if (cartItems.length === 0) { alert('Your cart is empty'); return; }
    setProcessing(true);
    setError('');
    try {
      let attempts = 0;
      while (!window.PaystackPop && attempts < 50) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        attempts++;
      }
      if (!window.PaystackPop) throw new Error('Paystack payment gateway failed to load');
      const paystackPublicKey = process.env.NEXT_PUBLIC_PAYSTACK_KEY;
      if (!paystackPublicKey) throw new Error('Paystack public key not configured');
      const uniqueRef = `pay_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
      const handler = window.PaystackPop.setup({
        key: paystackPublicKey,
        email: user?.email || '',
        amount: Math.round(calculateTotal() * 100),
        ref: uniqueRef,
        currency: 'NGN',
        callback: (response: PaystackResponse) => {
          fetch(`/api/marketplace/payment/verify?reference=${response.reference}`)
            .then((r) => {
              if (!r.ok) return r.json().then((d) => { throw new Error(d.error || 'Verification failed'); });
              return r.json();
            })
            .then(() => {
              alert('Payment successful! Your orders have been placed.');
              router.push(BASE);
            })
            .catch((err) => {
              setError('Payment was processed but verification failed: ' + (err as Error).message);
              setProcessing(false);
            });
        },
        onClose: () => setProcessing(false),
      });
      handler.openIframe();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process payment. Please try again.');
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <LoadingSpinner size="md" />
          <p className="text-gray-600 mt-4">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
          <button
            onClick={() => router.push(BASE)}
            className="rounded-lg bg-[#667eea] px-6 py-2 text-white font-semibold hover:bg-indigo-600 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">{error}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-4">
              {cartItems.map((item) => {
                const itemPrice = item.variant?.price ?? item.product.price;
                return (
                  <div key={item.id} className="flex items-center gap-4 pb-4 border-b border-gray-100 last:border-0">
                    <div className="relative w-20 h-20 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                      {item.product.secure_url ? (
                        <img
                          src={item.product.secure_url}
                          alt={item.product.name}
                          className="absolute inset-0 h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No image</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">{item.product.name}</h3>
                      <p className="text-sm text-gray-500">{item.product.business.name}</p>
                      {item.selectedVariants && (
                        <p className="text-xs text-gray-400 mt-1">{item.selectedVariants}</p>
                      )}
                      <p className="text-sm text-gray-600 mt-1">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-gray-900">
                      ₦{(itemPrice * item.quantity).toLocaleString()}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Delivery Location</h2>
            <div className="flex gap-2">
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter delivery address"
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#667eea]"
              />
              <button
                type="button"
                onClick={updateLocation}
                className="rounded-lg border border-[#667eea] text-[#667eea] px-3 py-2 text-sm font-semibold hover:bg-[#667eea] hover:text-white transition-colors"
              >
                Save
              </button>
            </div>
            {user && (
              <p className="text-xs text-gray-500 mt-2">
                {user.firstName} {user.lastName} &bull; {user.email}
              </p>
            )}
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Summary</h2>
            <div className="space-y-2 mb-4">
              {cartItems.map((item) => {
                const itemPrice = item.variant?.price ?? item.product.price;
                return (
                  <div key={item.id} className="flex justify-between text-sm text-gray-600">
                    <span className="truncate mr-2">{item.product.name} × {item.quantity}</span>
                    <span>₦{(itemPrice * item.quantity).toLocaleString()}</span>
                  </div>
                );
              })}
              <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-gray-900">
                <span>Total</span>
                <span>₦{calculateTotal().toLocaleString()}</span>
              </div>
            </div>
            <button
              onClick={handlePayment}
              disabled={processing || !location.trim()}
              className="w-full rounded-lg bg-[#667eea] py-3 text-white font-semibold hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? 'Processing…' : `Pay ₦${calculateTotal().toLocaleString()}`}
            </button>
            <p className="text-xs text-gray-500 text-center mt-2">Powered by Paystack</p>
          </div>
        </div>
      </div>
    </div>
  );
}
