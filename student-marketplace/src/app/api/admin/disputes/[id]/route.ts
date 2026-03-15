import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/utils/email";

// Resolve a dispute (admin only)
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const adminResult = await verifyAdmin(req);
    
    if (!adminResult.valid || !adminResult.userId) {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    const { id: orderId } = params;
    const { resolution, status } = await req.json();

    if (!resolution || resolution.trim().length < 10) {
      return NextResponse.json(
        { error: "Resolution must be at least 10 characters" },
        { status: 400 }
      );
    }

    if (!status || !["delivered", "processing"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be 'delivered' or 'processing' (for refund)" },
        { status: 400 }
      );
    }

    // Get order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        business: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (!order.isDisputed) {
      return NextResponse.json(
        { error: "This order is not disputed" },
        { status: 400 }
      );
    }

    // Update order
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: status,
        isDisputed: false,
        disputeResolvedAt: new Date(),
        disputeResolvedBy: adminResult.userId,
        disputeResolution: resolution,
      },
    });

    // Send notification to buyer
    await sendEmail({
      to: order.user.email,
      subject: "Dispute Resolved - Student Marketplace",
      text: `Your dispute for Order #${order.id} has been resolved.\n\nResolution: ${resolution}\n\nStatus: ${status === "delivered" ? "Completed" : "Refund Processing"}\n\nThank you for your patience.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10b981;">✅ Dispute Resolved</h2>
          <p>Your dispute for <strong>Order #${order.id}</strong> has been resolved.</p>
          <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Resolution:</strong> ${resolution}</p>
            <p><strong>Status:</strong> ${status === "delivered" ? "Completed" : "Refund Processing"}</p>
          </div>
          <p>Thank you for your patience.</p>
        </div>
      `,
    });

    // Send notification to seller
    await sendEmail({
      to: order.business.user.email,
      subject: "Dispute Resolved - Student Marketplace",
      text: `The dispute for Order #${order.id} has been resolved.\n\nResolution: ${resolution}\n\nStatus: ${status === "delivered" ? "Completed" : "Refund Processing"}\n\nThank you for your cooperation.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10b981;">✅ Dispute Resolved</h2>
          <p>The dispute for <strong>Order #${order.id}</strong> has been resolved.</p>
          <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Resolution:</strong> ${resolution}</p>
            <p><strong>Status:</strong> ${status === "delivered" ? "Completed" : "Refund Processing"}</p>
          </div>
          <p>Thank you for your cooperation.</p>
        </div>
      `,
    });

    return NextResponse.json({
      message: "Dispute resolved successfully",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Resolve dispute error:", error);
    return NextResponse.json(
      { error: "Failed to resolve dispute" },
      { status: 500 }
    );
  }
}
