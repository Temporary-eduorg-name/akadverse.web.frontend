import { NextRequest } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const authResult = verifyAuth(req);
  if (!authResult.valid || !authResult.userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const scope = searchParams.get("scope") || "buyer";
  const businessId = searchParams.get("businessId");
  const skillId = searchParams.get("skillId");

  if (scope === "seller") {
    if (!businessId) {
      return new Response("businessId is required for seller scope", { status: 400 });
    }

    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: { userId: true },
    });

    if (!business || business.userId !== authResult.userId) {
      return new Response("Unauthorized", { status: 403 });
    }
  }

  if (scope === "skill_owner") {
    // skillId is optional - if not provided, listen to all skills for the user
    if (skillId) {
      const skill = await prisma.skill.findUnique({
        where: { id: skillId },
        select: { userId: true },
      });

      if (!skill || skill.userId !== authResult.userId) {
        return new Response("Unauthorized", { status: 403 });
      }
    }
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
        );
      };

      send("connected", {
        timestamp: new Date().toISOString(),
        scope,
      });

      // Heartbeat interval (every 30s)
      const heartbeat = setInterval(() => {
        send("ping", { timestamp: new Date().toISOString() });
      }, 30000);

      // Data update interval (every 10s)
      const interval = setInterval(async () => {
        try {
          if (scope === "seller" && businessId) {
            const [pending, processing, shipped, unreadNotifications] = await Promise.all([
              prisma.order.count({ where: { businessId, status: "pending" } }),
              prisma.order.count({ where: { businessId, status: "processing" } }),
              prisma.order.count({ where: { businessId, status: "shipped" } }),
              prisma.notification.count({ where: { businessId, read: false } }),
            ]);
            send("update", {
              pending,
              processing,
              shipped,
              unreadNotifications,
              timestamp: new Date().toISOString(),
            });
          } else if (scope === "skill_owner" && skillId) {
            const [pendingOffers, negotiatedOffers, ongoingOffers, unreadNotifications] = await Promise.all([
              prisma.skillOffer.count({ where: { skillId, status: "pending" } }),
              prisma.skillOffer.count({ where: { skillId, status: "negotiated" } }),
              prisma.skillOffer.count({ where: { skillId, status: "ongoing" } }),
              prisma.skillNotification.count({ where: { skillId, read: false } }),
            ]);
            send("update", {
              pendingOffers,
              negotiatedOffers,
              ongoingOffers,
              unreadNotifications,
              timestamp: new Date().toISOString(),
            });
          } else if (scope === "skill_owner" && !skillId) {
            // Aggregated stats for all skills owned by the user
            const [pendingOffers, negotiatedOffers, ongoingOffers, unreadNotifications] = await Promise.all([
              prisma.skillOffer.count({ where: { skill: { userId: authResult.userId }, status: "pending" } }),
              prisma.skillOffer.count({ where: { skill: { userId: authResult.userId }, status: "negotiated" } }),
              prisma.skillOffer.count({ where: { skill: { userId: authResult.userId }, status: "ongoing" } }),
              prisma.skillNotification.count({ where: { skill: { userId: authResult.userId }, read: false } }),
            ]);
            send("update", {
              pendingOffers,
              negotiatedOffers,
              ongoingOffers,
              unreadNotifications,
              timestamp: new Date().toISOString(),
            });
          } else if (scope === "buyer") {
            const [activeOrders, shippedOrders, disputedOrders, activeOffers, negotiatedOffers, unreadOfferNotifications] = await Promise.all([
              prisma.order.count({ where: { userId: authResult.userId, status: { in: ["pending", "processing"] } } }),
              prisma.order.count({ where: { userId: authResult.userId, status: "shipped" } }),
              prisma.order.count({ where: { userId: authResult.userId, status: "disputed" } }),
              prisma.skillOffer.count({ where: { buyerId: authResult.userId, status: { in: ["pending", "ongoing"] } }}),
              prisma.skillOffer.count({ where: { buyerId: authResult.userId, status: "negotiated" } }),
              prisma.notification.count({ where: { userId: authResult.userId, read: false, type: { startsWith: "skill_offer_owner_update" } } }),
            ]);
            send("update", {
              activeOrders,
              shippedOrders,
              disputedOrders,
              activeOffers,
              negotiatedOffers,
              unreadOfferNotifications,
              timestamp: new Date().toISOString(),
            });
          }
        } catch (error) {
          send("error", { message: "Failed to fetch realtime updates" });
        }
      }, 10000);

      const close = () => {
        clearInterval(interval);
        clearInterval(heartbeat);
        try {
          controller.close();
        } catch {
          // stream already closed
        }
      };

      req.signal.addEventListener("abort", close);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}