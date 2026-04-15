import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  sendEmail,
  orderProcessingEmail,
  orderDeclinedEmail,
} from "@/utils/email";

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
    const { status } = await req.json();

    // Validate status
    if (!["processing", "declined"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be 'processing' or 'declined'" },
        { status: 400 }
      );
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

    // Check if order is still pending
    if (order.status !== "pending") {
      return NextResponse.json(
        { error: `Order is already ${order.status}` },
        { status: 400 }
      );
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });

    // Send email to buyer
    if (status === "processing") {
      const emailData = orderProcessingEmail(
        `${order.user.firstName} ${order.user.lastName}`,
        order.id,
        order.business.name
      );
      emailData.to = order.user.email;
      await sendEmail(emailData);
    } else if (status === "declined") {
      const emailData = orderDeclinedEmail(
        `${order.user.firstName} ${order.user.lastName}`,
        order.id,
        order.business.name
      );
      emailData.to = order.user.email;
      await sendEmail(emailData);
    }

    return NextResponse.json({
      message: `Order ${status === "processing" ? "accepted" : "declined"} successfully`,
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Update order status error:", error);
    return NextResponse.json(
      { error: "Failed to update order status" },
      { status: 500 }
    );
  }
}
