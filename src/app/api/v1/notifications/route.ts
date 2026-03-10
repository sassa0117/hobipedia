import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/services/auth-helpers";

// GET /api/v1/notifications
export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      actor: { select: { name: true, username: true, image: true } },
    },
  });

  const unreadCount = await prisma.notification.count({
    where: { userId: user.id, read: false },
  });

  return NextResponse.json({ notifications, unreadCount });
}
