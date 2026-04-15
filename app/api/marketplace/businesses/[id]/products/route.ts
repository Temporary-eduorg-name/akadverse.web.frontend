import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadToCloudinary } from "@/lib/cloudinary";

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

const parseVariants = (rawVariants: FormDataEntryValue | null): IncomingVariantField[] => {
  if (!rawVariants || typeof rawVariants !== "string") {
    return [];
  }

  try {
    const parsed = JSON.parse(rawVariants) as IncomingVariantField[];
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed;
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

const createVariantsForProduct = async (
  productId: string,
  variants: IncomingVariantField[],
  basePrice: number,
  baseStock: number
) => {
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
  context: { params: Promise<{ id: string }> }
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

    const businessId = params.id;

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

    const products = await prisma.product.findMany({
      where: { businessId },
      include: {
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
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ products }, { status: 200 });
  } catch (error) {
    console.error("Get products error:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching products" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
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

    const businessId = params.id;

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

    const formData = await req.formData();
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string);
    const cost = parseFloat(formData.get("cost") as string);
    const stock = parseInt(formData.get("stock") as string);
    const imageFile = formData.get("image") as File | null;
    const variants = parseVariants(formData.get("variants"));

    if (
      !name ||
      !description ||
      Number.isNaN(price) ||
      Number.isNaN(cost) ||
      Number.isNaN(stock)
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Handle image upload to Cloudinary
    let public_id: string | null = null;
    let secure_url: string | null = null;
     console.log(imageFile)
    if (imageFile) {
      try {
        const bytes = await imageFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const uploadResult = await uploadToCloudinary(buffer, "products");
        public_id = uploadResult.public_id;
        secure_url = uploadResult.secure_url;
        console.log(public_id,secure_url)
      } catch (uploadError) {
        console.error("Cloudinary upload error:", uploadError);
        return NextResponse.json(
          { error: "Failed to upload image" },
          { status: 500 }
        );
      }
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        cost,
        stock,
        businessId,
        image: null,
        secure_url,
        public_id
      },
    });

    await createVariantsForProduct(product.id, variants, price, stock);

    return NextResponse.json(
      { message: "Product created successfully", product },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create product error:", error);
    return NextResponse.json(
      { error: "An error occurred while creating product" },
      { status: 500 }
    );
  }
}
