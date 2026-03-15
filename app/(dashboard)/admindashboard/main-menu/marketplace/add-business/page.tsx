'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const BASE = '/admindashboard/main-menu/marketplace';
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TIMES = [
  '12AM','1AM','2AM','3AM','4AM','5AM','6AM','7AM','8AM','9AM','10AM','11AM',
  '12PM','1PM','2PM','3PM','4PM','5PM','6PM','7PM','8PM','9PM','10PM','11PM',
];

interface Bank { code: string; name: string }

export default function AddBusinessPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '', industry: '', description: '', paymentMethod: '',
    bankName: '', accountNumber: '', accountHolderName: '', location: '',
    serviceDays: [] as string[], serviceTimeFrom: '', serviceTimeTo: '',
    instagram: '', linkedin: '', website: '',
  });
  const [banks, setBanks] = useState<Bank[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifyingAccount, setVerifyingAccount] = useState(false);
  const [loadingBanks, setLoadingBanks] = useState(false);

  useEffect(() => {
    const fetchBanks = async () => {
      setLoadingBanks(true);
      try {
        const response = await fetch('/api/marketplace/paystack/banks');
        const data = await response.json();
        if (response.ok) setBanks(data.banks);
        else setError('Failed to load banks');
      } catch { setError('An error occurred while loading banks'); }
      finally { setLoadingBanks(false); }
    };
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/marketplace/categories');
        if (response.ok) {
          const data = await response.json();
          setCategories(data.categories || []);
        }
      } catch { /* silent */ }
    };
    fetchBanks();
    fetchCategories();
  }, []);

  useEffect(() => {
    if (!formData.bankName || !formData.accountNumber || formData.accountNumber.length < 10) return;
    const verifyAccount = async () => {
      setVerifyingAccount(true);
      setError('');
      try {
        const response = await fetch('/api/marketplace/paystack/verify-account', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bankName: formData.bankName, accountNumber: formData.accountNumber }),
        });
        const result = await response.json();
        if (!response.ok) { setError(result.error || 'Failed to verify account'); return; }
        setFormData((prev) => ({ ...prev, accountHolderName: result.accountHolderName }));
      } catch { setError('An error occurred while verifying account'); }
      finally { setVerifyingAccount(false); }
    };
    verifyAccount();
  }, [formData.bankName, formData.accountNumber]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDayToggle = (day: string) => {
    setFormData((prev) => ({
      ...prev,
      serviceDays: prev.serviceDays.includes(day)
        ? prev.serviceDays.filter((d) => d !== day)
        : [...prev.serviceDays, day],
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    if (formData.serviceDays.length === 0) { setError('Please select at least one service day'); return; }
    if (!formData.serviceTimeFrom || !formData.serviceTimeTo) { setError('Please select both start and end service times'); return; }
    setLoading(true);
    try {
      const submitData = {
        ...formData,
        serviceDays: formData.serviceDays.join(', '),
        serviceTimes: `${formData.serviceTimeFrom} to ${formData.serviceTimeTo}`,
      };
      const response = await fetch('/api/marketplace/businesses/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
        credentials: 'include',
      });
      const result = await response.json();
      if (!response.ok) { setError(result.error || 'Something went wrong'); setLoading(false); return; }
      router.push(BASE);
    } catch { setError('An error occurred. Please try again.'); setLoading(false); }
  };

  const inputClass = 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#667eea] bg-white text-gray-900';
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1';

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Create a Business</h1>
        <p className="text-gray-500 mt-1">Set up your business on the marketplace to start selling.</p>
      </div>

      {error && (
        <div className="mb-5 rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div>
          <label htmlFor="name" className={labelClass}>Business Name *</label>
          <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className={inputClass} required />
        </div>

        <div>
          <label htmlFor="industry" className={labelClass}>Industry *</label>
          <select id="industry" name="industry" value={formData.industry} onChange={handleChange} className={inputClass} required>
            <option value="">Select an industry</option>
            {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>

        <div>
          <label htmlFor="description" className={labelClass}>Bio / Description *</label>
          <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={4} className={inputClass} required />
        </div>

        <div>
          <label htmlFor="location" className={labelClass}>Location *</label>
          <input type="text" id="location" name="location" placeholder="e.g., Lagos, Nigeria" value={formData.location} onChange={handleChange} className={inputClass} required />
        </div>

        <div>
          <label className={labelClass}>Service Days *</label>
          <div className="flex flex-wrap gap-2 mt-1">
            {DAYS.map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => handleDayToggle(day)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  formData.serviceDays.includes(day)
                    ? 'bg-[#667eea] text-white'
                    : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
          {formData.serviceDays.length > 0 && (
            <p className="text-xs text-gray-500 mt-2">Active on: {formData.serviceDays.join(', ')}</p>
          )}
        </div>

        <div>
          <label className={labelClass}>Service Hours *</label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="serviceTimeFrom" className="block text-xs text-gray-500 mb-1">From</label>
              <select id="serviceTimeFrom" name="serviceTimeFrom" value={formData.serviceTimeFrom} onChange={handleChange} className={inputClass} required>
                <option value="">Select time</option>
                {TIMES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="serviceTimeTo" className="block text-xs text-gray-500 mb-1">To</label>
              <select id="serviceTimeTo" name="serviceTimeTo" value={formData.serviceTimeTo} onChange={handleChange} className={inputClass} required>
                <option value="">Select time</option>
                {TIMES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          {formData.serviceTimeFrom && formData.serviceTimeTo && (
            <p className="text-xs text-gray-500 mt-1">{formData.serviceTimeFrom} – {formData.serviceTimeTo}</p>
          )}
        </div>

        <div className="border-t border-gray-200 pt-5">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Social Links (Optional)</h2>
          <div className="space-y-3">
            <div>
              <label htmlFor="instagram" className={labelClass}>Instagram</label>
              <input type="url" id="instagram" name="instagram" placeholder="https://instagram.com/..." value={formData.instagram} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label htmlFor="linkedin" className={labelClass}>LinkedIn</label>
              <input type="url" id="linkedin" name="linkedin" placeholder="https://linkedin.com/in/..." value={formData.linkedin} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label htmlFor="website" className={labelClass}>Website</label>
              <input type="url" id="website" name="website" placeholder="https://yourwebsite.com" value={formData.website} onChange={handleChange} className={inputClass} />
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-5">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Payment Details</h2>
          <div>
            <label htmlFor="paymentMethod" className={labelClass}>Preferred Payment Method *</label>
            <select id="paymentMethod" name="paymentMethod" value={formData.paymentMethod} onChange={handleChange} className={inputClass} required>
              <option value="">Select payment method</option>
              <option value="cash">Cash</option>
              <option value="transfer">Bank Transfer</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label htmlFor="bankName" className={labelClass}>Bank Name *</label>
              <select id="bankName" name="bankName" value={formData.bankName} onChange={handleChange} className={inputClass} disabled={loadingBanks}>
                <option value="">{loadingBanks ? 'Loading banks...' : 'Select a bank'}</option>
                {banks.map((b) => <option key={b.name} value={b.name}>{b.name}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="accountNumber" className={labelClass}>Account Number *</label>
              <input type="text" id="accountNumber" name="accountNumber" placeholder="10 digits" maxLength={10} value={formData.accountNumber} onChange={handleChange} className={inputClass} />
            </div>
          </div>
          {verifyingAccount && (
            <p className="mt-2 text-sm text-blue-600">Verifying account…</p>
          )}
          {formData.accountHolderName && !verifyingAccount && !error && (
            <div className="mt-2 rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-800">
              Account holder: <strong>{formData.accountHolderName}</strong>
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 rounded-lg bg-[#667eea] py-3 text-white font-semibold hover:bg-indigo-600 transition-colors disabled:opacity-50"
          >
            {loading ? 'Creating…' : 'Create Business'}
          </button>
          <Link
            href={BASE}
            className="flex-1 text-center rounded-lg bg-gray-100 py-3 text-gray-700 font-semibold hover:bg-gray-200 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
