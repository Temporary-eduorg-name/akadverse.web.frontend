import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateDeliveryDate } from "@/utils/deliveryDate";
import { sendEmail, newOrderEmail } from "@/utils/email";

export async function GET(req: NextRequest) {
  try {
    const authResult = verifyAuth(req);
    if (!authResult.valid || !authResult.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const reference = searchParams.get("reference");
    console.log(reference)

    if (!reference) {
      return NextResponse.json(
        { error: "Payment reference is required" },
        { status: 400 }
      );
    }

    const paystackSecret =
      process.env.PAYSTACK_TEST_SECRET_KEY ||
      process.env.PAYSTACK_SECRET_KEY;

    if (!paystackSecret) {
      return NextResponse.json(
        { error: "Paystack secret key not configured" },
        { status: 500 }
      );
    }
    const verifyResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${paystackSecret}`,
          "Content-Type": "application/json",
        },
      }
    );

    const verifyData = await verifyResponse.json();
    console.log("Paystack verify response:", verifyData);

    if (!verifyResponse.ok) {
      console.error("Paystack error:", verifyData);
      return NextResponse.json(
        { error: verifyData?.message || "Failed to verify payment with Paystack" },
        { status: 400 }
      );
    }

    if (!verifyData?.data) {
      console.error("No transaction data in Paystack response");
      return NextResponse.json(
        { error: "Invalid Paystack response" },
        { status: 500 }
      );
    }

    if (verifyData.data.status !== "success") {
      return NextResponse.json(
        { error: "Payment not successful" },
        { status: 400 }
      );
    }

    const userId = authResult.userId;

    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            business: { select: { id: true, name: true } },
          },
        },
        variant: true,
      },
    });

    if (cartItems.length === 0) {
      return NextResponse.json(
        { error: "Cart is empty" },
        { status: 400 }
      );
    }

    const cartTotal = cartItems.reduce(
      (sum: number, item: any) => {
        const itemPrice = item.variant?.price ?? item.product.price;
        return sum + itemPrice * item.quantity;
      },
      0
    );
    const paidAmount = verifyData.data.amount / 100;

    console.log("Cart total:", cartTotal, "Paid amount:", paidAmount);

    // Allow for small rounding differences (more lenient)
    if (Math.abs(paidAmount - cartTotal) > 1) {
      return NextResponse.json(
        { error: `Payment amount mismatch. Expected: ${cartTotal}, Got: ${paidAmount}` },
        { status: 400 }
      );
    }

    const itemsByBusiness = new Map<string, typeof cartItems>();
    for (const item of cartItems) {
      const businessId = item.product.business.id;
      if (!itemsByBusiness.has(businessId)) {
        itemsByBusiness.set(businessId, []);
      }
      itemsByBusiness.get(businessId)?.push(item);
    }

    const orders = await prisma.$transaction(async (tx: any) => {
      for (const item of cartItems) {
        if (item.product.stock < item.quantity) {
          throw new Error(
            `Insufficient stock for ${item.product.name}`
          );
        }
      }

      const createdOrders = [];

      for (const [businessId, items] of itemsByBusiness.entries()) {
        const orderTotal = items.reduce(
          (sum: number, item: any) => {
            const itemPrice = item.variant?.price ?? item.product.price;
            return sum + itemPrice * item.quantity;
          },
          0
        );

        // Get business details for delivery date calculation
        const business = await tx.business.findUnique({
          where: { id: businessId },
          select: {
            serviceDays: true,
            serviceTimes: true,
            user: {
              select: {
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        });

        // Calculate expected delivery date
        const expectedDeliveryDate = business?.serviceDays && business?.serviceTimes
          ? calculateDeliveryDate(business.serviceDays, business.serviceTimes)
          : null;

        const order = await tx.order.create({
          data: {
            status: "pending",
            totalAmount: orderTotal,
            userId,
            businessId,
            paystackReference: reference,
            paymentStatus: "success",
            expectedDeliveryDate,
            items: {
              create: items.map((item: any) => ({
                quantity: item.quantity,
                price: item.variant?.price ?? item.product.price,
                productId: item.product.id,
                selectedVariants: item.selectedVariants,
              })),
            },
          },
          include: {
            items: {
              include: {
                product: true,
              },
            },
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        });

        createdOrders.push(order);

        // Send email notification to seller
        if (business?.user.email) {
          try {
            const emailData = newOrderEmail(
              `${business.user.firstName} ${business.user.lastName}`,
              order.id,
              `${order.user.firstName} ${order.user.lastName}`,
              orderTotal,
              expectedDeliveryDate
            );
            emailData.to = business.user.email;
            await sendEmail(emailData);
          } catch (emailError) {
            console.error("Failed to send new order email:", emailError);
            // Don't fail the transaction if email fails
          }
        }
      }

      for (const item of cartItems) {
        await tx.product.update({
          where: { id: item.product.id },
          data: { stock: { decrement: item.quantity } },
        });
      }

      await tx.cartItem.deleteMany({
        where: { userId },
      });

      return createdOrders;
    });

    // Create notifications outside transaction to prevent blocking order creation
    if (orders.length > 0) {
      try {
        await prisma.notification.createMany({
          data: orders.map((order: any) => ({  // Type from Prisma create operation returns any
            userId,
            type: "payment",
            message: `Payment successful. Order ${order.id} created.`,
            businessId: order.businessId,
          })),
        });
      } catch (notificationError) {
        console.error("Failed to create notifications:", notificationError);
        // Don't fail the entire payment if notifications fail
      }
    }

    return NextResponse.json(
      { message: "Payment verified", orders },
      { status: 200 }
    );
  } catch (error) {
    console.error("Payment verification error:", error);
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack");
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: "Failed to verify payment" },
      { status: 500 }
    );
  }
}
