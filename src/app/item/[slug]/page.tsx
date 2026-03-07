import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatDate, formatPrice } from "@/lib/utils";
import { PriceSource } from "@/generated/prisma";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
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

export default async function ItemDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = await prisma.item.findUnique({
    where: { slug },
    include: {
      prize: {
        include: {
          lottery: true,
        },
      },
      priceReports: {
        orderBy: { reportedAt: "desc" },
        take: 50,
      },
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

  // Calculate price stats
  const prices = item.priceReports.map((r) => r.price);
  const avgPrice = prices.length > 0 ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : null;
  const minPrice = prices.length > 0 ? Math.min(...prices) : null;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/lottery" className="hover:text-blue-700">一番くじ</Link>
        <span className="mx-2">/</span>
        <Link href={`/lottery/${lottery.slug}`} className="hover:text-blue-700">
          {lottery.name}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{item.prize.grade}</span>
      </nav>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Item header */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="text-sm font-medium text-blue-600 mb-1">
              {lottery.name} — {item.prize.grade}
            </div>
            <h1 className="text-2xl font-black mb-2">{item.name}</h1>
            {item.character && (
              <div className="text-sm text-gray-500 mb-4">
                キャラクター: {item.character}
              </div>
            )}

            {/* Price stats */}
            {avgPrice ? (
              <div className="grid grid-cols-3 gap-4 mt-4">
                <PriceStat label="平均相場" value={avgPrice} color="text-blue-800" />
                <PriceStat label="最安値" value={minPrice!} color="text-green-700" />
                <PriceStat label="最高値" value={maxPrice!} color="text-red-600" />
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl p-4 text-center text-sm text-gray-500">
                まだ相場データがありません。最初の報告をお待ちしています。
              </div>
            )}
          </div>

          {/* Price history */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold mb-4">
              相場履歴
              <span className="ml-2 text-sm font-normal text-gray-400">
                ({item._count.priceReports}件)
              </span>
            </h2>
            {item.priceReports.length === 0 ? (
              <p className="text-sm text-gray-400">データなし</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 font-medium text-gray-500">日時</th>
                      <th className="text-right py-2 font-medium text-gray-500">価格</th>
                      <th className="text-left py-2 font-medium text-gray-500">ソース</th>
                      <th className="text-left py-2 font-medium text-gray-500">状態</th>
                    </tr>
                  </thead>
                  <tbody>
                    {item.priceReports.map((report) => (
                      <tr key={report.id} className="border-b border-gray-100">
                        <td className="py-2 text-gray-600">
                          {formatDate(report.reportedAt)}
                        </td>
                        <td className="py-2 text-right font-bold">
                          {formatPrice(report.price)}
                        </td>
                        <td className="py-2">
                          {report.sourceUrl ? (
                            <a
                              href={report.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              {sourceLabel(report.source)}
                            </a>
                          ) : (
                            <span className="text-gray-600">
                              {sourceLabel(report.source)}
                            </span>
                          )}
                        </td>
                        <td className="py-2 text-gray-500">
                          {report.condition || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Comments */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold mb-4">コメント</h2>
            {item.comments.length === 0 ? (
              <p className="text-sm text-gray-400">
                まだコメントがありません
              </p>
            ) : (
              <div className="space-y-4">
                {item.comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="border-b border-gray-100 pb-4 last:border-0"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">
                        {comment.user.displayName || comment.user.name || "匿名"}
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {comment.body}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Image */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="aspect-square bg-gray-100 flex items-center justify-center">
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <span className="text-6xl">🎁</span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-3">
            <button className="w-full bg-blue-700 text-white font-bold py-3 rounded-xl hover:bg-blue-800 transition-colors">
              相場を報告する
            </button>
            <button className="w-full border-2 border-blue-200 text-blue-700 font-bold py-3 rounded-xl hover:bg-blue-50 transition-colors">
              コレクションに追加
            </button>
          </div>

          {/* Info */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4">
            <h3 className="font-bold text-sm mb-3">アイテム情報</h3>
            <dl className="text-sm space-y-2">
              <div className="flex justify-between">
                <dt className="text-gray-500">ロット</dt>
                <dd className="font-medium">{lottery.name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">賞</dt>
                <dd className="font-medium">{item.prize.grade}</dd>
              </div>
              {item.prize.quantity && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">当選本数</dt>
                  <dd className="font-medium">{item.prize.quantity}個</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-gray-500">コレクター数</dt>
                <dd className="font-medium">{item._count.collections}人</dd>
              </div>
              {item.jan && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">JAN</dt>
                  <dd className="font-mono text-xs">{item.jan}</dd>
                </div>
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
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="bg-gray-50 rounded-xl p-3 text-center">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className={`text-xl font-black ${color}`}>
        {formatPrice(value)}
      </div>
    </div>
  );
}

function sourceLabel(source: PriceSource): string {
  const labels: Record<PriceSource, string> = {
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
  return labels[source] || source;
}
