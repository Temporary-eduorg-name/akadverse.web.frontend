import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deliveryReminderEmail, sendEmail } from "@/utils/email";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const cronSecret = process.env.CRON_SECRET;
    const headerSecret = req.headers.get("x-cron-secret");

    if (!cronSecret || headerSecret !== cronSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    const dueOrders = await prisma.order.findMany({
      where: {
        status: { in: ["processing", "shipped"] },
        expectedDeliveryDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
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
      },
    });

    let sent = 0;

    for (const order of dueOrders) {
      if (!order.business?.user?.email) continue;

      try {
        const emailData = deliveryReminderEmail(
          `${order.business.user.firstName} ${order.business.user.lastName}`,
          order.id,
          order.business.name
        );
        emailData.to = order.business.user.email;
        await sendEmail(emailData);

        await prisma.notification.create({
          data: {
            userId: order.business.user.id,
            type: "delivery_reminder",
            message: `Order #${order.id} is expected for delivery today.`,
            businessId: order.businessId,
          },
        });

        sent += 1;
      } catch (error) {
        console.error(`Failed to send reminder for order ${order.id}:`, error);
      }
    }

    return NextResponse.json({
      message: "Delivery reminders processed",
      totalDue: dueOrders.length,
      remindersSent: sent,
    });
  } catch (error) {
    console.error("Delivery reminders cron error:", error);
    return NextResponse.json(
      { error: "Failed to process delivery reminders" },
      { status: 500 }
    );
  }
}
