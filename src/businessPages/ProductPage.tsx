"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import ProductCreateForm from "@/components/ProductCreateForm";
import ProductCard from "@/components/ProductCard";
import LoadingSpinner from "../LoadingSpinner";

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
}

interface CreateProductForm {
  name: string;
  description: string;
  price: string;
  cost: string;
  stock: string;
  image?: File;
  variants: VariantFieldForm[];
}

type VariantPricingMode = "same" | "custom";

interface VariantOptionForm {
  id: string;
  value: string;
  pricingMode: VariantPricingMode;
  customPrice: string;
  stock: string;
}

interface VariantFieldForm {
  id: string;
  name: string;
  options: VariantOptionForm[];
}

export default function ProductsPage() {
  const router = useRouter();
  const params = useParams();
  const businessId = params.id as string;

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [creating, setCreating] = useState(false);

  const [formData, setFormData] = useState<CreateProductForm>({
    name: "",
    description: "",
    price: "",
    cost: "",
    stock: "",
    variants: [],
  });

  const createDefaultVariantOption = (): VariantOptionForm => ({
    id: crypto.randomUUID(),
    value: "",
    pricingMode: "same",
    customPrice: "",
    stock: formData.stock || "0",
  });

  const addVariantField = () => {
    setFormData((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        {
          id: crypto.randomUUID(),
          name: "",
          options: [createDefaultVariantOption()],
        },
      ],
    }));
  };

  const removeVariantField = (fieldId: string) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((field) => field.id !== fieldId),
    }));
  };

  const updateVariantFieldName = (fieldId: string, name: string) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.map((field) =>
        field.id === fieldId ? { ...field, name } : field
      ),
    }));
  };

  const addVariantOption = (fieldId: string) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.map((field) =>
        field.id === fieldId
          ? { ...field, options: [...field.options, createDefaultVariantOption()] }
          : field
      ),
    }));
  };

  const removeVariantOption = (fieldId: string, optionId: string) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.map((field) =>
        field.id === fieldId
          ? {
              ...field,
              options: field.options.filter((option) => option.id !== optionId),
            }
          : field
      ),
    }));
  };

  const updateVariantOption = (
    fieldId: string,
    optionId: string,
    changes: Partial<VariantOptionForm>
  ) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.map((field) =>
        field.id === fieldId
          ? {
              ...field,
              options: field.options.map((option) =>
                option.id === optionId ? { ...option, ...changes } : option
              ),
            }
          : field
      ),
    }));
  };

  useEffect(() => {
    fetchProducts();
  }, [businessId]);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`/api/businesses/${businessId}/products`, {
        method: "GET",
        credentials: "include",
      });

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }

      const data = await response.json();
      setProducts(data.products || []);
    } catch (err) {
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name === "image") {
      const inputElement = e.target as HTMLInputElement;
      setFormData((prev) => ({
        ...prev,
        image: inputElement.files?.[0],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setCreating(true);

    try {
      const productData = new FormData();
      productData.append("name", formData.name);
      productData.append("description", formData.description);
      productData.append("price", formData.price);
      productData.append("cost", formData.cost);
      productData.append("stock", formData.stock);
      const normalizedVariants = formData.variants
        .filter((field) => field.name.trim().length > 0)
        .map((field) => ({
          name: field.name.trim(),
          values: field.options
            .filter((option) => option.value.trim().length > 0)
            .map((option) => ({
              value: option.value.trim(),
              customPrice: option.pricingMode === "custom",
              price:
                option.pricingMode === "custom" && option.customPrice
                  ? option.customPrice
                  : formData.price,
              stock: parseInt(option.stock || formData.stock || "0", 10),
            })),
        }))
        .filter((field) => field.values.length > 0);
      productData.append("variants", JSON.stringify(normalizedVariants));
      if (formData.image) {
        productData.append("image", formData.image);
      }

      const response = await fetch(
        `/api/businesses/${businessId}/products`,
        {
          method: "POST",
          credentials: "include",
          body: productData,
        }
      );

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create product");
      }

      setSuccess("Product created successfully!");
      setFormData({
        name: "",
        description: "",
        price: "",
        cost: "",
        stock: "",
        variants: [],
      });
      setShowCreateForm(false);
      fetchProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const response = await fetch(
        `/api/businesses/${businessId}/products/${productId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to delete product");
      }

      setSuccess("Product deleted successfully!");
      fetchProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <LoadingSpinner size="md" />
          <p className="text-zinc-600 dark:text-zinc-400 mt-4">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
          Products
        </h2>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-4 py-2 rounded-md hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors font-medium"
        >
          {showCreateForm ? "Cancel" : "Add Product"}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-md">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 rounded-md">
          {success}
        </div>
      )}

      {/* Create Product Form */}
      {showCreateForm && (
        <ProductCreateForm
          formData={formData}
          onFormChange={handleFormChange}
          onAddVariantField={addVariantField}
          onRemoveVariantField={removeVariantField}
          onVariantFieldNameChange={updateVariantFieldName}
          onAddVariantOption={addVariantOption}
          onRemoveVariantOption={removeVariantOption}
          onVariantOptionChange={updateVariantOption}
          onSubmit={handleCreateProduct}
          isCreating={creating}
        />
      )}

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-500 dark:placeholder-zinc-400"
        />
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-zinc-600 dark:text-zinc-400">
            {searchQuery ? "No products found matching your search" : "No products yet"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onDelete={handleDeleteProduct}
              showViewDetails={false}
              editHref={`/dashboard/business/${businessId}/products/${product.id}/edit`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
