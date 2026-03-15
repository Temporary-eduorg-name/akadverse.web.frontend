'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import LoadingSpinner from '@/src/LoadingSpinner';

const BASE = '/admindashboard/main-menu/marketplace';

interface OrderItem {
  id: string;
  productId: string;
  product: { name: string };
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  total: number;
  status: string;
  createdAt: string;
  orderItems: OrderItem[];
}

const STATUS_FILTERS = ['all', 'pending', 'active', 'completed', 'disputed'];

export default function ActivityOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState<string>('all');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/marketplace/orders/current', {
          credentials: 'include',
        });

        if (response.status === 401) {
          router.push('/login');
          return;
        }

        if (!response.ok) {
          setError('Failed to fetch orders');
          setLoading(false);
          return;
        }

        const data = await response.json();
        const allOrders: Order[] = data.orders || [];
        setOrders(allOrders);
        setFilteredOrders(allOrders);
      } catch {
        setError('An error occurred while fetching orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [router]);

  const handleStatusFilter = (status: string) => {
    setActiveStatus(status);
    if (status === 'all') {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter((o) => o.status.toLowerCase() === status));
    }
  };

  const statusColor: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    active: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    disputed: 'bg-red-100 text-red-800',
    all: 'bg-gray-100 text-gray-700',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-red-700">{error}</p>
          <Link href={BASE} className="mt-4 inline-block text-[#667eea] font-semibold hover:underline">
            Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Order Activity</h1>
        <p className="text-gray-500 mt-1">Track all your marketplace orders by status.</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {STATUS_FILTERS.map((status) => {
          const count = status === 'all' ? orders.length : orders.filter((o) => o.status.toLowerCase() === status).length;
          return (
            <button
              key={status}
              onClick={() => handleStatusFilter(status)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold capitalize transition-colors ${
                activeStatus === status
                  ? 'bg-[#667eea] text-white'
                  : `${statusColor[status] || 'bg-gray-100 text-gray-700'} hover:opacity-80`
              }`}
            >
              {status} ({count})
            </button>
          );
        })}
      </div>

      {filteredOrders.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
          <p className="text-gray-600">No {activeStatus !== 'all' ? activeStatus : ''} orders found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => (
            <div key={order.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-gray-400">Order #{order.id.slice(0, 8)}...</p>
                  <p className="text-lg font-bold text-gray-900">₦{order.total.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">{new Date(order.createdAt).toLocaleString()}</p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                    statusColor[order.status.toLowerCase()] || 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {order.status}
                </span>
              </div>
              {order.orderItems && order.orderItems.length > 0 && (
                <div className="mt-3 border-t border-gray-100 pt-3 space-y-1">
                  {order.orderItems.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm text-gray-600">
                      <span>{item.product.name} × {item.quantity}</span>
                      <span>₦{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
