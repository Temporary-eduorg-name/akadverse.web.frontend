"use client";

import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import Link from "next/link";
import LoadingSpinner from "./LoadingSpinner";
import ProductDetailModal from "./ProductDetailModal";
import { handleViewProductDetails } from "@/utils/productDetailHandler";
import { formatNaira } from "@/utils/currency";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    rating: number;
    image?: string;
    secure_url?: string;
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

export default function TrendingProductsCarousel() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [loadingDetails, setLoadingDetails] = useState<string | null>(null);
    const [productData, setProductData] = useState<ProductDetails | null>(null);

    useEffect(() => {
        const fetchTrendingProducts = async () => {
            try {
                const response = await fetch("/api/marketplace/products/trending");
                if (response.ok) {
                    const data = await response.json();
                    setProducts(data.products || []);
                }
            } catch (error) {
                console.error("Error fetching trending products:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTrendingProducts();
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

            <div className="w-full py-12 bg-white dark:bg-zinc-900">
            <div className="max-w-7xl mx-auto px-4">
                <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-8 text-center">
                    Trending Products
                </h2>

                <div className="relative">
                    <Swiper
                        modules={[Autoplay, Navigation]}
                        spaceBetween={20}
                        slidesPerView={1}
                        navigation={true}
                        autoplay={{
                            delay: 0,
                            disableOnInteraction: false,
                            reverseDirection: true,
                        }}
                        speed={5000}
                        loop={true}
                        allowTouchMove={true}
                        freeMode
                        breakpoints={{
                            640: {
                                slidesPerView: 2,
                                spaceBetween: 20,
                            },
                            768: {
                                slidesPerView: 3,
                                spaceBetween: 24,
                            },
                            1024: {
                                slidesPerView: 4,
                                spaceBetween: 30,
                            },
                        }}
                        className="trending-product-carousel"
                    >
                        {products.map((product) => (
                            <SwiperSlide key={product.id}>
                                <div
                                    className="bg-zinc-50 dark:bg-zinc-800 rounded-lg shadow-lg overflow-hidden border border-zinc-200 dark:border-zinc-700 hover:shadow-xl transition-shadow"
                                >
                                    <div
                                        className="relative"
                                        onMouseEnter={() => setHoveredProduct(product.id)}
                                        onMouseLeave={() => setHoveredProduct(null)}
                                    >
                                        {product.secure_url || product.image ? (
                                            <img
                                                src={product.secure_url || product.image}
                                                alt={product.name}
                                                className="w-full h-48 object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-48 bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-700 dark:to-zinc-800 flex items-center justify-center">
                                                <span className="text-zinc-400 dark:text-zinc-500 text-sm">
                                                    No Image
                                                </span>
                                            </div>
                                        )}

                                        {hoveredProduct === product.id && (
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                <button
                                                    onClick={(e) =>
                                                        handleViewProductDetails<ProductDetailsResponse>(product.id, e, {
                                                            onLoadStart: (id) => setLoadingDetails(id),
                                                            onLoadEnd: () => setLoadingDetails(null),
                                                            onSuccess: (data) => {
                                                                setProductData(data.product);
                                                                setModalOpen(true);
                                                            },
                                                            onError: () => {},
                                                        })
                                                    }
                                                    disabled={loadingDetails === product.id}
                                                    className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white px-6 py-3 rounded-lg font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {loadingDetails === product.id ? "Loading..." : "View Details"}
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-4">
                                        <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2 line-clamp-1">
                                            {product.name}
                                        </h3>

                                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3 line-clamp-2">
                                            {product.description}
                                        </p>

                                        <div className="flex justify-between items-center mb-2">
                                            <div>
                                                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                                    Price
                                                </p>
                                                <p className="text-xl font-bold text-zinc-900 dark:text-white">
                                                    {formatNaira(product.price)}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                                    Rating
                                                </p>
                                                <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                                                    {product.rating.toFixed(1)} ⭐
                                                </p>
                                            </div>
                                        </div>

                                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                                            By: <Link href={`/business/${product.business.id}`} className="hover:underline text-zinc-700 dark:text-zinc-300 font-medium" onClick={(e) => e.stopPropagation()}>{product.business.name}</Link>
                                        </p>

                                        <p className="text-xs text-zinc-600 dark:text-zinc-400">
                                            {product.stock > 0 ? (
                                                <span className="text-green-600 dark:text-green-400">
                                                    In Stock ({product.stock} units)
                                                </span>
                                            ) : (
                                                <span className="text-red-600 dark:text-red-400">
                                                    Out of Stock
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            </div>
        </div>
        </>
    );
}

