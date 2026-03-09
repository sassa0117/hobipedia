import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { FigurePlaceholder } from "@/components/ui/placeholders";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [lotteryCount, itemCount, priceCount, seriesCount] = await Promise.all([
    prisma.lottery.count(),
    prisma.item.count(),
    prisma.priceReport.count(),
    prisma.series.count(),
  ]);

  const recentItems = await prisma.item.findMany({
    take: 6,
    orderBy: { createdAt: "desc" },
    include: {
      series: true,
      prize: { include: { lottery: true } },
      priceReports: { orderBy: { reportedAt: "desc" }, take: 1 },
    },
  });

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#7c5cfc]/10 via-transparent to-transparent" />
        <div className="max-w-7xl mx-auto px-4 pt-20 pb-16 relative">
          <div className="text-center max-w-2xl mx-auto">
            <div className="series-tag mb-6 inline-block">EARLY ACCESS</div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-4 leading-tight">
              ホビーグッズの<br />
              <span className="bg-gradient-to-r from-[#7c5cfc] to-[#a78bfa] bg-clip-text text-transparent">
                みんなで作るWiki
              </span>
            </h1>
            <p className="text-slate-400 text-lg mb-8 leading-relaxed">
              フィギュア・一番くじ・トレカの情報と相場をコミュニティで共有。<br className="hidden md:block" />
              誰でも商品を登録・編集できるホビーのWikipedia。
            </p>
            <div className="flex justify-center gap-3">
              <Link href="/item/new" className="btn-primary text-sm">
                商品を登録する
              </Link>
              <Link href="/lottery" className="btn-outline text-sm">
                データベースを見る
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats - Discogs style: show database scale */}
      <section className="border-y border-white/[0.06]" style={{ background: "var(--bg-secondary)" }}>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-4 gap-8 text-center">
            <StatBlock value={seriesCount.toString()} label="シリーズ" />
            <StatBlock value={lotteryCount.toString()} label="ロット" />
            <StatBlock value={itemCount.toString()} label="アイテム" />
            <StatBlock value={priceCount.toString()} label="相場データ" />
          </div>
        </div>
      </section>

      {/* Recent Items - MFC style: image-rich card grid */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">最近追加されたアイテム</h2>
          <Link href="/lottery" className="text-sm text-[#a78bfa] hover:text-[#c4b5fd] transition-colors">
            すべて見る &rarr;
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {recentItems.map((item) => {
            const latestPrice = item.priceReports[0];
            const seriesName = item.series?.name || "";
            return (
              <Link
                key={item.id}
                href={`/item/${item.slug}`}
                className="card p-3 group"
              >
                {/* Image placeholder */}
                <div className="aspect-square rounded-lg mb-3 flex items-center justify-center text-3xl"
                  style={{ background: "var(--bg-elevated)" }}>
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <FigurePlaceholder />
                  )}
                </div>
                {/* Series tag */}
                {seriesName && (
                <div className="series-tag text-[0.6rem] mb-1.5 truncate">
                  {seriesName}
                </div>
                )}
                {/* Name */}
                <div className="text-xs font-bold text-slate-200 leading-snug mb-1 line-clamp-2 group-hover:text-white transition-colors">
                  {item.name}
                </div>
                {/* Character */}
                {item.character && (
                  <div className="text-[0.65rem] text-slate-500 mb-1.5 truncate">{item.character}</div>
                )}
                {/* Price */}
                {latestPrice ? (
                  <div className="text-sm font-black text-[#22c55e]">
                    {formatPrice(latestPrice.price)}
                  </div>
                ) : (
                  <div className="text-[0.65rem] text-slate-600">相場データなし</div>
                )}
              </Link>
            );
          })}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-4">
          <FeatureCard
            icon={<WikiIcon />}
            title="みんなで作るWiki"
            desc="誰でも商品を登録・編集できる。フィギュア、一番くじ、トレカ、ぬいぐるみ。ホビーの百科事典をみんなで作ろう。"
          />
          <FeatureCard
            icon={<PriceIcon />}
            title="リアルタイム相場"
            desc="メルカリ・ヤフオク・駿河屋の実売データ、店舗発見価格、売りたい/買いたい希望価格をみんなで共有。"
          />
          <FeatureCard
            icon={<CollectionIcon />}
            title="コレクション管理"
            desc="持っている・欲しい・売りたいをワンタップ管理。公開/非公開の切り替えも自由。"
          />
        </div>
      </section>
    </div>
  );
}

function StatBlock({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-2xl md:text-3xl font-black bg-gradient-to-r from-[#7c5cfc] to-[#a78bfa] bg-clip-text text-transparent">
        {value}
      </div>
      <div className="text-xs text-slate-500 mt-1">{label}</div>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="card p-5">
      <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
        style={{ background: "var(--accent-muted)" }}>
        {icon}
      </div>
      <h3 className="text-sm font-bold text-white mb-2">{title}</h3>
      <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
    </div>
  );
}

function PriceIcon() {
  return (
    <svg className="w-5 h-5 text-[#a78bfa]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  );
}

function CollectionIcon() {
  return (
    <svg className="w-5 h-5 text-[#a78bfa]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  );
}

function WikiIcon() {
  return (
    <svg className="w-5 h-5 text-[#a78bfa]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  );
}
