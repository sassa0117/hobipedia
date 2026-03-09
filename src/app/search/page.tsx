import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { ItemPlaceholder } from "@/components/ui/placeholders";

export const metadata = {
  title: "検索 - Hobipedia",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() || "";

  if (!query) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-black text-white mb-2">検索</h1>
        <p className="text-sm text-slate-500">作品名・アイテム名・キャラクター名で検索できます</p>
        <div className="mt-12 text-center text-slate-600 text-sm">
          検索ワードを入力してください
        </div>
      </div>
    );
  }

  const [items, lotteries] = await Promise.all([
    prisma.item.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { character: { contains: query, mode: "insensitive" } },
          { series: { name: { contains: query, mode: "insensitive" } } },
        ],
      },
      include: {
        series: true,
        prize: { include: { lottery: true } },
        priceReports: { orderBy: { reportedAt: "desc" }, take: 1 },
      },
      take: 20,
    }),
    prisma.lottery.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { series: { name: { contains: query, mode: "insensitive" } } },
        ],
      },
      include: { series: true, _count: { select: { prizes: true } } },
      take: 10,
    }),
  ]);

  const totalResults = items.length + lotteries.length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-black text-white mb-1">検索結果</h1>
      <p className="text-sm text-slate-500 mb-8">
        「{query}」の検索結果: {totalResults}件
      </p>

      {totalResults === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-4 opacity-20">🔍</div>
          <p className="text-slate-400 mb-2">「{query}」に一致する結果がありません</p>
          <p className="text-sm text-slate-600">別のキーワードで検索してみてください</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Lottery results */}
          {lotteries.length > 0 && (
            <section>
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">
                一番くじ ({lotteries.length}件)
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                {lotteries.map((lottery) => (
                  <Link
                    key={lottery.id}
                    href={`/lottery/${lottery.slug}`}
                    className="card p-4 group"
                  >
                    {lottery.series && <div className="series-tag text-[0.6rem] mb-2">{lottery.series.name}</div>}
                    <h3 className="font-bold text-sm text-slate-200 group-hover:text-white transition-colors">
                      {lottery.name}
                    </h3>
                    <span className="text-[0.65rem] text-slate-500 mt-1">
                      {lottery._count.prizes}賞
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Item results */}
          {items.length > 0 && (
            <section>
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">
                アイテム ({items.length}件)
              </h2>
              <div className="space-y-2">
                {items.map((item) => {
                  const latestPrice = item.priceReports[0];
                  return (
                    <Link
                      key={item.id}
                      href={`/item/${item.slug}`}
                      className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/[0.03] transition-colors group"
                    >
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0 overflow-hidden"
                        style={{ background: "var(--bg-elevated)" }}>
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <ItemPlaceholder size="sm" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors truncate">
                          {item.name}
                        </div>
                        <div className="text-[0.65rem] text-slate-500">
                          {item.series?.name || item.prize?.lottery?.name || ""}{item.prize ? ` / ${item.prize.grade}` : ""}
                          {item.character && ` / ${item.character}`}
                        </div>
                      </div>
                      <div className="shrink-0">
                        {latestPrice ? (
                          <span className="text-sm font-black text-[#22c55e]">
                            {formatPrice(latestPrice.price)}
                          </span>
                        ) : (
                          <span className="text-[0.65rem] text-slate-600">—</span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
