import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { ItemPlaceholder } from "@/components/ui/placeholders";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "ランキング - Hobipedia",
  description: "一番くじアイテムの相場ランキング。高額・人気・注目アイテムをチェック。",
};

export default async function RankingPage() {
  // Most expensive items (by latest price)
  const expensiveItems = await prisma.item.findMany({
    where: { priceReports: { some: {} } },
    include: {
      prize: { include: { lottery: true } },
      priceReports: { orderBy: { reportedAt: "desc" }, take: 1 },
      _count: { select: { collections: true, priceReports: true } },
    },
    take: 20,
  });

  // Sort by latest price descending
  const byPrice = expensiveItems
    .filter((item) => item.priceReports.length > 0)
    .sort((a, b) => b.priceReports[0].price - a.priceReports[0].price);

  // Most collected items
  const popularItems = await prisma.item.findMany({
    orderBy: { collections: { _count: "desc" } },
    where: { collections: { some: {} } },
    include: {
      prize: { include: { lottery: true } },
      priceReports: { orderBy: { reportedAt: "desc" }, take: 1 },
      _count: { select: { collections: true, priceReports: true } },
    },
    take: 10,
  });

  // Most price reports (= most actively traded)
  const activeItems = await prisma.item.findMany({
    orderBy: { priceReports: { _count: "desc" } },
    where: { priceReports: { some: {} } },
    include: {
      prize: { include: { lottery: true } },
      priceReports: { orderBy: { reportedAt: "desc" }, take: 1 },
      _count: { select: { collections: true, priceReports: true } },
    },
    take: 10,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-white mb-1">ランキング</h1>
        <p className="text-sm text-slate-500">相場・人気・取引量のランキング</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Price ranking */}
        <RankingSection
          title="相場ランキング"
          subtitle="最新相場が高いアイテム"
          icon="💰"
          items={byPrice}
          valueLabel="相場"
          getValue={(item) => item.priceReports[0]?.price}
        />

        {/* Active trading ranking */}
        <RankingSection
          title="取引量ランキング"
          subtitle="相場報告が多いアイテム"
          icon="📊"
          items={activeItems}
          valueLabel="報告数"
          getValue={(item) => item._count.priceReports}
          formatValue={(v) => `${v}件`}
        />
      </div>

      {/* Popular ranking - full width */}
      {popularItems.length > 0 && (
        <div className="mt-6">
          <RankingSection
            title="人気コレクションランキング"
            subtitle="コレクション登録が多いアイテム"
            icon="⭐"
            items={popularItems}
            valueLabel="コレクション"
            getValue={(item) => item._count.collections}
            formatValue={(v) => `${v}人`}
          />
        </div>
      )}
    </div>
  );
}

type RankingItem = {
  id: string;
  slug: string;
  name: string;
  character: string | null;
  imageUrl: string | null;
  prize: { grade: string; lottery: { name: string; series: string } };
  priceReports: { price: number }[];
  _count: { collections: number; priceReports: number };
};

function RankingSection({
  title,
  subtitle,
  icon,
  items,
  valueLabel,
  getValue,
  formatValue,
}: {
  title: string;
  subtitle: string;
  icon: string;
  items: RankingItem[];
  valueLabel: string;
  getValue: (item: RankingItem) => number | undefined;
  formatValue?: (v: number) => string;
}) {
  return (
    <div className="card overflow-hidden">
      <div className="px-5 py-3 border-b border-white/[0.06] flex items-center gap-2"
        style={{ background: "var(--bg-elevated)" }}>
        <span className="text-base">{icon}</span>
        <div>
          <h2 className="text-sm font-bold text-white">{title}</h2>
          <p className="text-[0.6rem] text-slate-500">{subtitle}</p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="p-8 text-center text-sm text-slate-600">データなし</div>
      ) : (
        <div className="divide-y divide-white/[0.04]">
          {items.map((item, i) => {
            const val = getValue(item);
            const rankColor = i === 0 ? "text-[#f59e0b]" : i === 1 ? "text-slate-300" : i === 2 ? "text-[#cd7f32]" : "text-slate-500";
            return (
              <Link
                key={item.id}
                href={`/item/${item.slug}`}
                className="flex items-center gap-3 px-5 py-3 hover:bg-white/[0.02] transition-colors group"
              >
                {/* Rank */}
                <span className={`text-lg font-black w-8 text-center shrink-0 ${rankColor}`}>
                  {i + 1}
                </span>

                {/* Thumbnail */}
                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 overflow-hidden"
                  style={{ background: "var(--bg-primary)" }}>
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <ItemPlaceholder size="sm" />
                  )}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors truncate">
                    {item.name}
                  </div>
                  <div className="text-[0.6rem] text-slate-500 truncate">
                    {item.prize.lottery.name} / {item.prize.grade}
                  </div>
                </div>

                {/* Value */}
                <div className="shrink-0 text-right">
                  {val !== undefined && (
                    <>
                      <div className="text-sm font-black text-[#22c55e]">
                        {formatValue ? formatValue(val) : formatPrice(val)}
                      </div>
                      <div className="text-[0.55rem] text-slate-600">{valueLabel}</div>
                    </>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
