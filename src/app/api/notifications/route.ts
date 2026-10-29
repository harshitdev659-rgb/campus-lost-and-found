import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const user = await requireAuth(req);

    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 30,
      }),
      prisma.notification.count({
        where: { userId: user.id, isRead: false },
      }),
    ]);

    return NextResponse.json({ notifications, unreadCount });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to load notifications";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await requireAuth(req);
    const body = await req.json().catch(() => ({}));

    if (body.notificationId) {
      await prisma.notification.updateMany({
        where: { id: body.notificationId, userId: user.id },
        data: { isRead: true },
      });
    } else {
      // Mark all read
      await prisma.notification.updateMany({
        where: { userId: user.id, isRead: false },
        data: { isRead: true },
      });
    }

    return NextResponse.json({ message: "Notifications updated" });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to update notifications";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
