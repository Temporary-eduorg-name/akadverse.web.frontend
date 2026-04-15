import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateOTP, getOTPExpiry } from "@/utils/otp";
import {
  sendEmail,
  shippingOTPEmail,
  orderShippedEmail,
} from "@/utils/email";

// Step 1: Request shipping OTP (generates OTP and sends to seller's email)
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

    // Get order and verify seller ownership
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        business: {
          include: {
            user: true,
          },
        },
        user: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Verify seller is the business owner
    if (order.business.userId !== authResult.userId) {
      return NextResponse.json(
        { error: "Unauthorized - You don't own this business" },
        { status: 403 }
      );
    }

    // Check if order is in processing status
    if (order.status !== "processing") {
      return NextResponse.json(
        { error: "Order must be in 'processing' status to ship" },
        { status: 400 }
      );
    }

    // Generate shipping OTP
    const shipOtp = generateOTP();
    const shipOtpExpiry = getOTPExpiry();

    // Update order with shipping OTP
    await prisma.order.update({
      where: { id: orderId },
      data: {
        shipOtp,
        shipOtpExpiry,
      },
    });

    // Send OTP to seller's email
    const emailData = shippingOTPEmail(
      `${order.business.user.firstName} ${order.business.user.lastName}`,
      order.id,
      shipOtp
    );
    emailData.to = order.business.user.email;
    await sendEmail(emailData);

    return NextResponse.json({
      message: "Shipping OTP sent to your email. Valid for 24 hours.",
    });
  } catch (error) {
    console.error("Request shipping OTP error:", error);
    return NextResponse.json(
      { error: "Failed to generate shipping OTP" },
      { status: 500 }
    );
  }
}

// Step 2: Verify OTP and mark as shipped
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

    // Verify seller is the business owner
    if (order.business.userId !== authResult.userId) {
      return NextResponse.json(
        { error: "Unauthorized - You don't own this business" },
        { status: 403 }
      );
    }

    // Verify shipping OTP
    if (!order.shipOtp || !order.shipOtpExpiry) {
      return NextResponse.json(
        { error: "No shipping OTP found. Please request a new one." },
        { status: 400 }
      );
    }

    if (new Date() > order.shipOtpExpiry) {
      return NextResponse.json(
        { error: "Shipping OTP has expired. Please request a new one." },
        { status: 400 }
      );
    }

    if (otp !== order.shipOtp) {
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
    }

    // Generate delivery OTP for buyer
    const deliveryOtp = generateOTP();
    const deliveryOtpExpiry = getOTPExpiry();

    // Mark order as shipped and generate delivery OTP
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "shipped",
        deliveryOtp,
        deliveryOtpExpiry,
        deliveryOtpAttempts: 0,
      },
    });

    // Send delivery OTP to buyer's email
    const emailData = orderShippedEmail(
      `${order.user.firstName} ${order.user.lastName}`,
      order.id,
      order.business.name,
      order.user.location || "Your address",
      deliveryOtp
    );
    emailData.to = order.user.email;
    await sendEmail(emailData);

    return NextResponse.json({
      message: "Order marked as shipped. Delivery OTP sent to buyer.",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Ship order error:", error);
    return NextResponse.json(
      { error: "Failed to ship order" },
      { status: 500 }
    );
  }
}
