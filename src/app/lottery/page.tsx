import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate, formatPrice } from "@/lib/utils";

export const metadata = {
  title: "一番くじ一覧 - Hobipedia",
  description: "一番くじの相場データベース。ロット別に賞品の相場をチェック。",
};

export default async function LotteryListPage() {
  const lotteries = await prisma.lottery.findMany({
    orderBy: { releaseDate: "desc" },
    include: {
      _count: { select: { prizes: true } },
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-2">一番くじ データベース</h1>
        <p className="text-gray-600">
          ロットを選んで、各賞品の相場をチェック
        </p>
      </div>

      {lotteries.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lotteries.map((lottery) => (
            <LotteryCard key={lottery.id} lottery={lottery} />
          ))}
        </div>
      )}
    </div>
  );
}

function LotteryCard({
  lottery,
}: {
  lottery: {
    id: string;
    name: string;
    slug: string;
    series: string;
    releaseDate: Date | null;
    price: number | null;
    imageUrl: string | null;
    _count: { prizes: number };
  };
}) {
  return (
    <Link
      href={`/lottery/${lottery.slug}`}
      className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden group"
    >
      <div className="aspect-video bg-gray-100 flex items-center justify-center">
        {lottery.imageUrl ? (
          <img
            src={lottery.imageUrl}
            alt={lottery.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-5xl">🎰</span>
        )}
      </div>
      <div className="p-4">
        <div className="text-xs font-medium text-blue-600 mb-1">
          {lottery.series}
        </div>
        <h2 className="font-bold text-sm leading-snug mb-2 group-hover:text-blue-700 transition-colors">
          {lottery.name}
        </h2>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          {lottery.releaseDate && (
            <span>{formatDate(lottery.releaseDate)}</span>
          )}
          {lottery.price && <span>{formatPrice(lottery.price)}/回</span>}
          <span>{lottery._count.prizes}賞</span>
        </div>
      </div>
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-20">
      <div className="text-6xl mb-4">🎰</div>
      <h2 className="text-xl font-bold mb-2">まだデータがありません</h2>
      <p className="text-gray-500 mb-6">
        最初のコントリビューターになりませんか？
      </p>
      <Link
        href="/lottery/new"
        className="inline-block bg-blue-700 text-white font-bold px-6 py-3 rounded-xl hover:bg-blue-800 transition-colors"
      >
        一番くじを登録する
      </Link>
    </div>
  );
}
