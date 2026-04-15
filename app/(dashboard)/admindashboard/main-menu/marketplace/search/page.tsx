'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import LoadingSpinner from '@/src/LoadingSpinner';
import ProductDetailModal from '@/src/ProductDetailModal';

const BASE = '/admindashboard/main-menu/marketplace';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  rating: number;
  secure_url?: string;
  image?: string;
  business: {
    id: string;
    name: string;
    industry: string;
  };
}

interface ProductDetails {
  id: string;
  name: string;
  description: string;
  price: number;
  secure_url?: string;
  stock: number;
  rating: number;
  business: { id: string; name: string };
  variants: Array<{
    id: string;
    price: number;
    isCustomPrice: boolean;
    stock: number;
    variantValues: Array<{
      id: string;
      value: { id: string; value: string; field: { id: string; name: string } };
    }>;
  }>;
  variantFields: Array<{ id: string; name: string }>;
}

interface Business {
  id: string;
  name: string;
  industry: string;
  description: string;
  location: string;
  _count: { products: number };
}

interface Skill {
  id: string;
  name: string;
  description: string;
  displayName: string;
  expertiseLevel: string;
  profilePicture?: string;
  yearsOfExperience: number;
  startingPrice: number;
  user: { id: string; firstName: string; lastName: string };
  _count?: { offers: number; reviews: number };
}

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const skillType = searchParams.get('skillType') || '';

  const [products, setProducts] = useState<Product[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState<string | null>(null);
  const [productData, setProductData] = useState<ProductDetails | null>(null);

  useEffect(() => {
    if (!query) {
      setLoading(false);
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ q: query });
        if (category) params.set('category', category);
        if (skillType) params.set('skillType', skillType);

        const response = await fetch(`/api/marketplace/search?${params.toString()}`);
        if (response.ok) {
          const data = await response.json();
          setProducts(data.products || []);
          setBusinesses(data.businesses || []);
          setSkills(data.skills || []);
        }
      } catch (error) {
        console.error('Error fetching search results:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query, category, skillType]);

  if (!query) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Search the Marketplace</h1>
          <p className="text-gray-600 mb-6">Enter a search term to find products, businesses, or skills.</p>
          <Link
            href={BASE}
            className="inline-block rounded-lg bg-[#667eea] px-6 py-2 text-white font-semibold hover:bg-indigo-600 transition-colors"
          >
            Browse Marketplace
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  const totalResults = products.length + businesses.length + skills.length;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Search results for <span className="text-[#667eea]">&ldquo;{query}&rdquo;</span>
        </h1>
        <p className="text-gray-500 mt-1">
          {totalResults === 0
            ? 'No results found'
            : `${totalResults} result${totalResults !== 1 ? 's' : ''} found`}
        </p>
      </div>

      {totalResults === 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
          <p className="text-gray-600 mb-4">No results matched your search.</p>
          <Link href={BASE} className="text-[#667eea] font-semibold hover:underline">
            Back to Marketplace
          </Link>
        </div>
      )}

      {products.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Products ({products.length})</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={async () => {
                  setLoadingDetails(product.id);
                  try {
                    const res = await fetch(`/api/marketplace/products/${product.id}/details`);
                    if (res.ok) {
                      const data = await res.json();
                      setProductData(data.product);
                      setModalOpen(true);
                    }
                  } finally {
                    setLoadingDetails(null);
                  }
                }}
              >
                {product.secure_url && (
                  <img
                    src={product.secure_url}
                    alt={product.name}
                    className="w-full h-40 object-cover rounded-lg mb-3"
                  />
                )}
                <h3 className="font-semibold text-gray-900 truncate">{product.name}</h3>
                <p className="text-sm text-gray-500 truncate">{product.business.name}</p>
                <p className="text-[#667eea] font-bold mt-2">₦{product.price.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {businesses.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Businesses ({businesses.length})</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {businesses.map((biz) => (
              <Link
                key={biz.id}
                href={`${BASE}/business/${biz.id}`}
                className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow block"
              >
                <h3 className="font-semibold text-gray-900">{biz.name}</h3>
                <p className="text-sm text-[#667eea]">{biz.industry}</p>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{biz.description}</p>
                <p className="text-xs text-gray-400 mt-2">
                  {biz._count.products} product{biz._count.products !== 1 ? 's' : ''} &middot; {biz.location}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {skills.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Skills ({skills.length})</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {skills.map((skill) => (
              <Link
                key={skill.id}
                href={`${BASE}/skills/${skill.id}`}
                className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow block"
              >
                <h3 className="font-semibold text-gray-900">{skill.displayName || skill.name}</h3>
                <p className="text-sm text-gray-500">
                  {skill.user.firstName} {skill.user.lastName}
                </p>
                <p className="text-sm text-gray-400 capitalize">{skill.expertiseLevel}</p>
                <p className="text-[#667eea] font-bold mt-2">From ₦{skill.startingPrice.toLocaleString()}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {modalOpen && productData && (
        <ProductDetailModal
          isOpen={modalOpen}
          product={productData}
          onClose={() => {
            setModalOpen(false);
            setProductData(null);
          }}
        />
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="md" />
        </div>
      }
    >
      <SearchResults />
    </Suspense>
  );
}
