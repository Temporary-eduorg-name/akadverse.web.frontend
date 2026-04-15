"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import LoadingSpinner from "@/components/LoadingSpinner";

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

interface ProductForm {
  name: string;
  description: string;
  price: string;
  cost: string;
  stock: string;
  image?: File;
  variants: VariantFieldForm[];
}

interface ProductResponse {
  id: string;
  name: string;
  description: string;
  price: number;
  cost: number;
  stock: number;
  variants: Array<{
    id: string;
    name: string;
    values: Array<{
      id: string;
      value: string;
      customPrice: boolean;
      price: number;
      stock: number;
    }>;
  }>;
}

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const businessId = params.id as string;
  const productId = params.productId as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState<ProductForm>({
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

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(
          `/api/marketplace/businesses/${businessId}/products/${productId}`,
          {
            credentials: "include",
          }
        );

        if (response.status === 401) {
          router.push("/studashboard/main-menu/marketplace");
          return;
        }

        if (!response.ok) {
          const payload = await response.json();
          throw new Error(payload.error || "Failed to fetch product");
        }

        const payload = await response.json();
        const product: ProductResponse = payload.product;

        setFormData({
          name: product.name,
          description: product.description,
          price: String(product.price),
          cost: String(product.cost),
          stock: String(product.stock),
          variants: (product.variants || []).map((field) => ({
            id: field.id,
            name: field.name,
            options: field.values.map((value) => ({
              id: value.id,
              value: value.value,
              pricingMode: value.customPrice ? "custom" : "same",
              customPrice: value.customPrice ? String(value.price) : "",
              stock: String(value.stock),
            })),
          })),
        });
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : "Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [businessId, productId, router]);

  const handleBaseFieldChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;

    if (name === "image") {
      const inputElement = event.target as HTMLInputElement;
      setFormData((previous) => ({
        ...previous,
        image: inputElement.files?.[0],
      }));
      return;
    }

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const addVariantField = () => {
    setFormData((previous) => ({
      ...previous,
      variants: [
        ...previous.variants,
        {
          id: crypto.randomUUID(),
          name: "",
          options: [createDefaultVariantOption()],
        },
      ],
    }));
  };

  const removeVariantField = (fieldId: string) => {
    setFormData((previous) => ({
      ...previous,
      variants: previous.variants.filter((field) => field.id !== fieldId),
    }));
  };

  const updateVariantFieldName = (fieldId: string, name: string) => {
    setFormData((previous) => ({
      ...previous,
      variants: previous.variants.map((field) =>
        field.id === fieldId ? { ...field, name } : field
      ),
    }));
  };

  const addVariantOption = (fieldId: string) => {
    setFormData((previous) => ({
      ...previous,
      variants: previous.variants.map((field) =>
        field.id === fieldId
          ? { ...field, options: [...field.options, createDefaultVariantOption()] }
          : field
      ),
    }));
  };

  const removeVariantOption = (fieldId: string, optionId: string) => {
    setFormData((previous) => ({
      ...previous,
      variants: previous.variants.map((field) =>
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
    setFormData((previous) => ({
      ...previous,
      variants: previous.variants.map((field) =>
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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const payload = new FormData();
      payload.append("name", formData.name);
      payload.append("description", formData.description);
      payload.append("price", formData.price);
      payload.append("cost", formData.cost);
      payload.append("stock", formData.stock);

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

      payload.append("variants", JSON.stringify(normalizedVariants));
      if (formData.image) {
        payload.append("image", formData.image);
      }

      const response = await fetch(
        `/api/marketplace/businesses/${businessId}/products/${productId}`,
        {
          method: "PUT",
          credentials: "include",
          body: payload,
        }
      );

      if (response.status === 401) {
        router.push("/studashboard/main-menu/marketplace");
        return;
      }

      if (!response.ok) {
        const responsePayload = await response.json();
        throw new Error(responsePayload.error || "Failed to update product");
      }

      setSuccess("Product updated successfully");
      setTimeout(() => {
        router.push(`/studashboard/main-menu/marketplace/dashboard/business/${businessId}`);
      }, 1000);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to update product");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white px-4 py-8 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="md" />
          <p className="text-zinc-600 mt-4">Loading product...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Link
          href={`/studashboard/main-menu/marketplace/dashboard/business/${businessId}`}
          className="text-zinc-600 hover:text-zinc-900 mb-6 inline-block"
        >
          ← Back
        </Link>

        <div className="bg-white rounded-lg shadow-lg p-6 border border-zinc-200">
          <h1 className="text-2xl font-bold text-zinc-900 mb-6">Edit Product</h1>

          {error && (
            <div className="mb-4 p-3 rounded-md bg-red-100 text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 rounded-md bg-green-100 text-green-700">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Product Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleBaseFieldChange}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-md bg-white text-zinc-900"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Price (₦) *</label>
                <input
                  type="number"
                  name="price"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleBaseFieldChange}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-md bg-white text-zinc-900"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Cost (₦) *</label>
                <input
                  type="number"
                  name="cost"
                  min="0"
                  step="0.01"
                  value={formData.cost}
                  onChange={handleBaseFieldChange}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-md bg-white text-zinc-900"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Stock *</label>
                <input
                  type="number"
                  name="stock"
                  min="0"
                  value={formData.stock}
                  onChange={handleBaseFieldChange}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-md bg-white text-zinc-900"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleBaseFieldChange}
                rows={4}
                className="w-full px-3 py-2 border border-zinc-300 rounded-md bg-white text-zinc-900"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Replace Image (optional)</label>
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleBaseFieldChange}
                className="w-full px-3 py-2 border border-zinc-300 rounded-md bg-white text-zinc-900"
              />
            </div>

            <div className="border border-zinc-200 rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-zinc-900">Variants</h4>
                <button
                  type="button"
                  onClick={addVariantField}
                  className="px-3 py-1.5 text-sm rounded-md bg-zinc-900 text-white hover:bg-zinc-700"
                >
                  Add Field
                </button>
              </div>

              {formData.variants.length === 0 && (
                <p className="text-sm text-zinc-500">No variants yet.</p>
              )}

              {formData.variants.map((field, fieldIndex) => (
                <div key={field.id} className="border border-zinc-200 rounded-md p-3 space-y-3">
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={field.name}
                      onChange={(event) => updateVariantFieldName(field.id, event.target.value)}
                      placeholder={`Field ${fieldIndex + 1} (e.g. Size, Color)`}
                      className="flex-1 px-3 py-2 border border-zinc-300 rounded-md bg-white text-zinc-900"
                    />
                    <button
                      type="button"
                      onClick={() => removeVariantField(field.id)}
                      className="px-3 py-2 text-sm rounded-md bg-red-600 text-white hover:bg-red-700"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="space-y-2">
                    {field.options.map((option) => (
                      <div key={option.id} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end">
                        <div className="md:col-span-3">
                          <label className="block text-xs text-zinc-600 mb-1">Value</label>
                          <input
                            type="text"
                            value={option.value}
                            onChange={(event) =>
                              updateVariantOption(field.id, option.id, { value: event.target.value })
                            }
                            className="w-full px-3 py-2 border border-zinc-300 rounded-md bg-white text-zinc-900"
                          />
                        </div>

                        <div className="md:col-span-4">
                          <label className="block text-xs text-zinc-600 mb-1">Pricing</label>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                updateVariantOption(field.id, option.id, {
                                  pricingMode: "same",
                                  customPrice: "",
                                })
                              }
                              className={`px-3 py-2 text-sm rounded-md border ${
                                option.pricingMode === "same"
                                  ? "bg-zinc-900 text-white border-zinc-900"
                                  : "bg-white text-zinc-900 border-zinc-300"
                              }`}
                            >
                              Same Price
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                updateVariantOption(field.id, option.id, {
                                  pricingMode: "custom",
                                })
                              }
                              className={`px-3 py-2 text-sm rounded-md border ${
                                option.pricingMode === "custom"
                                  ? "bg-zinc-900 text-white border-zinc-900"
                                  : "bg-white text-zinc-900 border-zinc-300"
                              }`}
                            >
                              Custom Price
                            </button>
                          </div>
                        </div>

                        {option.pricingMode === "custom" && (
                          <div className="md:col-span-2">
                            <label className="block text-xs text-zinc-600 mb-1">Price</label>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={option.customPrice}
                              onChange={(event) =>
                                updateVariantOption(field.id, option.id, {
                                  customPrice: event.target.value,
                                })
                              }
                              className="w-full px-3 py-2 border border-zinc-300 rounded-md bg-white text-zinc-900"
                            />
                          </div>
                        )}

                        <div className="md:col-span-2">
                          <label className="block text-xs text-zinc-600 mb-1">Stock</label>
                          <input
                            type="number"
                            min="0"
                            value={option.stock}
                            onChange={(event) =>
                              updateVariantOption(field.id, option.id, {
                                stock: event.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-zinc-300 rounded-md bg-white text-zinc-900"
                          />
                        </div>

                        <div className="md:col-span-1">
                          <button
                            type="button"
                            onClick={() => removeVariantOption(field.id, option.id)}
                            className="w-full px-2 py-2 text-sm rounded-md bg-red-600 text-white hover:bg-red-700"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() => addVariantOption(field.id)}
                      className="px-3 py-2 text-sm rounded-md bg-zinc-200 text-zinc-900 hover:bg-zinc-300"
                    >
                      Add Value
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-zinc-900 text-white py-3 rounded-md hover:bg-zinc-700 transition-colors font-medium disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Product"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
