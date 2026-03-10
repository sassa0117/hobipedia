import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatDate, formatPrice } from "@/lib/utils";
import { getSessionUser } from "@/lib/services/auth-helpers";

export const metadata = { title: "タイムライン - Hobipedia" };

export default async function TimelinePage() {
  const user = await getSessionUser();
  if (!user) redirect("/signin");

  // Get IDs of users I follow
  const follows = await prisma.follow.findMany({
    where: { followerId: user.id },
    select: { followingId: true },
  });
  const followingIds = [user.id, ...follows.map((f) => f.followingId)];

  // Fetch recent activities from followed users
  // Combine: new items, price reports, collection adds
  const [recentItems, recentPrices, recentComments] = await Promise.all([
    prisma.item.findMany({
      where: { createdById: { in: followingIds } },
      take: 20,
      orderBy: { createdAt: "desc" },
      select: {
        name: true,
        slug: true,
        imageUrl: true,
        createdAt: true,
        createdBy: { select: { name: true, username: true, image: true } },
      },
    }),
    prisma.priceReport.findMany({
      where: { userId: { in: followingIds } },
      take: 20,
      orderBy: { reportedAt: "desc" },
      select: {
        price: true,
        priceType: true,
        source: true,
        reportedAt: true,
        user: { select: { name: true, username: true, image: true } },
        item: { select: { name: true, slug: true } },
      },
    }),
    prisma.comment.findMany({
      where: { userId: { in: followingIds } },
      take: 20,
      orderBy: { createdAt: "desc" },
      select: {
        body: true,
        createdAt: true,
        user: { select: { name: true, username: true, image: true } },
        item: { select: { name: true, slug: true } },
      },
    }),
  ]);

  type TimelineEntry = {
    type: "item" | "price" | "comment";
    date: Date;
    user: { name: string; username: string | null; image: string | null };
    data: Record<string, unknown>;
  };

  const entries: TimelineEntry[] = [
    ...recentItems.map((i) => ({
      type: "item" as const,
      date: i.createdAt,
      user: i.createdBy!,
      data: { name: i.name, slug: i.slug, imageUrl: i.imageUrl },
    })),
    ...recentPrices.map((p) => ({
      type: "price" as const,
      date: p.reportedAt,
      user: p.user!,
      data: { price: p.price, priceType: p.priceType, itemName: p.item.name, itemSlug: p.item.slug },
    })),
    ...recentComments.map((c) => ({
      type: "comment" as const,
      date: c.createdAt,
      user: c.user,
      data: { body: c.body, itemName: c.item.name, itemSlug: c.item.slug },
    })),
  ];

  entries.sort((a, b) => b.date.getTime() - a.date.getTime());
  const timeline = entries.slice(0, 30);

  const PRICE_TYPE_LABELS: Record<string, string> = {
    SOLD: "実売", LISTING: "出品中", STORE_FIND: "店舗", WANT_TO_BUY: "買希望", WANT_TO_SELL: "売希望",
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-xl font-black text-white mb-6">タイムライン</h1>

      {timeline.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-sm text-slate-500 mb-2">まだアクティビティがありません</p>
          <p className="text-xs text-slate-600">
            ユーザーをフォローすると、ここにアクティビティが表示されます
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {timeline.map((entry, i) => (
            <div key={i} className="card p-4">
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7c5cfc]/50 to-[#a78bfa]/50 flex items-center justify-center text-[0.6rem] font-bold text-white shrink-0 overflow-hidden">
                  {entry.user.image ? (
                    <img src={entry.user.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    (entry.user.name?.[0] || "?").toUpperCase()
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  {/* User + action */}
                  <div className="text-xs mb-1">
                    {entry.user.username ? (
                      <Link href={`/user/${entry.user.username}`} className="font-medium text-white hover:text-[#a78bfa] transition-colors">
                        {entry.user.name}
                      </Link>
                    ) : (
                      <span className="font-medium text-white">{entry.user.name}</span>
                    )}
                    <span className="text-slate-500 ml-1.5">
                      {entry.type === "item" && "が商品を登録"}
                      {entry.type === "price" && "が相場を報告"}
                      {entry.type === "comment" && "がコメント"}
                    </span>
                    <span className="text-slate-700 ml-1.5">{formatDate(entry.date)}</span>
                  </div>

                  {/* Content */}
                  {entry.type === "item" && (
                    <Link
                      href={`/item/${entry.data.slug}`}
                      className="flex items-center gap-2 rounded-lg p-2 hover:bg-white/[0.03] transition-colors -mx-2"
                    >
                      <div className="w-10 h-10 rounded shrink-0 flex items-center justify-center" style={{ background: "var(--bg-elevated)" }}>
                        {entry.data.imageUrl ? (
                          <img src={entry.data.imageUrl as string} alt="" className="w-full h-full object-contain rounded" />
                        ) : (
                          <span className="text-[0.5rem] text-slate-600">📦</span>
                        )}
                      </div>
                      <span className="text-sm font-medium text-[#a78bfa]">{entry.data.name as string}</span>
                    </Link>
                  )}

                  {entry.type === "price" && (
                    <Link href={`/item/${entry.data.itemSlug}`} className="block">
                      <div className="text-xs text-slate-400">
                        <span className="text-white font-medium">{entry.data.itemName as string}</span>
                        <span className="mx-1.5 text-slate-700">•</span>
                        <span className="font-bold text-[#22c55e]">{formatPrice(entry.data.price as number)}</span>
                        <span className="ml-1 text-slate-600">
                          ({PRICE_TYPE_LABELS[entry.data.priceType as string] || String(entry.data.priceType)})
                        </span>
                      </div>
                    </Link>
                  )}

                  {entry.type === "comment" && (
                    <Link href={`/item/${entry.data.itemSlug}`} className="block">
                      <div className="text-xs text-slate-400 mb-0.5">
                        <span className="text-white font-medium">{entry.data.itemName as string}</span> へ
                      </div>
                      <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                        &ldquo;{entry.data.body as string}&rdquo;
                      </p>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
