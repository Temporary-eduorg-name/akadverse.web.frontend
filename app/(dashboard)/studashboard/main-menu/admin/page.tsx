'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import DashboardNavbar from '@/app/components/dashboard/student/DashboardNavbar';
import DashboardSidebar from '@/app/components/dashboard/student/DashboardSidebar';
import LoadingSpinner from '@/src/LoadingSpinner';

type AdminStats = {
  totalUsers: number;
  totalSkillOwners: number;
  totalBusinesses: number;
  totalProducts: number;
  totalDisputes: number;
};

type DisputeItem = {
  id: string;
  type: 'order' | 'offer';
  status: string;
  totalAmount: number;
  disputeReason: string | null;
  disputeCreatedAt: string | null;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  business: {
    id: string;
    name: string;
    userId: string;
  };
};

type SuggestionItem = {
  id: string;
  category: string;
  message: string;
  hasAttachments: boolean;
  attachmentCount: number;
  attachmentNames: string[] | null;
  status: string;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
};

const categoryBadgeClass = (category: string) => {
  if (category === 'feature') return 'bg-indigo-100 text-indigo-800';
  if (category === 'bug') return 'bg-rose-100 text-rose-800';
  if (category === 'suggestion') return 'bg-emerald-100 text-emerald-800';
  return 'bg-slate-100 text-slate-800';
};

