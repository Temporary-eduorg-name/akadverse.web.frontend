'use client';

import { useEffect, useRef, useState } from 'react';
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
  items?: Array<{
    id: string;
    quantity: number;
    selectedVariants?: string | null;
    product: { id: string; name: string; price: number; images?: string[] };
  }>;
}

export default function CurrentOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/marketplace/orders/current', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
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

  const handleConfirmDelivery = async (orderId: string) => {
    if (!confirm('Confirm that you received this order from the seller?')) return;
    setActionLoading(orderId);
    try {
      const response = await fetch(`/api/marketplace/orders/${orderId}/deliver`, {
        method: 'POST',
        credentials: 'include',
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to confirm delivery');
      alert('Delivery confirmation sent. Share your OTP with the seller to complete the order.');
      await fetchOrders();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to confirm delivery');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRaiseDispute = async (orderId: string) => {
    const reason = prompt('Describe the issue with this order (minimum 10 characters):');
    if (!reason) return;
    setActionLoading(orderId);
    try {
      const response = await fetch(`/api/marketplace/orders/${orderId}/dispute`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to raise dispute');
      alert('Dispute raised successfully.');
      await fetchOrders();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to raise dispute');
    } finally {
      setActionLoading(null);
    }
  };

  const statusColor: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    active: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    disputed: 'bg-red-100 text-red-800',
  };

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
          <h1 className="text-3xl font-bold text-gray-900">Current Orders</h1>
          <p className="text-gray-500 mt-1">
            {orders.length === 0 ? 'No active orders' : `${orders.length} active order${orders.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <Link href={`${BASE}/order-history`} className="text-sm text-[#667eea] font-semibold hover:underline">
          View Order History →
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
          <p className="text-gray-600 mb-4">You have no current orders.</p>
          <Link
            href={BASE}
            className="inline-block rounded-lg bg-[#667eea] px-6 py-2 text-white font-semibold hover:bg-indigo-600 transition-colors"
          >
            Browse Marketplace
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
                  <span
                    className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                      statusColor[order.status.toLowerCase()] || 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {order.status}
                  </span>
                  {order.expectedDeliveryDate && (
                    <p className="text-xs text-gray-500 mt-1">
                      Expected: {new Date(order.expectedDeliveryDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>

              {order.items && order.items.length > 0 && (
                <div className="border-t border-gray-100 pt-3 space-y-1">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm text-gray-600">
                      <span>
                        {item.product.name} × {item.quantity}
                      </span>
                      <span>₦{(item.product.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}

              {!order.isDisputed && order.status.toLowerCase() !== 'completed' && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {order.status.toLowerCase() === 'active' && (
                    <button
                      onClick={() => handleConfirmDelivery(order.id)}
                      disabled={actionLoading === order.id}
                      className="rounded-lg bg-green-600 px-4 py-2 text-sm text-white font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      {actionLoading === order.id ? 'Processing...' : 'Confirm Delivery'}
                    </button>
                  )}
                  <button
                    onClick={() => handleRaiseDispute(order.id)}
                    disabled={actionLoading === order.id}
                    className="rounded-lg border border-red-500 text-red-600 px-4 py-2 text-sm font-semibold hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    Raise Dispute
                  </button>
                </div>
              )}

              {order.isDisputed && (
                <p className="mt-3 text-xs text-red-600 font-semibold">
                  ⚠ Dispute raised — awaiting super-admin review
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
