import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

const CATEGORY_LABELS: Record<string, string> = {
  ICHIBAN_KUJI: "一番くじ",
  FIGURE: "フィギュア",
  SCALE_FIGURE: "スケールフィギュア",
  PRIZE_FIGURE: "プライズフィギュア",
  NENDOROID: "ねんどろいど",
  ACSTA: "アクスタ",
  PLUSH: "ぬいぐるみ",
  TRADING_CARD: "トレカ",
  OTHER: "その他",
};

export default async function Home() {
  const [itemCount, priceCount, seriesCount, lotteryCount] = await Promise.all([
    prisma.item.count(),
    prisma.priceReport.count(),
    prisma.series.count(),
    prisma.lottery.count(),
  ]);

  const recentItems = await prisma.item.findMany({
    take: 12,
    orderBy: { createdAt: "desc" },
    include: {
      series: true,
      prize: { include: { lottery: true } },
      priceReports: { orderBy: { reportedAt: "desc" }, take: 1 },
      _count: { select: { collections: true, likes: true } },
    },
  });

  // 最近の相場報告（アクティビティ的に表示）
  const recentPrices = await prisma.priceReport.findMany({
    take: 8,
    orderBy: { reportedAt: "desc" },
    include: {
      item: { select: { name: true, slug: true, category: true } },
      user: { select: { name: true } },
    },
  });

  // カテゴリ別件数
  const categoryCounts = await prisma.item.groupBy({
    by: ["category"],
    _count: true,
    orderBy: { _count: { category: "desc" } },
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* ===== Hero - シンプルに1行 + 検索 ===== */}
      <section className="mb-8">
        <h1 className="text-2xl md:text-3xl font-black mb-2" style={{ color: "var(--text-primary)" }}>
          ホビーグッズの<span style={{ color: "var(--accent)" }}>相場Wiki</span>
        </h1>
        <p className="text-sm mb-5" style={{ color: "var(--text-muted)" }}>
          フィギュア・一番くじ・トレカの情報と相場をみんなで共有するデータベース
        </p>

        {/* Stats - 横並び、コンパクト */}
        <div className="flex items-center gap-6 mb-5">
          <Stat value={itemCount} label="アイテム" />
          <Stat value={priceCount} label="相場データ" />
          <Stat value={seriesCount} label="シリーズ" />
          <Stat value={lotteryCount} label="一番くじ" />
        </div>

        {/* カテゴリチップ */}
        <div className="flex flex-wrap gap-1.5">
          {categoryCounts.map((c) => (
            <Link
              key={c.category}
              href={`/search?category=${c.category}`}
              className="chip"
            >
              {CATEGORY_LABELS[c.category] || c.category}
              <span style={{ color: "var(--text-dim)" }}>{c._count}</span>
            </Link>
          ))}
        </div>
      </section>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* ===== メインカラム: アイテムグリッド ===== */}
        <div className="lg:col-span-2">
          <div className="section-header">
            <h2>最近のアイテム</h2>
            <Link href="/search">すべて見る →</Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            {recentItems.map((item) => {
              const latestPrice = item.priceReports[0];
              return (
                <Link key={item.id} href={`/item/${item.slug}`} className="card p-0 overflow-hidden group">
                  {/* 画像 */}
                  <div className="aspect-square relative overflow-hidden" style={{ background: "var(--bg-elevated)" }}>
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-10 h-10" style={{ color: "var(--text-dim)", opacity: 0.3 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                    )}
                    {/* カテゴリバッジ */}
                    {item.prize && (
                      <span className="absolute top-1.5 left-1.5 text-[0.55rem] font-bold px-1.5 py-0.5 rounded"
                        style={{ background: "rgba(0,0,0,0.7)", color: "var(--accent)" }}>
                        {item.prize.grade}
                      </span>
                    )}
                  </div>

                  {/* 情報 */}
                  <div className="p-2.5">
                    {item.series && (
                      <div className="text-[0.6rem] font-semibold mb-0.5 truncate" style={{ color: "var(--text-dim)" }}>
                        {item.series.name}
                      </div>
                    )}
                    <div className="text-xs font-bold leading-snug mb-1.5 line-clamp-2 transition-colors"
                      style={{ color: "var(--text-primary)" }}>
                      {item.name}
                    </div>

                    <div className="flex items-center justify-between">
                      {latestPrice ? (
                        <span className="text-sm font-black" style={{ color: "var(--price-up)" }}>
                          {formatPrice(latestPrice.price)}
                        </span>
                      ) : (
                        <span className="text-[0.6rem]" style={{ color: "var(--text-dim)" }}>相場なし</span>
                      )}
                      <div className="flex items-center gap-1.5">
                        {item._count.likes > 0 && (
                          <span className="text-[0.6rem] flex items-center gap-0.5" style={{ color: "var(--text-dim)" }}>
                            ♥ {item._count.likes}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {recentItems.length === 0 && (
            <div className="card p-8 text-center">
              <p className="text-sm mb-3" style={{ color: "var(--text-muted)" }}>まだアイテムがありません</p>
              <Link href="/item/new" className="btn-primary text-sm">
                最初のアイテムを登録する
              </Link>
            </div>
          )}
        </div>

        {/* ===== サイドバー ===== */}
        <div className="space-y-4">
          {/* CTAカード */}
          <div className="card p-4" style={{ borderColor: "var(--accent-border)" }}>
            <h3 className="text-sm font-bold mb-1.5" style={{ color: "var(--text-primary)" }}>
              Hobipediaに参加しよう
            </h3>
            <p className="text-xs leading-relaxed mb-3" style={{ color: "var(--text-muted)" }}>
              アイテムの登録・相場報告・コレクション管理。誰でも編集できるホビーのWikipedia。
            </p>
            <div className="flex gap-2">
              <Link href="/item/new" className="btn-primary text-xs flex-1 text-center">
                登録する
              </Link>
              <Link href="/signin" className="btn-outline text-xs flex-1 text-center">
                ログイン
              </Link>
            </div>
          </div>

          {/* 最近の相場報告 */}
          <div className="card overflow-hidden">
            <div className="px-4 py-2.5 border-b" style={{ borderColor: "var(--border)", background: "var(--bg-secondary)" }}>
              <h3 className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>最近の相場報告</h3>
            </div>
            <div className="divide-y" style={{ borderColor: "var(--border)" }}>
              {recentPrices.map((report) => (
                <Link
                  key={report.id}
                  href={`/item/${report.item.slug}`}
                  className="block px-4 py-2.5 transition-colors hover:bg-white/[0.02]"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-medium truncate" style={{ color: "var(--text-primary)" }}>
                        {report.item.name}
                      </div>
                      <div className="text-[0.6rem]" style={{ color: "var(--text-dim)" }}>
                        {PRICE_TYPE_SHORT[report.priceType] || report.priceType}
                        {report.user && ` · ${report.user.name}`}
                      </div>
                    </div>
                    <span className="text-sm font-bold shrink-0" style={{ color: "var(--price-up)" }}>
                      {formatPrice(report.price)}
                    </span>
                  </div>
                </Link>
              ))}
              {recentPrices.length === 0 && (
                <div className="px-4 py-6 text-center text-xs" style={{ color: "var(--text-dim)" }}>
                  まだ相場報告がありません
                </div>
              )}
            </div>
          </div>

          {/* 使い方ガイド */}
          <div className="card p-4 space-y-3">
            <h3 className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>Hobipediaの使い方</h3>
            <GuideStep num={1} text="アイテムを検索 or 新規登録" />
            <GuideStep num={2} text="相場データを報告・共有" />
            <GuideStep num={3} text="コレクションで管理" />
          </div>
        </div>
      </div>
    </div>
  );
}

const PRICE_TYPE_SHORT: Record<string, string> = {
  SOLD: "実売",
  LISTING: "出品中",
  STORE_FIND: "店舗発見",
  WANT_TO_BUY: "買希望",
  WANT_TO_SELL: "売希望",
};

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <span className="text-lg font-black" style={{ color: "var(--text-primary)" }}>
        {value.toLocaleString()}
      </span>
      <span className="text-[0.65rem] ml-1" style={{ color: "var(--text-dim)" }}>{label}</span>
    </div>
  );
}

function GuideStep({ num, text }: { num: number; text: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="w-5 h-5 rounded-full flex items-center justify-center text-[0.6rem] font-bold shrink-0"
        style={{ background: "var(--accent-muted)", color: "var(--accent)" }}>
        {num}
      </div>
      <span className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>{text}</span>
    </div>
  );
}
