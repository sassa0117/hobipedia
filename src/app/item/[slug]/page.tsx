import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatDate, formatPrice } from "@/lib/utils";
import { PriceReportForm } from "@/components/item/price-report-form";
import { CollectionButton } from "@/components/item/collection-button";
import { CommentForm } from "@/components/item/comment-form";
import { ImageUploader } from "@/components/item/image-uploader";
import { PriceChart } from "@/components/item/price-chart";
import { LikeButton } from "@/components/social/like-button";
import { getSessionUser } from "@/lib/services/auth-helpers";

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
  SOLD: { label: "実売", color: "#22c55e" },
  LISTING: { label: "出品中", color: "#38bdf8" },
  STORE_FIND: { label: "店舗", color: "#f59e0b" },
  WANT_TO_BUY: { label: "買希望", color: "#f472b6" },
  WANT_TO_SELL: { label: "売希望", color: "#a78bfa" },
};

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
      _count: { select: { collections: true, priceReports: true, revisions: true, likes: true } },
    },
  });

  if (!item) notFound();

  const me = await getSessionUser();
  const userLiked = me
    ? !!(await prisma.like.findUnique({
        where: { userId_itemId: { userId: me.id, itemId: item.id } },
      }))
    : false;

  const lottery = item.prize?.lottery;

  // Price stats (SOLD only)
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
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="text-[0.7rem] mb-4 flex items-center gap-1.5 flex-wrap" style={{ color: "var(--text-dim)" }}>
        <Link href="/" className="text-link">ホーム</Link>
        <span>/</span>
        {lottery && (
          <>
            <Link href={`/lottery/${lottery.slug}`} className="text-link">{lottery.name}</Link>
            <span>/</span>
          </>
        )}
        {item.prize && (
          <>
            <span style={{ color: "var(--text-muted)" }}>{item.prize.grade}</span>
            <span>/</span>
          </>
        )}
        <span style={{ color: "var(--text-secondary)" }}>{item.name}</span>
      </nav>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* ===== サイドバー（左: 画像 + アクション） ===== */}
        <div className="space-y-3 order-1 lg:order-none">
          {/* 画像 */}
          <div className="card overflow-hidden">
            <div className="aspect-square flex items-center justify-center" style={{ background: "var(--bg-elevated)" }}>
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain" />
              ) : (
                <svg className="w-16 h-16" style={{ color: "var(--text-dim)", opacity: 0.2 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              )}
            </div>
            <ImageUploader itemId={item.id} currentImageUrl={item.imageUrl} />
          </div>

          {/* アクションボタン */}
          <div className="card p-3 space-y-2">
            <PriceReportForm itemId={item.id} />
            <CollectionButton itemId={item.id} />
          </div>

          {/* アイテム情報テーブル */}
          <div className="card p-3">
            <h3 className="text-xs font-bold mb-2.5" style={{ color: "var(--text-primary)" }}>アイテム情報</h3>
            <dl className="space-y-1.5">
              {lottery && <InfoRow label="ロット" value={lottery.name} />}
              {item.prize && <InfoRow label="賞" value={item.prize.grade} />}
              {item.prize?.quantity && <InfoRow label="当選本数" value={`${item.prize.quantity}個`} />}
              {item.character && <InfoRow label="キャラクター" value={item.character} />}
              {item.maker && <InfoRow label="メーカー" value={item.maker} />}
              {item.releaseDate && <InfoRow label="発売日" value={formatDate(item.releaseDate)} />}
              {item.jan && <InfoRow label="JAN" value={item.jan} mono />}
              <InfoRow label="カテゴリ" value={CATEGORY_LABELS[item.category] || item.category} />
            </dl>
          </div>
        </div>

        {/* ===== メインカラム ===== */}
        <div className="lg:col-span-2 space-y-4 order-2">
          {/* ヘッダー */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              {item.series && <span className="series-tag">{item.series.name}</span>}
              {item.prize && <span className="tag">{item.prize.grade}</span>}
            </div>
            <div className="flex items-start justify-between gap-3">
              <h1 className="text-xl md:text-2xl font-black leading-tight" style={{ color: "var(--text-primary)" }}>
                {item.name}
              </h1>
              <div className="flex items-center gap-2 shrink-0 mt-1">
                <Link href={`/item/${item.slug}/edit`} className="btn-ghost text-[0.7rem]">
                  編集
                </Link>
                <Link href={`/item/${item.slug}/history`} className="btn-ghost text-[0.7rem]" style={{ color: "var(--text-dim)" }}>
                  履歴 ({item._count.revisions})
                </Link>
              </div>
            </div>
            {item.character && (
              <div className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>{item.character}</div>
            )}
            {item.description && (
              <p className="text-xs leading-relaxed mt-2" style={{ color: "var(--text-secondary)" }}>{item.description}</p>
            )}

            {/* Stats bar */}
            <div className="flex items-center gap-3 mt-3 pt-3 border-t" style={{ borderColor: "var(--border)" }}>
              <LikeButton itemId={item.id} initialLiked={userLiked} initialCount={item._count.likes} />
              <StatBadge icon="●" color="#22c55e" count={item._count.collections} label="コレクション" />
              <StatBadge icon="●" color="var(--accent)" count={item._count.priceReports} label="相場" />
              {item.createdBy && (
                <span className="text-[0.6rem] ml-auto" style={{ color: "var(--text-dim)" }}>
                  登録: {item.createdBy.username ? (
                    <Link href={`/user/${item.createdBy.username}`} className="text-link">{item.createdBy.name}</Link>
                  ) : item.createdBy.name}
                </span>
              )}
            </div>
          </div>

          {/* 相場サマリー */}
          {avgPrice ? (
            <div className="grid grid-cols-3 gap-2">
              <PriceStatCard label="最新相場" value={latestSold?.price ?? avgPrice} trend={priceTrend}
                sub={latestSold ? SOURCE_LABELS[latestSold.source] || latestSold.source : undefined} />
              <PriceStatCard label="最安値" value={minPrice!} variant="low" />
              <PriceStatCard label="最高値" value={maxPrice!} variant="high" />
            </div>
          ) : (
            <div className="card p-5 text-center text-xs" style={{ color: "var(--text-dim)" }}>
              まだ相場データがありません。最初の報告をお待ちしています。
            </div>
          )}

          {/* Price Chart */}
          {item.priceReports.length >= 2 && (
            <div className="card overflow-hidden">
              <div className="px-4 py-2.5 border-b" style={{ borderColor: "var(--border)", background: "var(--bg-secondary)" }}>
                <h2 className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>価格推移</h2>
              </div>
              <div className="p-3">
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

          {/* 相場履歴テーブル */}
          <div className="card overflow-hidden">
            <div className="px-4 py-2.5 border-b flex items-center justify-between"
              style={{ borderColor: "var(--border)", background: "var(--bg-secondary)" }}>
              <h2 className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>相場履歴</h2>
              <span className="text-[0.65rem]" style={{ color: "var(--text-dim)" }}>{item._count.priceReports}件</span>
            </div>
            {item.priceReports.length === 0 ? (
              <div className="p-5 text-center text-xs" style={{ color: "var(--text-dim)" }}>データなし</div>
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
                      const pt = PRICE_TYPE_LABELS[report.priceType] || { label: report.priceType, color: "var(--text-muted)" };
                      return (
                        <tr key={report.id}>
                          <td className="text-xs whitespace-nowrap" style={{ color: "var(--text-dim)" }}>
                            {formatDate(report.reportedAt)}
                          </td>
                          <td>
                            <span className="text-[0.65rem] font-bold" style={{ color: pt.color }}>{pt.label}</span>
                          </td>
                          <td className="text-right font-bold" style={{ color: "var(--text-primary)" }}>
                            {formatPrice(report.price)}
                          </td>
                          <td>
                            {report.sourceUrl ? (
                              <a href={report.sourceUrl} target="_blank" rel="noopener noreferrer"
                                className="text-link text-xs">
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

          {/* コメント */}
          <div className="card overflow-hidden">
            <div className="px-4 py-2.5 border-b" style={{ borderColor: "var(--border)", background: "var(--bg-secondary)" }}>
              <h2 className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>コメント</h2>
            </div>
            <div className="p-4 space-y-3">
              <CommentForm itemId={item.id} />
              {item.comments.length === 0 ? (
                <p className="text-xs text-center pt-2" style={{ color: "var(--text-dim)" }}>まだコメントがありません</p>
              ) : (
                <div className="space-y-3 pt-2 border-t" style={{ borderColor: "var(--border)" }}>
                  {item.comments.map((comment) => (
                    <div key={comment.id}>
                      <div className="flex items-start gap-2">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-[0.55rem] font-bold shrink-0"
                          style={{ background: "var(--accent-muted)", color: "var(--accent)" }}>
                          {(comment.user.name || "?")[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
                              {comment.user.displayName || comment.user.name || "匿名"}
                            </span>
                            <span className="text-[0.6rem]" style={{ color: "var(--text-dim)" }}>
                              {formatDate(comment.createdAt)}
                            </span>
                          </div>
                          <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                            {comment.body}
                          </p>
                        </div>
                      </div>
                      {comment.replies.length > 0 && (
                        <div className="ml-8 mt-2 space-y-2 border-l-2 pl-3" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                          {comment.replies.map((reply) => (
                            <div key={reply.id} className="flex items-start gap-2">
                              <div className="w-5 h-5 rounded-full flex items-center justify-center text-[0.5rem] font-bold shrink-0"
                                style={{ background: "var(--bg-elevated)", color: "var(--text-muted)" }}>
                                {(reply.user.name || "?")[0].toUpperCase()}
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5 mb-0.5">
                                  <span className="text-[0.65rem] font-medium" style={{ color: "var(--text-muted)" }}>
                                    {reply.user.displayName || reply.user.name || "匿名"}
                                  </span>
                                  <span className="text-[0.55rem]" style={{ color: "var(--text-dim)" }}>
                                    {formatDate(reply.createdAt)}
                                  </span>
                                </div>
                                <p className="text-[0.7rem] leading-relaxed" style={{ color: "var(--text-muted)" }}>
                                  {reply.body}
                                </p>
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
      </div>
    </div>
  );
}

function PriceStatCard({
  label, value, trend, variant, sub,
}: {
  label: string; value: number; trend?: "up" | "down" | "neutral"; variant?: "low" | "high"; sub?: string;
}) {
  const color = variant === "low" ? "#22c55e"
    : variant === "high" ? "#ef4444"
    : trend === "up" ? "#22c55e"
    : trend === "down" ? "#ef4444"
    : "var(--text-primary)";
  const arrow = trend === "up" ? " ↑" : trend === "down" ? " ↓" : "";

  return (
    <div className="card p-3 text-center" style={{ background: "var(--bg-secondary)" }}>
      <div className="text-[0.6rem] mb-1" style={{ color: "var(--text-dim)" }}>{label}</div>
      <div className="text-lg font-black" style={{ color }}>{formatPrice(value)}{arrow}</div>
      {sub && <div className="text-[0.55rem] mt-0.5" style={{ color: "var(--text-dim)" }}>{sub}</div>}
    </div>
  );
}

function StatBadge({ icon, color, count, label }: { icon: string; color: string; count: number; label: string }) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-[0.4rem]" style={{ color }}>{icon}</span>
      <span className="text-[0.65rem]" style={{ color: "var(--text-muted)" }}>
        <span className="font-bold" style={{ color: "var(--text-secondary)" }}>{count}</span> {label}
      </span>
    </div>
  );
}

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between items-start gap-2">
      <dt className="text-[0.7rem] shrink-0" style={{ color: "var(--text-dim)" }}>{label}</dt>
      <dd className={`text-[0.7rem] text-right ${mono ? "font-mono" : "font-medium"}`} style={{ color: "var(--text-secondary)" }}>
        {value}
      </dd>
    </div>
  );
}
