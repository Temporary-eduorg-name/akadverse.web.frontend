import { NextRequest } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = verifyAuth(req);
  if (!auth.valid || !auth.userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userId = auth.userId;
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      let closed = false;
      const send = (event: string, data: unknown) => {
        if (closed) return;
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };

      const sendUnreadCount = async () => {
        const [unreadNotificationCount, unreadSkillCount] = await Promise.all([
          prisma.notification.count({
            where: { userId, read: false },
          }),
          prisma.skillNotification.count({
            where: { skill: { userId }, read: false },
          }),
        ]);

        send("update", {
          unreadCount: unreadNotificationCount + unreadSkillCount,
          timestamp: new Date().toISOString(),
        });
      };

      send("connected", { timestamp: new Date().toISOString() });

      sendUnreadCount().catch(() => {
        send("error", { message: "Failed to fetch notification count" });
      });

      const interval = setInterval(async () => {
        try {
          await sendUnreadCount();
        } catch {
          send("error", { message: "Failed to fetch notification count" });
        }
      }, 10000);

      const close = () => {
        closed = true;
        clearInterval(interval);
        try {
          controller.close();
        } catch {
          // stream is already closed
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
