import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/utils/email";

// Buyer or seller creates a dispute
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
    const { reason } = await req.json();

    if (!reason || reason.trim().length < 10) {
      return NextResponse.json(
        { error: "Dispute reason must be at least 10 characters" },
        { status: 400 }
      );
    }

    // Get order
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

    // Verify user is either buyer or seller
    const isBuyer = order.userId === authResult.userId;
    const isSeller = order.business.userId === authResult.userId;

    if (!isBuyer && !isSeller) {
      return NextResponse.json(
        { error: "Unauthorized - You are not part of this order" },
        { status: 403 }
      );
    }

    // Check order status based on who is disputing
    if (isSeller) {
      // Sellers can dispute shipped or delivered orders
      if (order.status !== "shipped" && order.status !== "delivered") {
        return NextResponse.json(
          { error: "Order must be shipped or delivered to dispute" },
          { status: 400 }
        );
      }
    } else {
      // Buyers can dispute pending, processing, shipped, or delivered orders
      if (!["pending", "processing", "shipped", "delivered"].includes(order.status)) {
        return NextResponse.json(
          { error: "Cannot dispute this order" },
          { status: 400 }
        );
      }
    }

    // Check if already disputed
    if (order.isDisputed) {
      return NextResponse.json(
        { error: "This order is already disputed" },
        { status: 400 }
      );
    }

    // Check if within 24-hour dispute window (only for delivered orders)
    // No time limit for pending/processing orders
    if (order.status === "delivered" && order.updatedAt && isBuyer) {
      const hoursSinceDelivery = (Date.now() - order.updatedAt.getTime()) / (1000 * 60 * 60);
      if (hoursSinceDelivery > 24) {
        return NextResponse.json(
          { error: "Dispute window (24 hours) has expired" },
          { status: 400 }
        );
      }
    }

    // Create dispute
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "disputed",
        isDisputed: true,
        disputeReason: reason,
        disputeCreatedAt: new Date(),
      },
    });

    // Send notification to super-admin users
    const admins = await prisma.user.findMany({
      where: { role: "super-admin" },
    });

    const disputeFiledBy = isSeller ? "Seller" : "Buyer";
    const disputeOrderStatus = order.status;

    for (const admin of admins) {
      await sendEmail({
        to: admin.email,
        subject: "New Order Dispute - Student Marketplace",
        text: `A dispute has been filed for Order #${order.id}.\n\nFiled by: ${disputeFiledBy}\nOrder Status: ${disputeOrderStatus}\nBuyer: ${order.user.email}\nSeller: ${order.business.name}\nReason: ${reason}\n\nPlease review this dispute in the admin dashboard.`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #ef4444;">🚨 New Order Dispute</h2>
            <p>A dispute has been filed for <strong>Order #${order.id}</strong>.</p>
            <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Filed by:</strong> ${disputeFiledBy}</p>
              <p><strong>Order Status:</strong> ${disputeOrderStatus}</p>
              <p><strong>Buyer:</strong> ${order.user.email}</p>
              <p><strong>Seller:</strong> ${order.business.name}</p>
              <p><strong>Reason:</strong> ${reason}</p>
            </div>
            <p>Please review this dispute in the admin dashboard.</p>
          </div>
        `,
      });
    }

    return NextResponse.json({
      message: "Dispute filed successfully. An admin will review your case.",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Create dispute error:", error);
    return NextResponse.json(
      { error: "Failed to create dispute" },
      { status: 500 }
    );
  }
}
