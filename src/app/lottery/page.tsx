import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate, formatPrice } from "@/lib/utils";
import { LotteryPlaceholder } from "@/components/ui/placeholders";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "一番くじ データベース - Hobipedia",
  description: "一番くじの相場データベース。ロット別に賞品の相場をチェック。",
};

export default async function LotteryListPage() {
  const lotteries = await prisma.lottery.findMany({
    orderBy: { releaseDate: "desc" },
    include: {
      series: true,
      _count: { select: { prizes: true } },
      prizes: {
        include: {
          items: {
            include: {
              priceReports: { orderBy: { reportedAt: "desc" }, take: 1 },
            },
          },
        },
      },
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-black text-white mb-1">一番くじ データベース</h1>
        <p className="text-sm text-slate-500">
          {lotteries.length}ロット登録中 &mdash; ロットを選んで各賞品の相場をチェック
        </p>
      </div>

      {lotteries.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {lotteries.map((lottery) => {
            // Calculate total items and avg price for the lottery
            const allItems = lottery.prizes.flatMap((p) => p.items);
            const allPrices = allItems.flatMap((i) => i.priceReports).map((r) => r.price);
            const topPrice = allPrices.length > 0 ? Math.max(...allPrices) : null;

            return (
              <Link
                key={lottery.id}
                href={`/lottery/${lottery.slug}`}
                className="card overflow-hidden group"
              >
                {/* Image area */}
                <div className="aspect-[16/9] flex items-center justify-center relative"
                  style={{ background: "linear-gradient(135deg, var(--bg-elevated), var(--bg-card))" }}>
                  {lottery.imageUrl ? (
                    <img src={lottery.imageUrl} alt={lottery.name} className="w-full h-full object-cover" />
                  ) : (
                    <LotteryPlaceholder />
                  )}
                  {/* Status badge */}
                  <div className="absolute top-3 left-3">
                    <span className="text-[0.6rem] font-bold px-2 py-0.5 rounded-full bg-[#ef4444]/90 text-white">
                      {lottery._count.prizes}賞
                    </span>
                  </div>
                  {/* Top price badge */}
                  {topPrice && (
                    <div className="absolute top-3 right-3">
                      <span className="text-[0.6rem] font-bold px-2 py-0.5 rounded-full bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/30">
                        MAX {formatPrice(topPrice)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  {lottery.series && <div className="series-tag text-[0.6rem] mb-2">{lottery.series.name}</div>}
                  <h2 className="font-bold text-sm text-slate-200 leading-snug mb-2 group-hover:text-white transition-colors">
                    {lottery.name}
                  </h2>
                  <div className="flex items-center gap-3 text-[0.7rem] text-slate-500">
                    {lottery.releaseDate && (
                      <span>{formatDate(lottery.releaseDate)}</span>
                    )}
                    {lottery.price && (
                      <span>{formatPrice(lottery.price)}/回</span>
                    )}
                    <span>{allItems.length}アイテム</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-20">
      <div className="text-5xl mb-4 opacity-30">&#x1f3b0;</div>
      <h2 className="text-lg font-bold text-white mb-2">まだデータがありません</h2>
      <p className="text-sm text-slate-500 mb-6">
        最初のコントリビューターになりませんか？
      </p>
      <Link href="/lottery/new" className="btn-primary text-sm">
        一番くじを登録する
      </Link>
    </div>
  );
}
