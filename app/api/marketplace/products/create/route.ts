import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const {
      name,
      description,
      price,
      cost,
      stock,
      secure_url,
      public_id,
      businessId,
      variants, // Array of variant configurations
    } = data;

    // Create product
    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        cost: parseFloat(cost),
        stock: parseInt(stock),
        secure_url,
        public_id,
        businessId,
      },
    });

    // Create variant fields and values if provided
    if (variants && variants.length > 0) {
      for (const fieldConfig of variants) {
        // Create variant field
        const variantField = await prisma.variantField.create({
          data: {
            name: fieldConfig.name, // e.g., "Size", "Color"
            productId: product.id,
          },
        });

        // Create variant values for this field
        const variantValueIds: Record<string, string> = {};
        for (const valueConfig of fieldConfig.values) {
          const variantValue = await prisma.variantValue.create({
            data: {
              value: valueConfig.value, // e.g., "S", "M", "L"
              fieldId: variantField.id,
            },
          });
          variantValueIds[valueConfig.value] = variantValue.id;
        }

        // Create product variants combining these values
        // For single-field variants, each value becomes a variant
        // For multi-field variants, we'd need combinations (handled separately)
        for (const valueConfig of fieldConfig.values) {
          const productVariant = await prisma.productVariant.create({
            data: {
              productId: product.id,
              price: parseFloat(valueConfig.price || price),
              isCustomPrice: valueConfig.customPrice || false,
              stock: valueConfig.stock || stock,
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
    }

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const products = await prisma.product.findMany({
      include: {
        business: true,
        variants: {
          include: {
            variantValues: {
              include: {
                value: {
                  include: {
                    field: true,
                  },
                },
              },
            },
          },
        },
        variantFields: {
          include: {
            values: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
