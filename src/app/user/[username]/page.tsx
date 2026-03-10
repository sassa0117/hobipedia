import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatDate, formatPrice } from "@/lib/utils";
import { FollowButton } from "@/components/social/follow-button";
import { getSessionUser } from "@/lib/services/auth-helpers";

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const user = await prisma.user.findFirst({ where: { username } });
  if (!user) return { title: "Not Found" };
  return { title: `${user.displayName || user.name} - Hobipedia` };
}

export default async function UserProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;

  const user = await prisma.user.findFirst({
    where: { username },
    include: {
      _count: {
        select: {
          followers: true,
          following: true,
          collections: true,
          createdItems: true,
          priceReports: true,
          comments: true,
        },
      },
      collections: {
        where: { isPublic: true },
        take: 12,
        orderBy: { addedAt: "desc" },
        include: {
          item: {
            select: { name: true, slug: true, imageUrl: true, category: true },
          },
        },
      },
    },
  });

  if (!user) notFound();

  const me = await getSessionUser();
  const isFollowing = me
    ? !!(await prisma.follow.findUnique({
        where: { followerId_followingId: { followerId: me.id, followingId: user.id } },
      }))
    : false;

  // Recent activity
  const recentItems = await prisma.item.findMany({
    where: { createdById: user.id },
    take: 6,
    orderBy: { createdAt: "desc" },
    select: { name: true, slug: true, imageUrl: true, category: true, createdAt: true },
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="card p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#7c5cfc] to-[#a78bfa] flex items-center justify-center text-2xl font-black text-white shrink-0">
            {user.image ? (
              <img src={user.image} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
              (user.name?.[0] || "?").toUpperCase()
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-xl font-black text-white truncate">
                {user.displayName || user.name}
              </h1>
              <FollowButton targetUserId={user.id} initialFollowing={isFollowing} />
            </div>
            {user.username && (
              <div className="text-sm text-slate-500 mb-2">@{user.username}</div>
            )}
            {user.bio && (
              <p className="text-xs text-slate-400 leading-relaxed mb-3">{user.bio}</p>
            )}
            <div className="flex items-center gap-4 text-xs">
              <span className="text-slate-400">
                <span className="font-bold text-white">{user._count.following}</span> フォロー
              </span>
              <span className="text-slate-400">
                <span className="font-bold text-white">{user._count.followers}</span> フォロワー
              </span>
              <span className="text-slate-400">
                <span className="font-bold text-white">{user._count.collections}</span> コレクション
              </span>
              <span className="text-slate-400">
                <span className="font-bold text-white">{user._count.createdItems}</span> 登録
              </span>
            </div>
            {(user.twitterHandle || user.website) && (
              <div className="flex items-center gap-3 mt-2">
                {user.twitterHandle && (
                  <a
                    href={`https://x.com/${user.twitterHandle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[0.65rem] text-[#a78bfa] hover:text-[#c4b5fd]"
                  >
                    @{user.twitterHandle}
                  </a>
                )}
                {user.website && (
                  <a
                    href={user.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[0.65rem] text-slate-500 hover:text-slate-300 truncate max-w-[200px]"
                  >
                    {user.website.replace(/^https?:\/\//, "")}
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Collection */}
        <div className="card overflow-hidden">
          <div className="px-5 py-3 border-b border-white/[0.06] flex items-center justify-between" style={{ background: "var(--bg-elevated)" }}>
            <h2 className="text-sm font-bold text-white">コレクション</h2>
            <span className="text-[0.6rem] text-slate-500">{user._count.collections}件</span>
          </div>
          {user.collections.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-600">公開コレクションなし</div>
          ) : (
            <div className="grid grid-cols-3 gap-px" style={{ background: "rgba(255,255,255,0.04)" }}>
              {user.collections.map((col) => (
                <Link
                  key={col.id}
                  href={`/item/${col.item.slug}`}
                  className="block aspect-square relative group"
                  style={{ background: "var(--bg-card)" }}
                >
                  {col.item.imageUrl ? (
                    <img src={col.item.imageUrl} alt={col.item.name} className="w-full h-full object-contain" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[0.5rem] text-slate-600 px-1 text-center">
                      {col.item.name}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-1.5">
                    <span className="text-[0.55rem] text-white leading-tight line-clamp-2">{col.item.name}</span>
                  </div>
                  {col.sellPrice && (
                    <div className="absolute top-1 right-1 bg-[#22c55e]/90 text-[0.5rem] text-white px-1 rounded">
                      {formatPrice(col.sellPrice)}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Created Items */}
        <div className="card overflow-hidden">
          <div className="px-5 py-3 border-b border-white/[0.06] flex items-center justify-between" style={{ background: "var(--bg-elevated)" }}>
            <h2 className="text-sm font-bold text-white">登録した商品</h2>
            <span className="text-[0.6rem] text-slate-500">{user._count.createdItems}件</span>
          </div>
          {recentItems.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-600">まだ商品を登録していません</div>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {recentItems.map((item) => (
                <Link
                  key={item.slug}
                  href={`/item/${item.slug}`}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.02] transition-colors"
                >
                  <div
                    className="w-10 h-10 rounded shrink-0 flex items-center justify-center"
                    style={{ background: "var(--bg-elevated)" }}
                  >
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt="" className="w-full h-full object-contain rounded" />
                    ) : (
                      <span className="text-[0.5rem] text-slate-600">No img</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-white font-medium truncate">{item.name}</div>
                    <div className="text-[0.6rem] text-slate-600">{formatDate(item.createdAt)}</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
