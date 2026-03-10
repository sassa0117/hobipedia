import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { getSessionUser } from "@/lib/services/auth-helpers";
import { MarkAllReadButton } from "@/components/social/mark-all-read-button";

export const metadata = { title: "通知 - Hobipedia" };

const NOTIFICATION_MESSAGES: Record<string, string> = {
  NEW_FOLLOWER: "があなたをフォローしました",
  ITEM_LIKED: "があなたの商品にいいねしました",
  COMMENT_LIKED: "があなたのコメントにいいねしました",
  PRICE_REPORT: "が相場を報告しました",
  ITEM_EDITED: "が商品情報を編集しました",
  NEW_COMMENT: "がコメントしました",
};

export default async function NotificationsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/signin");

  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      actor: { select: { name: true, username: true, image: true } },
    },
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Get item names for notifications with itemId
  const itemIds = notifications.map((n) => n.itemId).filter(Boolean) as string[];
  const items = itemIds.length > 0
    ? await prisma.item.findMany({
        where: { id: { in: itemIds } },
        select: { id: true, name: true, slug: true },
      })
    : [];
  const itemMap = new Map(items.map((i) => [i.id, i]));

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-black text-white">
          通知
          {unreadCount > 0 && (
            <span className="ml-2 text-sm font-normal bg-[#7c5cfc] text-white px-2 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </h1>
        {unreadCount > 0 && <MarkAllReadButton />}
      </div>

      {notifications.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-sm text-slate-500">まだ通知はありません</p>
        </div>
      ) : (
        <div className="space-y-1">
          {notifications.map((notif) => {
            const item = notif.itemId ? itemMap.get(notif.itemId) : null;
            const href = notif.type === "NEW_FOLLOWER" && notif.actor?.username
              ? `/user/${notif.actor.username}`
              : item
                ? `/item/${item.slug}`
                : "#";

            return (
              <Link
                key={notif.id}
                href={href}
                className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                  notif.read
                    ? "hover:bg-white/[0.02]"
                    : "bg-[#7c5cfc]/[0.06] hover:bg-[#7c5cfc]/[0.1]"
                }`}
              >
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7c5cfc]/50 to-[#a78bfa]/50 flex items-center justify-center text-[0.6rem] font-bold text-white shrink-0 overflow-hidden">
                  {notif.actor?.image ? (
                    <img src={notif.actor.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    (notif.actor?.name?.[0] || "?").toUpperCase()
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-xs">
                    <span className="font-medium text-white">
                      {notif.actor?.name || "誰か"}
                    </span>
                    <span className="text-slate-400">
                      {NOTIFICATION_MESSAGES[notif.type] || "がアクションしました"}
                    </span>
                  </div>
                  {item && (
                    <div className="text-[0.65rem] text-[#a78bfa] mt-0.5 truncate">
                      {item.name}
                    </div>
                  )}
                  <div className="text-[0.6rem] text-slate-600 mt-0.5">
                    {formatDate(notif.createdAt)}
                  </div>
                </div>

                {!notif.read && (
                  <div className="w-2 h-2 rounded-full bg-[#7c5cfc] shrink-0 mt-1.5" />
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