export default function MainMenuAdminPage() {
  const [sidebarWidth, setSidebarWidth] = useState(256);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [disputes, setDisputes] = useState<DisputeItem[]>([]);
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [activeTab, setActiveTab] = useState<'disputes' | 'suggestions'>('disputes');
  const [activeDisputeTab, setActiveDisputeTab] = useState<'all' | 'orders' | 'offers'>('all');

  const mainStyle = useMemo(
    () => ({ '--sidebar-width': `${sidebarWidth}px` } as React.CSSProperties),
    [sidebarWidth],
  );

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const userResponse = await fetch('/api/marketplace/user', {
          credentials: 'include',
        });

        if (!userResponse.ok) {
          setError('You need to be logged in to access this page.');
          return;
        }

        const userData = await userResponse.json();
        if (userData?.user?.role !== 'super-admin') {
          setError('Super-admin access required.');
          return;
        }

        setAuthorized(true);

        const [statsResponse, disputesResponse, suggestionsResponse] = await Promise.all([
          fetch('/api/marketplace/admin/stats', { credentials: 'include' }),
          fetch('/api/marketplace/admin/disputes', { credentials: 'include' }),
          fetch('/api/marketplace/suggestions', { credentials: 'include' }),
        ]);

        if (!statsResponse.ok || !disputesResponse.ok || !suggestionsResponse.ok) {
          throw new Error('Failed to load admin dashboard data.');
        }

        const statsData = await statsResponse.json();
        const disputesData = await disputesResponse.json();
        const suggestionsData = await suggestionsResponse.json();

        setStats(statsData.stats || null);
        setDisputes(disputesData.disputes || []);
        setSuggestions(suggestionsData.suggestions || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load admin dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  const orderDisputes = disputes.filter((item) => item.type === 'order');
  const offerDisputes = disputes.filter((item) => item.type === 'offer');

  return (
    <div className="min-h-screen bg-[#f8f9fc] font-sans">
      <DashboardNavbar />

      <div className="relative" style={{ minHeight: 'calc(100vh - 70px)' }}>
        <DashboardSidebar onWidthChange={setSidebarWidth} />

        <div
          style={mainStyle}
          className="ml-0 lg:ml-[var(--sidebar-width)] transition-[margin] duration-300 ease-out p-6 lg:p-7 min-w-0"
        >
          {loading ? (
            <div className="min-h-[60vh] flex items-center justify-center">
              <LoadingSpinner size="md" />
            </div>
          ) : error || !authorized ? (
            <div className="mx-auto max-w-5xl rounded-2xl border border-rose-200 bg-rose-50 p-6">
              <h1 className="text-2xl font-bold text-rose-900">Access Denied</h1>
              <p className="mt-2 text-rose-800">{error || 'You are not authorized to access this page.'}</p>
              <Link
                href="/studashboard/main-menu"
                className="inline-block mt-4 rounded-lg bg-rose-700 px-4 py-2 text-white hover:bg-rose-800 transition-colors"
              >
                Back to Main Menu
              </Link>
            </div>
          ) : (
            <div className="mx-auto max-w-7xl space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-[#2c3e50]">Super Admin Dashboard</h1>
                  <p className="text-[#2c3e50] opacity-80 mt-2">
                    Marketplace analytics, dispute management, and student suggestions in one place.
                  </p>
                </div>
                <Link
                  href="/studashboard/main-menu/marketplace/disputes"
                  className="rounded-lg border border-[#667eea] text-[#667eea] px-4 py-2 font-semibold hover:bg-[#667eea] hover:text-white transition-colors"
                >
                  Open Marketplace Disputes Page
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                  <p className="text-sm text-gray-500">Total Users</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.totalUsers ?? 0}</p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                  <p className="text-sm text-gray-500">Total Skill Owners</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.totalSkillOwners ?? 0}</p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                  <p className="text-sm text-gray-500">Total Businesses</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.totalBusinesses ?? 0}</p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                  <p className="text-sm text-gray-500">Total Products</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.totalProducts ?? 0}</p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                  <p className="text-sm text-gray-500">Total Disputes</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.totalDisputes ?? 0}</p>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('disputes')}
                    className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                      activeTab === 'disputes'
                        ? 'bg-[#667eea] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Disputes ({disputes.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('suggestions')}
                    className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                      activeTab === 'suggestions'
                        ? 'bg-[#667eea] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Suggestions ({suggestions.length})
                  </button>
                </div>
              </div>

              {activeTab === 'disputes' ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                      <p className="text-sm text-amber-800">Order Disputes</p>
                      <p className="text-2xl font-bold text-amber-900 mt-1">{orderDisputes.length}</p>
                    </div>
                    <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
                      <p className="text-sm text-orange-800">Offer Disputes</p>
                      <p className="text-2xl font-bold text-orange-900 mt-1">{offerDisputes.length}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setActiveDisputeTab('all')}
                      className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                        activeDisputeTab === 'all' ? 'bg-[#667eea] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      All ({disputes.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveDisputeTab('orders')}
                      className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                        activeDisputeTab === 'orders' ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Order Disputes ({orderDisputes.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveDisputeTab('offers')}
                      className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                        activeDisputeTab === 'offers' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Offer Disputes ({offerDisputes.length})
                    </button>
                  </div>

                  {(() => {
                    const visibleDisputes =
                      activeDisputeTab === 'orders'
                        ? orderDisputes
                        : activeDisputeTab === 'offers'
                        ? offerDisputes
                        : disputes;

                    return visibleDisputes.length === 0 ? (
                      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-600">
                        No{activeDisputeTab !== 'all' ? ` ${activeDisputeTab}` : ''} disputes found.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {visibleDisputes.map((item) => (
                          <div key={`${item.type}-${item.id}`} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-bold text-gray-900">
                                    {item.type === 'order' ? 'Order' : 'Skill Offer'} #{item.id.slice(0, 8)}
                                  </h3>
                                  <span
                                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                      item.type === 'order'
                                        ? 'bg-amber-100 text-amber-800'
                                        : 'bg-orange-100 text-orange-800'
                                    }`}
                                  >
                                    {item.type === 'order' ? 'Order' : 'Offer'}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600">
                                  {item.user.firstName} {item.user.lastName} ({item.user.email})
                                </p>
                                <p className="text-sm text-gray-600">Target: {item.business.name}</p>
                              </div>
                              <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-800">
                                Disputed
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 mt-3">{item.disputeReason || 'No reason provided'}</p>
                            <div className="mt-2 text-xs text-gray-500 flex flex-wrap gap-4">
                              <span>Amount: ₦{item.totalAmount.toLocaleString()}</span>
                              {item.disputeCreatedAt && <span>{new Date(item.disputeCreatedAt).toLocaleString()}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              ) : (
                <div className="space-y-3">
                  {suggestions.length === 0 ? (
                    <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-600">
                      No suggestions submitted yet.
                    </div>
                  ) : (
                    suggestions.map((item) => (
                      <div key={item.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${categoryBadgeClass(item.category)}`}>
                                {item.category}
                              </span>
                              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                                {item.status}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-2">
                              {item.user.firstName} {item.user.lastName} ({item.user.email})
                            </p>
                          </div>
                          <p className="text-xs text-gray-500">{new Date(item.createdAt).toLocaleString()}</p>
                        </div>

                        <p className="text-gray-800 mt-3 whitespace-pre-wrap">{item.message}</p>

                        <div className="mt-3 text-xs text-gray-600">
                          {item.hasAttachments ? (
                            <span>
                              Attachments ({item.attachmentCount}): {(item.attachmentNames || []).join(', ') || 'provided'}
                            </span>
                          ) : (
                            <span>No attachments</span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
