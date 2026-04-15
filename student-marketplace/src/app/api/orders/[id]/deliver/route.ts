import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail, orderDeliveredEmail } from "@/utils/email";

const MAX_OTP_ATTEMPTS = 5;

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const authResult = verifyAuth(req);

    if (!authResult.valid || !authResult.userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { id: orderId } = params;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        business: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        user: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.userId !== authResult.userId) {
      return NextResponse.json(
        { error: "Unauthorized - This order doesn't belong to you" },
        { status: 403 }
      );
    }

    if (order.status !== "shipped") {
      return NextResponse.json(
        { error: "Order must be shipped before confirmation" },
        { status: 400 }
      );
    }

    if (!order.deliveryOtp) {
      return NextResponse.json(
        { error: "Delivery OTP is not ready yet" },
        { status: 400 }
      );
    }

    await prisma.notification.create({
      data: {
        userId: order.business.user.id,
        businessId: order.businessId,
        type: "order",
        message: `Buyer confirmed receipt for order #${order.id}. Request OTP from buyer and mark as delivered.`,
      },
    });

    await sendEmail({
      to: order.business.user.email,
      subject: `Buyer Confirmed Delivery - Order #${order.id}`,
      text: `Buyer ${order.user.firstName} ${order.user.lastName} confirmed receipt for order #${order.id}. Ask the buyer for the 6-digit delivery OTP and submit it from your dashboard to complete delivery.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Buyer Confirmed Delivery</h2>
          <p>Buyer <strong>${order.user.firstName} ${order.user.lastName}</strong> confirmed receipt for order <strong>#${order.id}</strong>.</p>
          <p>Please ask the buyer for the 6-digit delivery OTP and submit it from your dashboard to complete delivery.</p>
        </div>
      `,
    });

    return NextResponse.json({
      message: "Delivery confirmation received. Seller has been notified.",
      deliveryOtpRequired: true,
    });
  } catch (error) {
    console.error("Buyer confirm delivery error:", error);
    return NextResponse.json(
      { error: "Failed to confirm delivery" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const authResult = verifyAuth(req);
    
    if (!authResult.valid || !authResult.userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { id: orderId } = params;
    const { otp } = await req.json();

    if (!otp) {
      return NextResponse.json({ error: "OTP is required" }, { status: 400 });
    }

    // Get order and verify seller ownership
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        business: true,
        user: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Verify seller is the business owner (seller confirms delivery with buyer's OTP)
    if (order.business.userId !== authResult.userId) {
      return NextResponse.json(
        { error: "Unauthorized - You don't own this business" },
        { status: 403 }
      );
    }

    // Check if order is shipped
    if (order.status !== "shipped") {
      return NextResponse.json(
        { error: "Order must be shipped before delivery confirmation" },
        { status: 400 }
      );
    }

    // Verify delivery OTP exists
    if (!order.deliveryOtp || !order.deliveryOtpExpiry) {
      return NextResponse.json(
        { error: "No delivery OTP found" },
        { status: 400 }
      );
    }

    // Check if OTP has expired
    if (new Date() > order.deliveryOtpExpiry) {
      return NextResponse.json(
        { error: "Delivery OTP has expired" },
        { status: 400 }
      );
    }

    // Check OTP attempts
    if (order.deliveryOtpAttempts >= MAX_OTP_ATTEMPTS) {
      return NextResponse.json(
        {
          error: `Maximum OTP attempts (${MAX_OTP_ATTEMPTS}) exceeded. Please contact support.`,
        },
        { status: 429 }
      );
    }

    // Verify OTP
    if (otp !== order.deliveryOtp) {
      // Increment failed attempts
      await prisma.order.update({
        where: { id: orderId },
        data: {
          deliveryOtpAttempts: order.deliveryOtpAttempts + 1,
        },
      });

      const attemptsLeft = MAX_OTP_ATTEMPTS - (order.deliveryOtpAttempts + 1);
      return NextResponse.json(
        {
          error: `Invalid OTP. ${attemptsLeft} attempt${attemptsLeft !== 1 ? "s" : ""} remaining.`,
          attemptsLeft,
        },
        { status: 400 },
      );
    }

    // Mark order as delivered
    const escrowReleaseAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "delivered",
        deliveryOtp: null,
        deliveryOtpExpiry: null,
        escrowReleased: false,
        escrowReleaseStatus: "pending",
        escrowReleaseAt,
        escrowFailureReason: null,
      },
    });

    // Send delivery confirmation email to buyer
    const emailData = orderDeliveredEmail(
      `${order.user.firstName} ${order.user.lastName}`,
      order.id,
      order.business.name
    );
    emailData.to = order.user.email;
    await sendEmail(emailData);

    return NextResponse.json({
      message: "Order marked as delivered successfully. Buyer has 24 hours to dispute.",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Deliver order error:", error);
    return NextResponse.json(
      { error: "Failed to confirm delivery" },
      { status: 500 }
    );
  }
}
