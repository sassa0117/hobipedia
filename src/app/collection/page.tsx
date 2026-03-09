import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { ItemPlaceholder } from "@/components/ui/placeholders";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "コレクション - Hobipedia",
  description: "あなたのアニメグッズコレクションを管理。持っている・欲しい・売りたいを整理。",
};

export default async function CollectionPage() {
  // For now (no auth), show a landing page + global collection stats
  const [totalCollections, topCollected] = await Promise.all([
    prisma.collectionItem.count(),
    prisma.item.findMany({
      orderBy: { collections: { _count: "desc" } },
      where: { collections: { some: {} } },
      include: {
        prize: { include: { lottery: true } },
        priceReports: { orderBy: { reportedAt: "desc" }, take: 1 },
        _count: { select: { collections: true } },
      },
      take: 12,
    }),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero */}
      <div className="card p-8 mb-8 text-center" style={{ background: "linear-gradient(135deg, var(--bg-card), var(--bg-elevated))" }}>
        <h1 className="text-2xl font-black text-white mb-2">コレクション</h1>
        <p className="text-sm text-slate-400 mb-6 max-w-md mx-auto">
          持っている・欲しい・売りたいアイテムを管理。<br />
          ログインしてあなたのコレクションを始めましょう。
        </p>
        <div className="flex justify-center gap-3">
          <Link href="/auth/signin" className="btn-primary text-sm">
            ログインして始める
          </Link>
        </div>

        {/* Stats */}
        {totalCollections > 0 && (
          <div className="mt-6 pt-6 border-t border-white/[0.06]">
            <div className="text-3xl font-black bg-gradient-to-r from-[#7c5cfc] to-[#a78bfa] bg-clip-text text-transparent">
              {totalCollections}
            </div>
            <div className="text-xs text-slate-500 mt-1">コレクション登録数</div>
          </div>
        )}
      </div>

      {/* Collection status legend */}
      <div className="flex items-center gap-6 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#22c55e]" />
          <span className="text-xs text-slate-400">持ってる (Have)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#f472b6]" />
          <span className="text-xs text-slate-400">欲しい (Want)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#38bdf8]" />
          <span className="text-xs text-slate-400">売りたい (For Sale)</span>
        </div>
      </div>

      {/* Top collected items */}
      {topCollected.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-white mb-4">人気コレクションアイテム</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {topCollected.map((item) => {
              const latestPrice = item.priceReports[0];
              return (
                <Link
                  key={item.id}
                  href={`/item/${item.slug}`}
                  className="card p-3 group"
                >
                  <div className="aspect-square rounded-lg mb-3 flex items-center justify-center overflow-hidden"
                    style={{ background: "var(--bg-elevated)" }}>
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <ItemPlaceholder size="md" />
                    )}
                  </div>
                  <div className="series-tag text-[0.6rem] mb-1.5 truncate">
                    {item.prize.lottery.series}
                  </div>
                  <div className="text-xs font-bold text-slate-200 leading-snug mb-1 line-clamp-2 group-hover:text-white transition-colors">
                    {item.name}
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    {latestPrice ? (
                      <span className="text-sm font-black text-[#22c55e]">
                        {formatPrice(latestPrice.price)}
                      </span>
                    ) : (
                      <span className="text-[0.65rem] text-slate-600">—</span>
                    )}
                    <span className="text-[0.6rem] text-slate-500">
                      <span className="stat-owned font-bold">{item._count.collections}</span> コレ
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {topCollected.length === 0 && (
        <div className="text-center py-16">
          <div className="text-4xl mb-4 opacity-20">📦</div>
          <p className="text-slate-400 mb-2">まだコレクションデータがありません</p>
          <p className="text-sm text-slate-600">最初のコレクターになりましょう</p>
        </div>
      )}
    </div>
  );
}
