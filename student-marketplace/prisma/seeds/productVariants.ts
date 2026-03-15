/* eslint-disable @typescript-eslint/no-var-requires */
const { PrismaClient } = require("@prisma/client");
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

interface VariantValueConfig {
  value: string;
  price?: number;
  stock?: number;
  customPrice?: boolean;
}

interface VariantFieldConfig {
  name: string;
  values: VariantValueConfig[];
}

const PRODUCT_VARIANTS: Record<string, VariantFieldConfig[]> = {
  "T-Shirt": [
    {
      name: "Size",
      values: [
        { value: "XS", stock: 20 },
        { value: "S", stock: 25 },
        { value: "M", stock: 30 },
        { value: "L", stock: 25 },
        { value: "XL", stock: 20 },
        { value: "XXL", stock: 15, price: 2000, customPrice: true },
      ],
    },
    {
      name: "Color",
      values: [
        { value: "Red", stock: 15 },
        { value: "Blue", stock: 15 },
        { value: "Black", stock: 15 },
        { value: "White", stock: 15 },
      ],
    },
  ],
  "Running Shoes": [
    {
      name: "Size",
      values: [
        { value: "6", stock: 10 },
        { value: "7", stock: 12 },
        { value: "8", stock: 15 },
        { value: "9", stock: 14 },
        { value: "10", stock: 12 },
        { value: "11", stock: 10 },
        { value: "12", stock: 8, price: 8500, customPrice: true },
      ],
    },
    {
      name: "Color",
      values: [
        { value: "Black/Red", stock: 20 },
        { value: "White/Blue", stock: 20 },
        { value: "Gray", stock: 18 },
      ],
    },
  ],
  "Laptop Bag": [
    {
      name: "Size",
      values: [
        { value: "13-inch", price: 5500, customPrice: true, stock: 8 },
        { value: "15-inch", price: 6500, customPrice: true, stock: 10 },
        { value: "17-inch", price: 7500, customPrice: true, stock: 5 },
      ],
    },
    {
      name: "Color",
      values: [
        { value: "Black", stock: 15 },
        { value: "Gray", stock: 12 },
        { value: "Navy", stock: 10 },
      ],
    },
  ],
  "Coffee Mug": [
    {
      name: "Size",
      values: [
        { value: "250ml", stock: 50 },
        { value: "350ml", stock: 50 },
        { value: "500ml", stock: 40, price: 1500, customPrice: true },
      ],
    },
    {
      name: "Color",
      values: [
        { value: "White", stock: 40 },
        { value: "Black", stock: 40 },
        { value: "Blue", stock: 30 },
        { value: "Red", stock: 30 },
      ],
    },
  ],
};

async function seedProductVariants() {
  try {
    console.log("Starting to seed product variants...");

    // Get all businesses
    const businesses = await prisma.business.findMany();
    if (businesses.length === 0) {
      console.log("No businesses found. Creating sample businesses first...");
      return;
    }

    // For each category type, create 2-3 products with variants
    for (const [productType, variantConfigs] of Object.entries(
      PRODUCT_VARIANTS
    )) {
      for (let i = 0; i < 2; i++) {
        const business = businesses[Math.floor(Math.random() * businesses.length)];
        const basePrice = parseFloat(faker.commerce.price({ min: 1000, max: 10000 }));

        // Create product
        const product = await prisma.product.create({
          data: {
            name: `${productType} ${i + 1}`,
            description: faker.commerce.productDescription(),
            price: basePrice,
            cost: basePrice * 0.4,
            stock: 200,
            businessId: business.id,
          },
        });

        // Create variant fields and values
        for (const fieldConfig of variantConfigs) {
          const variantField = await prisma.variantField.create({
            data: {
              name: fieldConfig.name,
              productId: product.id,
            },
          });

          const variantValueIds: Record<string, string> = {};

          // Create variant values
          for (const valueConfig of fieldConfig.values) {
            const variantValue = await prisma.variantValue.create({
              data: {
                value: valueConfig.value,
                fieldId: variantField.id,
              },
            });
            variantValueIds[valueConfig.value] = variantValue.id;
          }

          // Create product variants for each value
          for (const valueConfig of fieldConfig.values) {
            const customPrice = valueConfig.customPrice
              ? valueConfig.price || basePrice
              : basePrice;

            await prisma.productVariant.create({
              data: {
                productId: product.id,
                price: customPrice,
                isCustomPrice: valueConfig.customPrice || false,
                stock: valueConfig.stock || 50,
                variantValues: {
                  create: [
                    {
                      valueId: variantValueIds[valueConfig.value],
                    },
                  ],
                },
              },
            });
          }
        }

        console.log(
          `✓ Created ${product.name} with ${variantConfigs.length} variant fields`
        );
      }
    }

    console.log("✓ Product variants seeded successfully!");
  } catch (error) {
    console.error("Error seeding product variants:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedProductVariants();
