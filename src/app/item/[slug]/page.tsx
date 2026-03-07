import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatDate, formatPrice } from "@/lib/utils";

const SOURCE_LABELS: Record<string, string> = {
  MERCARI: "メルカリ",
  YAHOO_AUCTION: "ヤフオク",
  YAHOO_FREEMARKET: "Yahoo!フリマ",
  SURUGAYA: "駿河屋",
  MANDARAKE: "まんだらけ",
  LASHINBAN: "らしんばん",
  AMAZON: "Amazon",
  USER_REPORT: "ユーザー報告",
  OTHER: "その他",
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = await prisma.item.findUnique({
    where: { slug },
    include: { prize: { include: { lottery: true } } },
  });
  if (!item) return { title: "Not Found" };
  return {
    title: `${item.name} 相場・価格推移 - Hobipedia`,
    description: `${item.prize.lottery.name} ${item.prize.grade} ${item.name}の相場データ。`,
  };
}

export default async function ItemDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = await prisma.item.findUnique({
    where: { slug },
    include: {
      prize: { include: { lottery: true } },
      priceReports: { orderBy: { reportedAt: "desc" }, take: 50 },
      comments: {
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { user: { select: { displayName: true, name: true, image: true } } },
      },
      _count: { select: { collections: true, priceReports: true } },
    },
  });

  if (!item) notFound();

  const lottery = item.prize.lottery;
  const prices = item.priceReports.map((r) => r.price);
  const avgPrice = prices.length > 0 ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : null;
  const minPrice = prices.length > 0 ? Math.min(...prices) : null;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : null;
  const latestPrice = item.priceReports[0];

  // Price trend (compare latest vs average)
  const priceTrend = latestPrice && avgPrice
    ? latestPrice.price > avgPrice ? "up" : latestPrice.price < avgPrice ? "down" : "neutral"
    : "neutral";

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-xs text-slate-500 mb-6 flex items-center gap-1.5 flex-wrap">
        <Link href="/lottery" className="hover:text-[#a78bfa] transition-colors">一番くじ</Link>
        <span className="text-slate-700">/</span>
        <Link href={`/lottery/${lottery.slug}`} className="hover:text-[#a78bfa] transition-colors">
          {lottery.name}
        </Link>
        <span className="text-slate-700">/</span>
        <span className="text-slate-300">{item.prize.grade}</span>
      </nav>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* ===== Main Column ===== */}
        <div className="lg:col-span-2 space-y-6">

          {/* Item Header Card */}
          <div className="card p-6">
            <div className="flex items-start gap-2 mb-1">
              <div className="series-tag text-[0.6rem]">{lottery.series}</div>
              <span className="text-[0.6rem] text-slate-600">{item.prize.grade}</span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-white mb-1">{item.name}</h1>
            {item.character && (
              <div className="text-sm text-slate-500 mb-4">{item.character}</div>
            )}

            {/* PriceCharting-style: Price stats with trend indicator */}
            {avgPrice ? (
              <div className="grid grid-cols-3 gap-3 mt-4">
                <PriceStat
                  label="最新相場"
                  value={latestPrice?.price ?? avgPrice}
                  trend={priceTrend}
                  source={latestPrice ? SOURCE_LABELS[latestPrice.source] || latestPrice.source : undefined}
                />
                <PriceStat label="最安値" value={minPrice!} variant="low" />
                <PriceStat label="最高値" value={maxPrice!} variant="high" />
              </div>
            ) : (
              <div className="rounded-lg p-4 text-center text-xs text-slate-500 mt-4"
                style={{ background: "var(--bg-elevated)" }}>
                まだ相場データがありません。最初の報告をお待ちしています。
              </div>
            )}

            {/* MFC-style: Collection stats */}
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/[0.06]">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[#22c55e]" />
                <span className="text-xs text-slate-400">
                  <span className="font-bold text-slate-200">{item._count.collections}</span> コレクション中
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[#a78bfa]" />
                <span className="text-xs text-slate-400">
                  <span className="font-bold text-slate-200">{item._count.priceReports}</span> 相場報告
                </span>
              </div>
            </div>
          </div>

          {/* Price History Table (PriceCharting ref: dense data table) */}
          <div className="card overflow-hidden">
            <div className="px-5 py-3 border-b border-white/[0.06]" style={{ background: "var(--bg-elevated)" }}>
              <h2 className="text-sm font-bold text-white">
                相場履歴
                <span className="ml-2 text-xs font-normal text-slate-500">
                  ({item._count.priceReports}件)
                </span>
              </h2>
            </div>
            {item.priceReports.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-600">データなし</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>日時</th>
                      <th className="text-right">価格</th>
                      <th>ソース</th>
                      <th>状態</th>
                    </tr>
                  </thead>
                  <tbody>
                    {item.priceReports.map((report) => (
                      <tr key={report.id}>
                        <td className="text-slate-400 text-xs">{formatDate(report.reportedAt)}</td>
                        <td className="text-right font-bold text-white">{formatPrice(report.price)}</td>
                        <td>
                          {report.sourceUrl ? (
                            <a href={report.sourceUrl} target="_blank" rel="noopener noreferrer"
                              className="text-[#a78bfa] hover:text-[#c4b5fd] text-xs">
                              {SOURCE_LABELS[report.source] || report.source}
                            </a>
                          ) : (
                            <span className="text-xs">{SOURCE_LABELS[report.source] || report.source}</span>
                          )}
                        </td>
                        <td className="text-xs">{report.condition || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Comments */}
          <div className="card overflow-hidden">
            <div className="px-5 py-3 border-b border-white/[0.06]" style={{ background: "var(--bg-elevated)" }}>
              <h2 className="text-sm font-bold text-white">コメント</h2>
            </div>
            <div className="p-5">
              {item.comments.length === 0 ? (
                <p className="text-xs text-slate-600">まだコメントがありません</p>
              ) : (
                <div className="space-y-4">
                  {item.comments.map((comment) => (
                    <div key={comment.id} className="border-b border-white/[0.04] pb-3 last:border-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-slate-300">
                          {comment.user.displayName || comment.user.name || "匿名"}
                        </span>
                        <span className="text-[0.6rem] text-slate-600">{formatDate(comment.createdAt)}</span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{comment.body}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ===== Sidebar ===== */}
        <div className="space-y-4">
          {/* Image */}
          <div className="card overflow-hidden">
            <div className="aspect-square flex items-center justify-center"
              style={{ background: "var(--bg-elevated)" }}>
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain" />
              ) : (
                <span className="text-6xl opacity-20">&#x1f381;</span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="card p-4 space-y-2.5">
            <button className="btn-primary w-full text-sm py-2.5">
              相場を報告する
            </button>
            <button className="btn-outline w-full text-sm py-2.5">
              コレクションに追加
            </button>
          </div>

          {/* Item Info (Discogs-style structured metadata) */}
          <div className="card p-4">
            <h3 className="text-xs font-bold text-white mb-3">アイテム情報</h3>
            <dl className="space-y-2">
              <InfoRow label="ロット" value={lottery.name} />
              <InfoRow label="賞" value={item.prize.grade} />
              {item.prize.quantity && (
                <InfoRow label="当選本数" value={`${item.prize.quantity}個`} />
              )}
              {item.character && (
                <InfoRow label="キャラクター" value={item.character} />
              )}
              {item.jan && (
                <InfoRow label="JAN" value={item.jan} mono />
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}

function PriceStat({
  label,
  value,
  trend,
  variant,
  source,
}: {
  label: string;
  value: number;
  trend?: "up" | "down" | "neutral";
  variant?: "low" | "high";
  source?: string;
}) {
  const color = variant === "low"
    ? "text-[#22c55e]"
    : variant === "high"
      ? "text-[#ef4444]"
      : trend === "up"
        ? "text-[#22c55e]"
        : trend === "down"
          ? "text-[#ef4444]"
          : "text-white";

  const arrow = trend === "up" ? " ↑" : trend === "down" ? " ↓" : "";

  return (
    <div className="rounded-lg p-3 text-center" style={{ background: "var(--bg-elevated)" }}>
      <div className="text-[0.6rem] text-slate-500 mb-1">{label}</div>
      <div className={`text-lg font-black ${color}`}>
        {formatPrice(value)}{arrow}
      </div>
      {source && (
        <div className="text-[0.55rem] text-slate-600 mt-0.5">{source}</div>
      )}
    </div>
  );
}

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between items-start gap-2">
      <dt className="text-[0.7rem] text-slate-500 shrink-0">{label}</dt>
      <dd className={`text-[0.7rem] text-slate-300 text-right ${mono ? "font-mono" : "font-medium"}`}>
        {value}
      </dd>
    </div>
  );
}
