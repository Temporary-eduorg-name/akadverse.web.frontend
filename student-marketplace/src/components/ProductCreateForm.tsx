"use client";

import React from "react";

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

interface CreateProductForm {
  name: string;
  description: string;
  price: string;
  cost: string;
  stock: string;
  image?: File;
  variants: VariantFieldForm[];
}

interface ProductCreateFormProps {
  formData: CreateProductForm;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onAddVariantField: () => void;
  onRemoveVariantField: (fieldId: string) => void;
  onVariantFieldNameChange: (fieldId: string, name: string) => void;
  onAddVariantOption: (fieldId: string) => void;
  onRemoveVariantOption: (fieldId: string, optionId: string) => void;
  onVariantOptionChange: (
    fieldId: string,
    optionId: string,
    changes: Partial<VariantOptionForm>
  ) => void;
  onSubmit: (e: React.FormEvent) => void;
  isCreating: boolean;
}

export default function ProductCreateForm({
  formData,
  onFormChange,
  onAddVariantField,
  onRemoveVariantField,
  onVariantFieldNameChange,
  onAddVariantOption,
  onRemoveVariantOption,
  onVariantOptionChange,
  onSubmit,
  isCreating,
}: ProductCreateFormProps) {
  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 mb-6 border border-zinc-200 dark:border-zinc-700">
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
        Create New Product
      </h3>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Product Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={onFormChange}
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Price ($) *
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={onFormChange}
              step="0.01"
              min="0"
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Cost ($) *
            </label>
            <input
              type="number"
              name="cost"
              value={formData.cost}
              onChange={onFormChange}
              step="0.01"
              min="0"
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Stock Quantity *
            </label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={onFormChange}
              min="0"
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Description *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={onFormChange}
            rows={3}
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Product Image (Optional)
          </label>
          <input
            type="file"
            name="image"
            onChange={onFormChange}
            accept="image/*"
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white"
          />
        </div>

        <div className="border border-zinc-200 dark:border-zinc-700 rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-zinc-900 dark:text-white">
              Add Variants
            </h4>
            <button
              type="button"
              onClick={onAddVariantField}
              className="px-3 py-1.5 text-sm rounded-md bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-200"
            >
              Add Field
            </button>
          </div>

          {formData.variants.length === 0 && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              No variants yet. Add a field like Size or Color.
            </p>
          )}

          {formData.variants.map((field, fieldIndex) => (
            <div
              key={field.id}
              className="border border-zinc-200 dark:border-zinc-700 rounded-md p-3 space-y-3"
            >
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  value={field.name}
                  onChange={(e) => onVariantFieldNameChange(field.id, e.target.value)}
                  placeholder={`Field ${fieldIndex + 1} (e.g. Size, Color)`}
                  className="flex-1 px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => onRemoveVariantField(field.id)}
                  className="px-3 py-2 text-sm rounded-md bg-red-600 text-white hover:bg-red-700"
                >
                  Remove
                </button>
              </div>

              <div className="space-y-2">
                {field.options.map((option) => (
                  <div
                    key={option.id}
                    className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end"
                  >
                    <div className="md:col-span-3">
                      <label className="block text-xs text-zinc-600 dark:text-zinc-400 mb-1">
                        Value
                      </label>
                      <input
                        type="text"
                        value={option.value}
                        onChange={(e) =>
                          onVariantOptionChange(field.id, option.id, {
                            value: e.target.value,
                          })
                        }
                        placeholder="e.g. XL"
                        className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white"
                      />
                    </div>

                    <div className="md:col-span-4">
                      <label className="block text-xs text-zinc-600 dark:text-zinc-400 mb-1">
                        Pricing
                      </label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            onVariantOptionChange(field.id, option.id, {
                              pricingMode: "same",
                              customPrice: "",
                            })
                          }
                          className={`px-3 py-2 text-sm rounded-md border ${
                            option.pricingMode === "same"
                              ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-zinc-900 dark:border-white"
                              : "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white border-zinc-300 dark:border-zinc-600"
                          }`}
                        >
                          Same Price
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            onVariantOptionChange(field.id, option.id, {
                              pricingMode: "custom",
                            })
                          }
                          className={`px-3 py-2 text-sm rounded-md border ${
                            option.pricingMode === "custom"
                              ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-zinc-900 dark:border-white"
                              : "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white border-zinc-300 dark:border-zinc-600"
                          }`}
                        >
                          Custom Price
                        </button>
                      </div>
                    </div>

                    {option.pricingMode === "custom" && (
                      <div className="md:col-span-2">
                        <label className="block text-xs text-zinc-600 dark:text-zinc-400 mb-1">
                          Price
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={option.customPrice}
                          onChange={(e) =>
                            onVariantOptionChange(field.id, option.id, {
                              customPrice: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white"
                        />
                      </div>
                    )}

                    <div className="md:col-span-2">
                      <label className="block text-xs text-zinc-600 dark:text-zinc-400 mb-1">
                        Stock
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={option.stock}
                        onChange={(e) =>
                          onVariantOptionChange(field.id, option.id, {
                            stock: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white"
                      />
                    </div>

                    <div className="md:col-span-1">
                      <button
                        type="button"
                        onClick={() => onRemoveVariantOption(field.id, option.id)}
                        className="w-full px-2 py-2 text-sm rounded-md bg-red-600 text-white hover:bg-red-700"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => onAddVariantOption(field.id)}
                  className="px-3 py-2 text-sm rounded-md bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-white hover:bg-zinc-300 dark:hover:bg-zinc-600"
                >
                  Add Value
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={isCreating}
          className="w-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 py-2 rounded-md hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors font-medium disabled:opacity-50"
        >
          {isCreating ? "Creating..." : "Create Product"}
        </button>
      </form>
    </div>
  );
}
