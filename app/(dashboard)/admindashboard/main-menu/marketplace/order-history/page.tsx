'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import LoadingSpinner from '@/src/LoadingSpinner';

const BASE = '/admindashboard/main-menu/marketplace';

interface Order {
  id: string;
  total: number;
  status: string;
  createdAt: string;
  expectedDeliveryDate?: string | null;
  business?: { id: string; name: string };
  isDisputed?: boolean;
  disputeReason?: string | null;
  disputeCreatedAt?: string | null;
  items?: Array<{
    id: string;
    quantity: number;
    selectedVariants?: string | null;
    product: { id: string; name: string; price: number; secure_url?: string };
  }>;
}

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/marketplace/orders/history', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Error fetching order history:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    const eventSource = new EventSource('/api/marketplace/realtime/events?scope=buyer');
    const onUpdate = () => fetchOrders();
    eventSource.addEventListener('update', onUpdate);
    eventSource.onerror = () => eventSource.close();
    return () => {
      eventSource.removeEventListener('update', onUpdate);
      eventSource.close();
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Order History</h1>
          <p className="text-gray-500 mt-1">
            {orders.length === 0
              ? 'No completed orders'
              : `${orders.length} completed order${orders.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <Link href={`${BASE}/current-orders`} className="text-sm text-[#667eea] font-semibold hover:underline">
          View Current Orders →
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
          <p className="text-gray-600 mb-4">You haven&apos;t completed any orders yet.</p>
          <Link
            href={BASE}
            className="inline-block rounded-lg bg-[#667eea] px-6 py-2 text-white font-semibold hover:bg-indigo-600 transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div>
                  <p className="text-xs text-gray-400">Order #{order.id.slice(0, 8)}...</p>
                  {order.business && (
                    <p className="text-sm font-medium text-gray-700">{order.business.name}</p>
                  )}
                  <p className="text-lg font-bold text-gray-900 mt-1">₦{order.total.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <span className="inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
                    {order.status}
                  </span>
                  <p className="text-xs text-gray-400 mt-1">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {order.items && order.items.length > 0 && (
                <div className="border-t border-gray-100 pt-3 space-y-1">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm text-gray-600">
                      <span>
                        {item.product.name} × {item.quantity}
                        {item.selectedVariants && (
                          <span className="text-gray-400"> ({item.selectedVariants})</span>
                        )}
                      </span>
                      <span>₦{(item.product.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}

              {order.isDisputed && (
                <div className="mt-3 rounded-lg bg-red-50 border border-red-200 p-3">
                  <p className="text-xs font-semibold text-red-700">Dispute Raised</p>
                  {order.disputeReason && (
                    <p className="text-xs text-red-600 mt-1">{order.disputeReason}</p>
                  )}
                  {order.disputeCreatedAt && (
                    <p className="text-xs text-red-500 mt-1">
                      {new Date(order.disputeCreatedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
