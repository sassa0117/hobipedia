import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatDate, formatPrice } from "@/lib/utils";
import { FigurePlaceholder } from "@/components/ui/placeholders";
import { PriceReportForm } from "@/components/item/price-report-form";
import { CollectionButton } from "@/components/item/collection-button";
import { CommentForm } from "@/components/item/comment-form";
import { ImageUploader } from "@/components/item/image-uploader";
import { PriceChart } from "@/components/item/price-chart";

const SOURCE_LABELS: Record<string, string> = {
  MERCARI: "メルカリ",
  YAHOO_AUCTION: "ヤフオク",
  YAHOO_FREEMARKET: "Yahoo!フリマ",
  SURUGAYA: "駿河屋",
  MANDARAKE: "まんだらけ",
  LASHINBAN: "らしんばん",
  AMAZON: "Amazon",
  RAKUTEN: "楽天",
  STORE: "実店舗",
  USER_REPORT: "ユーザー報告",
  OTHER: "その他",
};

const PRICE_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  SOLD: { label: "実売", color: "text-[#22c55e]" },
  LISTING: { label: "出品中", color: "text-[#38bdf8]" },
  STORE_FIND: { label: "店舗", color: "text-[#f59e0b]" },
  WANT_TO_BUY: { label: "買希望", color: "text-[#f472b6]" },
  WANT_TO_SELL: { label: "売希望", color: "text-[#a78bfa]" },
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = await prisma.item.findUnique({
    where: { slug },
    include: { prize: { include: { lottery: true } }, series: true },
  });
  if (!item) return { title: "Not Found" };
  const context = item.prize ? `${item.prize.lottery.name} ${item.prize.grade} ` : "";
  return {
    title: `${item.name} 相場・価格推移 - Hobipedia`,
    description: `${context}${item.name}の相場データ。`,
  };
}

