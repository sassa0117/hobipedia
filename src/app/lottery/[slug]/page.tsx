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
  const lottery = await prisma.lottery.findUnique({ where: { slug } });
  if (!lottery) return { title: "Not Found" };
  return {
    title: `${lottery.name} - Hobipedia`,
    description: `${lottery.name}の各賞品の相場データ。`,
  };
}

export default async function LotteryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const lottery = await prisma.lottery.findUnique({
    where: { slug },
    include: {
      prizes: {
        orderBy: { grade: "asc" },
        include: {
          items: {
            include: {
              priceReports: {
                orderBy: { reportedAt: "desc" },
                take: 5,
              },
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
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/lottery" className="hover:text-blue-700">
          一番くじ
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{lottery.name}</span>
      </nav>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
        <div className="text-sm font-medium text-blue-600 mb-1">
          {lottery.series}
        </div>
        <h1 className="text-2xl md:text-3xl font-black mb-3">{lottery.name}</h1>
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          {lottery.releaseDate && (
            <div>
              <span className="font-medium text-gray-900">発売日: </span>
              {formatDate(lottery.releaseDate)}
            </div>
          )}
          {lottery.price && (
            <div>
              <span className="font-medium text-gray-900">価格: </span>
              {formatPrice(lottery.price)}/回
            </div>
          )}
          <div>
            <span className="font-medium text-gray-900">メーカー: </span>
            {lottery.maker}
          </div>
        </div>
        {lottery.description && (
          <p className="mt-4 text-sm text-gray-600 leading-relaxed">
            {lottery.description}
          </p>
        )}
      </div>

      {/* Prizes */}
      <h2 className="text-xl font-black mb-4">賞品一覧</h2>
      <div className="space-y-6">
        {lottery.prizes.map((prize) => (
          <div
            key={prize.id}
            className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
          >
            <div className="bg-blue-50 px-6 py-3 border-b border-blue-100">
              <h3 className="font-bold text-blue-800">
                {prize.grade} — {prize.name}
                {prize.quantity && (
                  <span className="ml-2 text-sm font-normal text-blue-600">
                    ({prize.quantity}個)
                  </span>
                )}
              </h3>
            </div>
            <div className="p-6">
              {prize.items.length === 0 ? (
                <p className="text-sm text-gray-400">
                  アイテムが未登録です
                </p>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {prize.items.map((item) => {
                    const latestPrice = item.priceReports[0];
                    return (
                      <Link
                        key={item.id}
                        href={`/item/${item.slug}`}
                        className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-sm transition-all"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                            {item.imageUrl ? (
                              <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <span className="text-2xl">🎁</span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-sm leading-snug mb-1">
                              {item.name}
                            </div>
                            {item.character && (
                              <div className="text-xs text-gray-500 mb-1">
                                {item.character}
                              </div>
                            )}
                            {latestPrice ? (
                              <div className="text-lg font-black text-green-700">
                                {formatPrice(latestPrice.price)}
                                <span className="text-xs font-normal text-gray-400 ml-1">
                                  ({sourceLabel(latestPrice.source)})
                                </span>
                              </div>
                            ) : (
                              <div className="text-xs text-gray-400">
                                相場データなし
                              </div>
                            )}
                            <div className="text-xs text-gray-400 mt-1">
                              {item._count.collections}人がコレクション中
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ))}
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
