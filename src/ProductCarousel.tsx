"use client";

import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import Link from "next/link";
import LoadingSpinner from "./LoadingSpinner";
import ProductDetailModal from "./ProductDetailModal";
import { handleViewProductDetails } from "@/utils/productDetailHandler";
import { formatNaira } from "@/utils/currency";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  cost: number;
  stock: number;
  rating: number;
  image?: string;
  secure_url?: string;
  public_id?: string;
  business: {
    id: string;
    name: string;
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
  business: {
    id: string;
    name: string;
  };
  variants: Array<{
    id: string;
    price: number;
    isCustomPrice: boolean;
    stock: number;
    variantValues: Array<{
      id: string;
      value: {
        id: string;
        value: string;
        field: {
          id: string;
          name: string;
        };
      };
    }>;
  }>;
  variantFields: Array<{
    id: string;
    name: string;
  }>;
}

interface ProductDetailsResponse {
  product: ProductDetails;
}

export default function ProductCarousel() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState<string | null>(null);
  const [productData, setProductData] = useState<ProductDetails | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/marketplace/products");
        if (response.ok) {
          const data = await response.json();
          setProducts(data.products || []);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="w-full py-12">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <>
      {productData && (
        <ProductDetailModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          product={productData}
        />
      )}

      <div className="w-full py-8 lg:my-14">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-8">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900 mb-2">New Products</h2>
            </div>
          </div>
          <div className="relative">
            <Swiper
              modules={[Autoplay, Navigation]}
              spaceBetween={16}
              slidesPerView={1}
              navigation
              loop
              autoplay={{
                delay: 3000,
                disableOnInteraction: false,
              }}
              speed={500}
              breakpoints={{
                640: { slidesPerView: 2 },
                768: { slidesPerView: 3 },
                1024: { slidesPerView: 4 },
              }}
              className="product-carousel"
            >
              {products.map((product) => (
                <>
                  <SwiperSlide key={product.id} className="!w-[260px] mx-2">
                    <div
                      className="group flex flex-col w-[260px] bg-white rounded-2xl overflow-hidden border border-slate-200/60 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer"
                    >
                      {/* Product Image with Hover Overlay */}
                      <div
                        className="aspect-[4/3] relative overflow-hidden bg-slate-100"
                        onMouseEnter={() => setHoveredProduct(product.id)}
                        onMouseLeave={() => setHoveredProduct(null)}
                      >
                        {product.secure_url || product.image ? (
                          <img
                            src={product.secure_url || product.image}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 rounded-t-2xl"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-200 to-zinc-300">
                            <span className="text-zinc-400 text-sm">No Image</span>
                          </div>
                        )}
                        {hoveredProduct === product.id && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewProductDetails<ProductDetailsResponse>(product.id, e, {
                                  onLoadStart: (id) => setLoadingDetails(id),
                                  onLoadEnd: () => setLoadingDetails(null),
                                  onSuccess: (data) => {
                                    setProductData(data.product);
                                    setModalOpen(true);
                                  },
                                  onError: () => { },
                                });
                              }}
                              disabled={loadingDetails === product.id}
                              className="bg-white text-zinc-900 px-6 py-3 rounded-lg font-semibold hover:bg-zinc-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {loadingDetails === product.id ? "Loading..." : "View Details"}
                            </button>
                          </div>
                        )}
                      </div>
                      {/* Product Details */}
                      <div className="flex-1 flex flex-col justify-between p-4">
                        <div>
                          <h4 className="font-bold text-slate-900 truncate mb-1" title={product.name}>{product.name}</h4>
                          <p className="text-xs text-slate-500 font-medium truncate mb-2">by {product.business.name}</p>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <span className="font-bold text-indigo-600 text-lg">{formatNaira(product.price)}</span>
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>
                </>



              ))}
            </Swiper>
          </div>
        </div>
      </div>
    </>
  );
}