export default async function ItemDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = await prisma.item.findUnique({
    where: { slug },
    include: {
      series: true,
      prize: { include: { lottery: true } },
      createdBy: { select: { name: true, username: true } },
      priceReports: { orderBy: { reportedAt: "desc" }, take: 50 },
      comments: {
        where: { parentId: null },
        orderBy: { createdAt: "desc" },
        take: 20,
        include: {
          user: { select: { displayName: true, name: true, image: true } },
          replies: {
            orderBy: { createdAt: "asc" },
            include: { user: { select: { displayName: true, name: true, image: true } } },
          },
        },
      },
      _count: { select: { collections: true, priceReports: true, revisions: true } },
    },
  });

  if (!item) notFound();

  const lottery = item.prize?.lottery;

  // Price stats (SOLD type only for market price)
  const soldReports = item.priceReports.filter((r) => r.priceType === "SOLD");
  const soldPrices = soldReports.map((r) => r.price);
  const avgPrice = soldPrices.length > 0 ? Math.round(soldPrices.reduce((a, b) => a + b, 0) / soldPrices.length) : null;
  const minPrice = soldPrices.length > 0 ? Math.min(...soldPrices) : null;
  const maxPrice = soldPrices.length > 0 ? Math.max(...soldPrices) : null;
  const latestSold = soldReports[0];

  const priceTrend = latestSold && avgPrice
    ? latestSold.price > avgPrice ? "up" : latestSold.price < avgPrice ? "down" : "neutral"
    : "neutral";

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-xs text-slate-500 mb-6 flex items-center gap-1.5 flex-wrap">
        <Link href="/lottery" className="hover:text-[#a78bfa] transition-colors">データベース</Link>
        {lottery && (
          <>
            <span className="text-slate-700">/</span>
            <Link href={`/lottery/${lottery.slug}`} className="hover:text-[#a78bfa] transition-colors">
              {lottery.name}
            </Link>
          </>
        )}
        {item.prize && (
          <>
            <span className="text-slate-700">/</span>
            <span className="text-slate-300">{item.prize.grade}</span>
          </>
        )}
      </nav>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* ===== Main Column ===== */}
        <div className="lg:col-span-2 space-y-6">

          {/* Item Header Card */}
          <div className="card p-6">
            <div className="flex items-start justify-between mb-1">
              <div className="flex items-start gap-2">
                {item.series && <div className="series-tag text-[0.6rem]">{item.series.name}</div>}
                {item.prize && <span className="text-[0.6rem] text-slate-600">{item.prize.grade}</span>}
              </div>
              {/* Edit / History links */}
              <div className="flex items-center gap-2">
                <Link href={`/item/${item.slug}/edit`} className="text-[0.65rem] text-[#a78bfa] hover:text-[#c4b5fd] transition-colors">
                  編集
                </Link>
                <Link href={`/item/${item.slug}/history`} className="text-[0.65rem] text-slate-500 hover:text-slate-300 transition-colors">
                  履歴 ({item._count.revisions})
                </Link>
              </div>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-white mb-1">{item.name}</h1>
            {item.character && (
              <div className="text-sm text-slate-500 mb-2">{item.character}</div>
            )}
            {item.description && (
              <p className="text-xs text-slate-400 leading-relaxed mb-4">{item.description}</p>
            )}

            {/* Price stats (SOLD only) */}
            {avgPrice ? (
              <div className="grid grid-cols-3 gap-3 mt-4">
                <PriceStat
                  label="最新相場"
                  value={latestSold?.price ?? avgPrice}
                  trend={priceTrend}
                  source={latestSold ? SOURCE_LABELS[latestSold.source] || latestSold.source : undefined}
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

            {/* Collection stats + creator */}
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
              {item.createdBy && (
                <span className="text-[0.6rem] text-slate-600 ml-auto">
                  登録: {item.createdBy.name}
                </span>
              )}
            </div>
          </div>

          {/* Price Chart */}
          {item.priceReports.length >= 2 && (
            <div className="card overflow-hidden">
              <div className="px-5 py-3 border-b border-white/[0.06]" style={{ background: "var(--bg-elevated)" }}>
                <h2 className="text-sm font-bold text-white">価格推移</h2>
              </div>
              <div className="p-4">
                <PriceChart
                  reports={item.priceReports.map((r) => ({
                    date: r.reportedAt.toISOString().split("T")[0],
                    price: r.price,
                    priceType: r.priceType,
                    source: SOURCE_LABELS[r.source] || r.source,
                  }))}
                />
              </div>
            </div>
          )}

          {/* Price History Table */}
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
                      <th>タイプ</th>
                      <th className="text-right">価格</th>
                      <th>ソース</th>
                      <th>状態</th>
                    </tr>
                  </thead>
                  <tbody>
                    {item.priceReports.map((report) => {
                      const pt = PRICE_TYPE_LABELS[report.priceType] || { label: report.priceType, color: "text-slate-400" };
                      return (
                        <tr key={report.id}>
                          <td className="text-slate-400 text-xs">{formatDate(report.reportedAt)}</td>
                          <td>
                            <span className={`text-[0.65rem] font-bold ${pt.color}`}>{pt.label}</span>
                          </td>
                          <td className="text-right font-bold text-white">{formatPrice(report.price)}</td>
                          <td>
                            {report.sourceUrl ? (
                              <a href={report.sourceUrl} target="_blank" rel="noopener noreferrer"
                                className="text-[#a78bfa] hover:text-[#c4b5fd] text-xs">
                                {SOURCE_LABELS[report.source] || report.source}
                              </a>
                            ) : (
                              <span className="text-xs">
                                {SOURCE_LABELS[report.source] || report.source}
                                {report.storeName && ` (${report.storeName})`}
                              </span>
                            )}
                          </td>
                          <td className="text-xs">{report.condition || "—"}</td>
                        </tr>
                      );
                    })}
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
            <div className="p-5 space-y-4">
              <CommentForm itemId={item.id} />

              {item.comments.length === 0 ? (
                <p className="text-xs text-slate-600 text-center pt-2">まだコメントがありません</p>
              ) : (
                <div className="space-y-4 pt-2 border-t border-white/[0.06]">
                  {item.comments.map((comment) => (
                    <div key={comment.id}>
                      <div className="flex items-start gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#7c5cfc]/50 to-[#a78bfa]/50 flex items-center justify-center text-[0.6rem] font-bold text-white shrink-0">
                          {(comment.user.name || "?")[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-xs font-medium text-slate-300">
                              {comment.user.displayName || comment.user.name || "匿名"}
                            </span>
                            <span className="text-[0.6rem] text-slate-600">{formatDate(comment.createdAt)}</span>
                          </div>
                          <p className="text-xs text-slate-400 leading-relaxed">{comment.body}</p>
                        </div>
                      </div>
                      {/* Replies */}
                      {comment.replies.length > 0 && (
                        <div className="ml-9 mt-2 space-y-2 border-l-2 border-white/[0.04] pl-3">
                          {comment.replies.map((reply) => (
                            <div key={reply.id} className="flex items-start gap-2">
                              <div className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-[0.5rem] font-bold text-slate-300 shrink-0">
                                {(reply.user.name || "?")[0].toUpperCase()}
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5 mb-0.5">
                                  <span className="text-[0.65rem] font-medium text-slate-400">
                                    {reply.user.displayName || reply.user.name || "匿名"}
                                  </span>
                                  <span className="text-[0.55rem] text-slate-600">{formatDate(reply.createdAt)}</span>
                                </div>
                                <p className="text-[0.7rem] text-slate-500 leading-relaxed">{reply.body}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
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
                <FigurePlaceholder />
              )}
            </div>
            <ImageUploader itemId={item.id} currentImageUrl={item.imageUrl} />
          </div>

          {/* Action Buttons */}
          <div className="card p-4 space-y-2.5">
            <PriceReportForm itemId={item.id} />
            <CollectionButton itemId={item.id} />
          </div>

          {/* Item Info */}
          <div className="card p-4">
            <h3 className="text-xs font-bold text-white mb-3">アイテム情報</h3>
            <dl className="space-y-2">
              {lottery && <InfoRow label="ロット" value={lottery.name} />}
              {item.prize && <InfoRow label="賞" value={item.prize.grade} />}
              {item.prize?.quantity && (
                <InfoRow label="当選本数" value={`${item.prize.quantity}個`} />
              )}
              {item.character && <InfoRow label="キャラクター" value={item.character} />}
              {item.maker && <InfoRow label="メーカー" value={item.maker} />}
              {item.releaseDate && <InfoRow label="発売日" value={formatDate(item.releaseDate)} />}
              {item.jan && <InfoRow label="JAN" value={item.jan} mono />}
              <InfoRow label="カテゴリ" value={CATEGORY_LABELS[item.category] || item.category} />
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}

const CATEGORY_LABELS: Record<string, string> = {
  ICHIBAN_KUJI: "一番くじ",
  FIGURE: "フィギュア",
  SCALE_FIGURE: "スケールフィギュア",
  PRIZE_FIGURE: "プライズフィギュア",
  NENDOROID: "ねんどろいど",
  ACSTA: "アクリルスタンド",
  CAN_BADGE: "缶バッジ",
  PLUSH: "ぬいぐるみ",
  TRADING_CARD: "トレカ",
  RUBBER_STRAP: "ラバーストラップ",
  TAPESTRY: "タペストリー",
  CLEAR_FILE: "クリアファイル",
  TOWEL: "タオル",
  OTHER: "その他",
};

function PriceStat({
  label, value, trend, variant, source,
}: {
  label: string; value: number; trend?: "up" | "down" | "neutral"; variant?: "low" | "high"; source?: string;
}) {
  const color = variant === "low" ? "text-[#22c55e]"
    : variant === "high" ? "text-[#ef4444]"
    : trend === "up" ? "text-[#22c55e]"
    : trend === "down" ? "text-[#ef4444]"
    : "text-white";
  const arrow = trend === "up" ? " ↑" : trend === "down" ? " ↓" : "";

  return (
    <div className="rounded-lg p-3 text-center" style={{ background: "var(--bg-elevated)" }}>
      <div className="text-[0.6rem] text-slate-500 mb-1">{label}</div>
      <div className={`text-lg font-black ${color}`}>{formatPrice(value)}{arrow}</div>
      {source && <div className="text-[0.55rem] text-slate-600 mt-0.5">{source}</div>}
    </div>
  );
}

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between items-start gap-2">
      <dt className="text-[0.7rem] text-slate-500 shrink-0">{label}</dt>
      <dd className={`text-[0.7rem] text-slate-300 text-right ${mono ? "font-mono" : "font-medium"}`}>{value}</dd>
    </div>
  );
}
