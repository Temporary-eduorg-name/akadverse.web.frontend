'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/src/LoadingSpinner';

const BASE = '/admindashboard/main-menu/marketplace';

interface SkillOffer {
  id: string;
  skillId: string;
  skillName: string;
  skillOwnerName: string;
  skillOwnerEmail: string;
  status: 'pending' | 'negotiated' | 'ongoing' | 'completed' | 'rejected' | 'cancelled' | 'disputed' | 'ignored';
  description: string;
  originalPrice: number;
  currentPrice: number | null;
  skillOwnerAcceptedPrice: number | null;
  buyerAcceptedPrice: number | null;
  rejectedBy: string | null;
  cancelledBy: string | null;
  cancellationReason: string | null;
  disputeReason: string | null;
  disputedBy: string | null;
  offerFrom: string;
  offerTo: string;
  createdAt: string;
  updatedAt: string;
  latestCounterOffer?: {
    id: string;
    counterPrice: number;
    reason: string | null;
    madeBy: string;
    createdAt: string;
  } | null;
}

const ALL_STATUSES = [
  { key: 'all', label: 'All', color: 'bg-gray-100 text-gray-700' },
  { key: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  { key: 'negotiated', label: 'Negotiating', color: 'bg-blue-100 text-blue-800' },
  { key: 'ongoing', label: 'Ongoing', color: 'bg-purple-100 text-purple-800' },
  { key: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800' },
  { key: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-800' },
  { key: 'cancelled', label: 'Cancelled', color: 'bg-orange-100 text-orange-800' },
  { key: 'disputed', label: 'Disputed', color: 'bg-amber-100 text-amber-800' },
  { key: 'ignored', label: 'Ignored', color: 'bg-gray-100 text-gray-800' },
];

const statusBadge = (status: string) => {
  const found = ALL_STATUSES.find((s) => s.key === status);
  return found?.color ?? 'bg-gray-100 text-gray-800';
};

export default function ActivityOffersPage() {
  const router = useRouter();
  const [offers, setOffers] = useState<SkillOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState('all');
  const eventSourceRef = useRef<EventSource | null>(null);

  const fetchOffers = async (status = activeStatus) => {
    try {
      const params = new URLSearchParams();
      if (status !== 'all') params.set('status', status);
      const response = await fetch(`/api/marketplace/offers?${params}`, { credentials: 'include' });
      if (response.status === 401) {
        router.push('/login');
        return;
      }
      if (!response.ok) throw new Error('Failed to fetch offers');
      const data = await response.json();
      setOffers(data.offers || []);
    } catch (error) {
      console.error('Error fetching offers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers(activeStatus);
  }, [activeStatus]);

  useEffect(() => {
    const es = new EventSource('/api/marketplace/realtime/events?scope=buyer');
    eventSourceRef.current = es;
    es.addEventListener('update', () => fetchOffers(activeStatus));
    es.onerror = () => { es.close(); eventSourceRef.current = null; };
    return () => { es.close(); eventSourceRef.current = null; };
  }, []);

  const handleAccept = async (offerId: string) => {
    try {
      const response = await fetch(`/api/marketplace/offers/${offerId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'accept' }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to accept offer');
      setOffers((prev) => prev.map((o) => (o.id === offerId ? { ...o, status: 'ongoing' } : o)));
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to accept offer');
    }
  };

  const handleReject = async (offerId: string) => {
    try {
      const response = await fetch(`/api/marketplace/offers/${offerId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject' }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to reject offer');
      setOffers((prev) => prev.map((o) => (o.id === offerId ? { ...o, status: 'rejected', rejectedBy: 'buyer' } : o)));
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to reject offer');
    }
  };

  const handleNegotiate = async (offerId: string) => {
    const priceStr = prompt('Enter your counter-offer price (₦):');
    if (!priceStr) return;
    const price = parseFloat(priceStr);
    if (isNaN(price) || price <= 0) { alert('Invalid price'); return; }
    const reason = prompt('Reason for counter-offer (optional):') ?? undefined;
    try {
      const response = await fetch(`/api/marketplace/offers/${offerId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'negotiate', counterPrice: price, reason }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to negotiate');
      await fetchOffers(activeStatus);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to negotiate');
    }
  };

  const handleCancel = async (offerId: string) => {
    const reason = prompt('Reason for cancellation:');
    if (!reason) return;
    try {
      const response = await fetch(`/api/marketplace/offers/${offerId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel', reason }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to cancel');
      setOffers((prev) => prev.map((o) => (o.id === offerId ? { ...o, status: 'cancelled', cancelledBy: 'buyer', cancellationReason: reason } : o)));
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to cancel');
    }
  };

  const filteredOffers = activeStatus === 'all' ? offers : offers.filter((o) => o.status === activeStatus);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Offers</h1>
        <p className="text-gray-500 mt-1">Track skill offers you&apos;ve made by status.</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {ALL_STATUSES.map(({ key, label }) => {
          const count = key === 'all' ? offers.length : offers.filter((o) => o.status === key).length;
          return (
            <button
              key={key}
              onClick={() => setActiveStatus(key)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold capitalize transition-colors ${
                activeStatus === key ? 'bg-[#667eea] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {label} ({count})
            </button>
          );
        })}
      </div>

      {filteredOffers.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
          <p className="text-gray-600">No {activeStatus !== 'all' ? activeStatus : ''} offers found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOffers.map((offer) => {
            const displayPrice =
              offer.skillOwnerAcceptedPrice ??
              offer.buyerAcceptedPrice ??
              offer.currentPrice ??
              offer.originalPrice;

            return (
              <div key={offer.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{offer.skillName}</h3>
                    <p className="text-sm text-gray-500">By {offer.skillOwnerName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-gray-900">₦{displayPrice.toLocaleString()}</p>
                    <span className={`inline-block mt-1 rounded-full px-3 py-0.5 text-xs font-semibold capitalize ${statusBadge(offer.status)}`}>
                      {offer.status}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-3">{offer.description}</p>

                <div className="flex gap-4 text-xs text-gray-500 mb-3">
                  <span>From: {new Date(offer.offerFrom).toLocaleDateString()}</span>
                  <span>To: {new Date(offer.offerTo).toLocaleDateString()}</span>
                  <span>Original: ₦{offer.originalPrice.toLocaleString()}</span>
                </div>

                {offer.latestCounterOffer && offer.status === 'negotiated' && (
                  <div className="mb-3 rounded-lg bg-indigo-50 border border-indigo-200 p-3 text-sm">
                    <p className="font-semibold text-indigo-800">
                      Counter offer: ₦{offer.latestCounterOffer.counterPrice.toLocaleString()} —{' '}
                      <span className="font-normal">{offer.latestCounterOffer.madeBy === 'buyer' ? 'You' : 'Skill Owner'}</span>
                    </p>
                    {offer.latestCounterOffer.reason && (
                      <p className="text-indigo-700 mt-1 italic">{offer.latestCounterOffer.reason}</p>
                    )}
                  </div>
                )}

                {offer.cancellationReason && (
                  <div className="mb-3 rounded-lg bg-orange-50 border border-orange-200 p-3 text-sm text-orange-800">
                    Cancelled: {offer.cancellationReason}
                  </div>
                )}

                {offer.disputeReason && (
                  <div className="mb-3 rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
                    Dispute: {offer.disputeReason}
                  </div>
                )}

                {offer.status === 'negotiated' && offer.latestCounterOffer?.madeBy !== 'buyer' && (
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleAccept(offer.id)}
                      className="rounded-lg bg-green-600 px-4 py-2 text-sm text-white font-semibold hover:bg-green-700 transition-colors"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleReject(offer.id)}
                      className="rounded-lg border border-red-400 text-red-600 px-4 py-2 text-sm font-semibold hover:bg-red-50 transition-colors"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleNegotiate(offer.id)}
                      className="rounded-lg bg-[#667eea] px-4 py-2 text-sm text-white font-semibold hover:bg-indigo-600 transition-colors"
                    >
                      Counter Offer
                    </button>
                  </div>
                )}

                {offer.status === 'ongoing' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCancel(offer.id)}
                      className="rounded-lg border border-orange-400 text-orange-600 px-4 py-2 text-sm font-semibold hover:bg-orange-50 transition-colors"
                    >
                      Cancel Order
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
