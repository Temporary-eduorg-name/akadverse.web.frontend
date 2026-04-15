import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteFromCloudinary, uploadToCloudinary } from "@/lib/cloudinary";

interface IncomingVariantValue {
  value: string;
  customPrice: boolean;
  price?: string;
  stock?: number;
}

interface IncomingVariantField {
  name: string;
  values: IncomingVariantValue[];
}

type CreatedVariantValue = {
  id: string;
  customPrice: boolean;
  price: number;
  stock: number;
};

// Types for Prisma query results
interface PrismaVariantValue {
  id: string;
  value: string;
  fieldId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface PrismaVariantField {
  id: string;
  name: string;
  productId: string;
  createdAt: Date;
  updatedAt: Date;
  values: PrismaVariantValue[];
}

const parseVariants = (rawVariants: FormDataEntryValue | null): IncomingVariantField[] => {
  if (!rawVariants || typeof rawVariants !== "string") {
    return [];
  }

  try {
    const parsed = JSON.parse(rawVariants) as IncomingVariantField[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const buildCombinations = <T,>(collections: T[][]): T[][] => {
  if (collections.length === 0) return [];

  return collections.reduce<T[][]>(
    (allCombinations, currentCollection) => {
      const nextCombinations: T[][] = [];
      for (const combination of allCombinations) {
        for (const item of currentCollection) {
          nextCombinations.push([...combination, item]);
        }
      }
      return nextCombinations;
    },
    [[]]
  );
};

const replaceVariantsForProduct = async (
  productId: string,
  variants: IncomingVariantField[],
  basePrice: number,
  baseStock: number
) => {
  await prisma.variantValueOnProductVariant.deleteMany({
    where: {
      variant: {
        productId,
      },
    },
  });
  await prisma.productVariant.deleteMany({ where: { productId } });
  await prisma.variantValue.deleteMany({
    where: {
      field: {
        productId,
      },
    },
  });
  await prisma.variantField.deleteMany({ where: { productId } });

  if (variants.length === 0) return;

  const valuesByField: CreatedVariantValue[][] = [];

  for (const field of variants) {
    if (!field.name?.trim()) continue;
    const validValues = (field.values || []).filter((entry) => entry.value?.trim());
    if (validValues.length === 0) continue;

    const variantField = await prisma.variantField.create({
      data: {
        name: field.name.trim(),
        productId,
      },
    });

    const createdValues: CreatedVariantValue[] = [];
    for (const valueConfig of validValues) {
      const createdValue = await prisma.variantValue.create({
        data: {
          value: valueConfig.value.trim(),
          fieldId: variantField.id,
        },
      });

      createdValues.push({
        id: createdValue.id,
        customPrice: Boolean(valueConfig.customPrice),
        price:
          valueConfig.customPrice && valueConfig.price
            ? parseFloat(valueConfig.price)
            : basePrice,
        stock:
          typeof valueConfig.stock === "number" && !Number.isNaN(valueConfig.stock)
            ? valueConfig.stock
            : baseStock,
      });
    }

    if (createdValues.length > 0) {
      valuesByField.push(createdValues);
    }
  }

  const combinations = buildCombinations(valuesByField);
  for (const combination of combinations) {
    const customPriceEntry = combination.find((entry) => entry.customPrice);
    const variantPrice = customPriceEntry ? customPriceEntry.price : basePrice;
    const variantStock = combination.reduce(
      (minimum, entry) => Math.min(minimum, entry.stock),
      baseStock
    );

    await prisma.productVariant.create({
      data: {
        productId,
        price: variantPrice,
        isCustomPrice: Boolean(customPriceEntry),
        stock: variantStock,
        variantValues: {
          create: combination.map((entry) => ({
            valueId: entry.id,
          })),
        },
      },
    });
  }
};

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string; productId: string }> }
) {
  try {
    const params = await context.params;
    const authResult = verifyAuth(req);
    if (!authResult.valid || !authResult.userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { id: businessId, productId } = params;
    const business = await prisma.business.findUnique({ where: { id: businessId } });

    if (!business || business.userId !== authResult.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        variantFields: {
          include: {
            values: true,
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!product || product.businessId !== businessId) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const productVariants = await prisma.productVariant.findMany({
      where: { productId },
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
    });

    const fieldValuePricing = new Map<string, { isCustomPrice: boolean; price: number; stock: number }>();
    for (const variant of productVariants) {
      for (const valueLink of variant.variantValues) {
        const key = `${valueLink.value.fieldId}:${valueLink.value.id}`;
        if (!fieldValuePricing.has(key)) {
          fieldValuePricing.set(key, {
            isCustomPrice: variant.isCustomPrice,
            price: variant.price,
            stock: variant.stock,
          });
        }
      }
    }

    const variants = product.variantFields.map((field: PrismaVariantField) => ({
      id: field.id,
      name: field.name,
      values: field.values.map((value: PrismaVariantValue) => {
        const pricing = fieldValuePricing.get(`${field.id}:${value.id}`);
        return {
          id: value.id,
          value: value.value,
          customPrice: pricing?.isCustomPrice ?? false,
          price: pricing?.price ?? product.price,
          stock: pricing?.stock ?? product.stock,
        };
      }),
    }));

    return NextResponse.json({
      product: {
        ...product,
        variants,
      },
    });
  } catch (error) {
    console.error("Get product error:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching product" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string; productId: string }> }
) {
  try {
    const params = await context.params;
    const authResult = verifyAuth(req);
    if (!authResult.valid || !authResult.userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { id: businessId, productId } = params;
    const business = await prisma.business.findUnique({ where: { id: businessId } });

    if (!business || business.userId !== authResult.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const existingProduct = await prisma.product.findUnique({ where: { id: productId } });
    if (!existingProduct || existingProduct.businessId !== businessId) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const formData = await req.formData();
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string);
    const cost = parseFloat(formData.get("cost") as string);
    const stock = parseInt(formData.get("stock") as string, 10);
    const imageFile = formData.get("image") as File | null;
    const variants = parseVariants(formData.get("variants"));

    if (
      !name ||
      !description ||
      Number.isNaN(price) ||
      Number.isNaN(cost) ||
      Number.isNaN(stock)
    ) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    let public_id = existingProduct.public_id;
    let secure_url = existingProduct.secure_url;

    if (imageFile) {
      if (existingProduct.public_id) {
        try {
          await deleteFromCloudinary(existingProduct.public_id);
        } catch (cloudinaryDeleteError) {
          console.error("Failed to delete existing image from Cloudinary:", cloudinaryDeleteError);
        }
      }

      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const uploadResult = await uploadToCloudinary(buffer, "products");
      public_id = uploadResult.public_id;
      secure_url = uploadResult.secure_url;
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        name,
        description,
        price,
        cost,
        stock,
        public_id,
        secure_url,
      },
    });

    await replaceVariantsForProduct(productId, variants, price, stock);

    return NextResponse.json(
      { message: "Product updated successfully", product: updatedProduct },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update product error:", error);
    return NextResponse.json(
      { error: "An error occurred while updating product" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string; productId: string }> }
) {
  try {
    const params = await context.params;
    const authResult = verifyAuth(req);
    if (!authResult.valid || !authResult.userId) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { id: businessId, productId } = params;

    // Verify ownership
    const business = await prisma.business.findUnique({
      where: { id: businessId },
    });

    if (!business || business.userId !== authResult.userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product || product.businessId !== businessId) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Delete image from Cloudinary if it exists
    if (product.public_id) {
      try {
        await deleteFromCloudinary(product.public_id);
      } catch (cloudinaryError) {
        console.error("Failed to delete image from Cloudinary:", cloudinaryError);
        // Continue with product deletion even if Cloudinary deletion fails
      }
    }

    await prisma.product.delete({
      where: { id: productId },
    });

    return NextResponse.json(
      { message: "Product deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete product error:", error);
    return NextResponse.json(
      { error: "An error occurred while deleting product" },
      { status: 500 }
    );
  }
}
