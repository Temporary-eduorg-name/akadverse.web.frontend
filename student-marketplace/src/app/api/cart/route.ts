import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET all cart items for user
export async function GET(req: NextRequest) {
  try {
    const authResult = verifyAuth(req);
    if (!authResult.valid || !authResult.userId) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { userId: authResult.userId },
      include: {
        product: {
          include: {
            business: {
              select: {
                name: true,
                id: true,
              },
            },
          },
        },
        variant: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ cartItems }, { status: 200 });
  } catch (error) {
    console.error("Get cart error:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching cart" },
      { status: 500 }
    );
  }
}

// POST add item to cart
export async function POST(req: NextRequest) {
  try {
    const authResult = verifyAuth(req);
    if (!authResult.valid || !authResult.userId) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { productId, quantity, selectedVariants } = await req.json();

    if (!productId || !quantity || quantity < 1) {
      return NextResponse.json(
        { error: "Invalid product or quantity" },
        { status: 400 }
      );
    }

    // Check if product exists and has stock
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    if (product.stock < quantity) {
      return NextResponse.json(
        { error: "Insufficient stock" },
        { status: 400 }
      );
    }

    // Store selected variants as JSON string
    const selectedVariantsJson = selectedVariants ? JSON.stringify(selectedVariants) : null;

    // Find matching variant if variants are selected
    let matchingVariantId: string | null = null;
    if (selectedVariants) {
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

      // Find the variant that matches selected values
      for (const variant of productVariants) {
        const variantMap: Record<string, string> = {};
        variant.variantValues.forEach((vv: any) => {
          variantMap[vv.value.field.name] = vv.value.value;
        });

        const matches = Object.entries(selectedVariants).every(
          ([key, value]) => variantMap[key] === value
        );

        if (matches) {
          matchingVariantId = variant.id;
          break;
        }
      }
    }

    // Check if item already in cart with same variants
    const existingCartItem = await prisma.cartItem.findFirst({
      where: {
        userId: authResult.userId,
        productId,
        selectedVariants: selectedVariantsJson,
      },
    });

    if (existingCartItem) {
      // Update quantity
      const updatedCartItem = await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity: existingCartItem.quantity + quantity },
        include: {
          product: {
            include: {
              business: {
                select: {
                  name: true,
                  id: true,
                },
              },
            },
          },
        },
      });

      return NextResponse.json(
        { message: "Cart updated", cartItem: updatedCartItem },
        { status: 200 }
      );
    }

    // Create new cart item
    const cartItem = await prisma.cartItem.create({
      data: {
        userId: authResult.userId,
        productId,
        quantity,
        selectedVariants: selectedVariantsJson,
        variantId: matchingVariantId,
      },
      include: {
        product: {
          include: {
            business: {
              select: {
                name: true,
                id: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(
      { message: "Added to cart", cartItem },
      { status: 201 }
    );
  } catch (error) {
    console.error("Add to cart error:", error);
    return NextResponse.json(
      { error: "An error occurred while adding to cart" },
      { status: 500 }
    );
  }
}

// DELETE clear entire cart
export async function DELETE(req: NextRequest) {
  try {
    const authResult = verifyAuth(req);
    if (!authResult.valid || !authResult.userId) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    await prisma.cartItem.deleteMany({
      where: { userId: authResult.userId },
    });

    return NextResponse.json(
      { message: "Cart cleared" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Clear cart error:", error);
    return NextResponse.json(
      { error: "An error occurred while clearing cart" },
      { status: 500 }
    );
  }
}
