import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatDate, formatPrice } from "@/lib/utils";
import { LotteryPlaceholder, ItemPlaceholder } from "@/components/ui/placeholders";
// Grade badge color map (一番くじ公式 ref: 賞ヒエラルキー)
const gradeBadge: Record<string, string> = {
  "A賞": "badge-a",
  "B賞": "badge-b",
  "C賞": "badge-c",
  "D賞": "badge-d",
  "E賞": "badge-e",
  "ラストワン賞": "badge-last",
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const lottery = await prisma.lottery.findUnique({ where: { slug } });
  if (!lottery) return { title: "Not Found" };
  return {
    title: `${lottery.name} - Hobipedia`,
    description: `${lottery.name}の各賞品の相場データ。`,
  };
}

export default async function LotteryDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const lottery = await prisma.lottery.findUnique({
    where: { slug },
    include: {
      prizes: {
        orderBy: { grade: "asc" },
        include: {
          items: {
            include: {
              priceReports: { orderBy: { reportedAt: "desc" }, take: 5 },
              _count: { select: { collections: true } },
            },
          },
        },
      },
    },
  });

  if (!lottery) notFound();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-xs text-slate-500 mb-6 flex items-center gap-1.5">
        <Link href="/lottery" className="hover:text-[#a78bfa] transition-colors">一番くじ</Link>
        <span className="text-slate-700">/</span>
        <span className="text-slate-300">{lottery.name}</span>
      </nav>

      {/* Lottery Header */}
      <div className="card p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-start gap-6">
          {/* Image */}
          <div className="w-full md:w-48 aspect-video md:aspect-square rounded-lg flex items-center justify-center shrink-0"
            style={{ background: "var(--bg-elevated)" }}>
            {lottery.imageUrl ? (
              <img src={lottery.imageUrl} alt={lottery.name} className="w-full h-full object-cover rounded-lg" />
            ) : (
              <LotteryPlaceholder />
            )}
          </div>

          <div className="flex-1">
            <div className="series-tag text-[0.6rem] mb-2">{lottery.series}</div>
            <h1 className="text-xl md:text-2xl font-black text-white mb-3">{lottery.name}</h1>

            {/* Meta grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              {lottery.releaseDate && (
                <MetaItem label="発売日" value={formatDate(lottery.releaseDate)} />
              )}
              {lottery.price && (
                <MetaItem label="1回" value={formatPrice(lottery.price)} />
              )}
              <MetaItem label="メーカー" value={lottery.maker} />
              <MetaItem label="賞数" value={`${lottery.prizes.length}賞`} />
            </div>

            {lottery.description && (
              <p className="mt-4 text-xs text-slate-400 leading-relaxed">{lottery.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Prizes - 一番くじ公式 ref: 賞ごとにセクション、A賞を大きく */}
      <h2 className="text-lg font-bold text-white mb-4">賞品一覧</h2>
      <div className="space-y-4">
        {lottery.prizes.map((prize) => {
          const badgeClass = gradeBadge[prize.grade] || "badge-e";
          return (
            <div key={prize.id} className="card overflow-hidden">
              {/* Prize header */}
              <div className="px-5 py-3 flex items-center gap-3 border-b border-white/[0.06]"
                style={{ background: "var(--bg-elevated)" }}>
                <span className={`${badgeClass} text-xs font-black px-2.5 py-1 rounded-md`}>
                  {prize.grade}
                </span>
                <span className="font-bold text-sm text-white">{prize.name}</span>
                {prize.quantity && (
                  <span className="text-[0.65rem] text-slate-500 ml-auto">{prize.quantity}個</span>
                )}
              </div>

              {/* Items grid */}
              <div className="p-4">
                {prize.items.length === 0 ? (
                  <p className="text-xs text-slate-600">アイテムが未登録です</p>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {prize.items.map((item) => {
                      const latestPrice = item.priceReports[0];
                      const prices = item.priceReports.map((r) => r.price);
                      const avgPrice = prices.length > 0 ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : null;

                      return (
                        <Link
                          key={item.id}
                          href={`/item/${item.slug}`}
                          className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/[0.03] transition-colors group"
                        >
                          {/* Thumbnail */}
                          <div className="w-14 h-14 rounded-lg flex items-center justify-center shrink-0 text-lg"
                            style={{ background: "var(--bg-primary)" }}>
                            {item.imageUrl ? (
                              <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                            ) : (
                              <ItemPlaceholder size="sm" />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-bold text-slate-300 leading-snug mb-0.5 group-hover:text-white transition-colors line-clamp-2">
                              {item.name}
                            </div>
                            {item.character && (
                              <div className="text-[0.6rem] text-slate-600 mb-1">{item.character}</div>
                            )}
                            <div className="flex items-center gap-2">
                              {latestPrice ? (
                                <span className="text-sm font-black text-[#22c55e]">
                                  {formatPrice(latestPrice.price)}
                                </span>
                              ) : (
                                <span className="text-[0.6rem] text-slate-600">相場データなし</span>
                              )}
                              {avgPrice && latestPrice && avgPrice !== latestPrice.price && (
                                <span className="text-[0.6rem] text-slate-500">
                                  平均 {formatPrice(avgPrice)}
                                </span>
                              )}
                            </div>
                            {/* MFC-style collection stats */}
                            {item._count.collections > 0 && (
                              <div className="text-[0.6rem] text-slate-600 mt-0.5">
                                <span className="stat-owned">{item._count.collections}</span> コレクション中
                              </div>
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg p-2" style={{ background: "var(--bg-elevated)" }}>
      <div className="text-[0.6rem] text-slate-500 mb-0.5">{label}</div>
      <div className="font-bold text-slate-200">{value}</div>
    </div>
  );
}
