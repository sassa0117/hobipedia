import Link from "next/link";

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-800 to-indigo-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
            Hobipedia
          </h1>
          <p className="text-lg md:text-xl text-blue-200 mb-2">
            アニメグッズの相場データベース & コレクション管理
          </p>
          <p className="text-sm text-blue-300 mb-8">
            一番くじ・フィギュア・アクスタ・缶バッジ — みんなで作る価格Wiki
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/lottery"
              className="bg-white text-blue-800 font-bold px-6 py-3 rounded-xl hover:bg-blue-50 transition-colors"
            >
              一番くじを探す
            </Link>
            <Link
              href="/collection"
              className="border-2 border-white/40 text-white font-bold px-6 py-3 rounded-xl hover:bg-white/10 transition-colors"
            >
              コレクションを始める
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-black text-center mb-10">
          Hobipediaでできること
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            emoji="📊"
            title="相場チェック"
            description="メルカリ・ヤフオク・駿河屋の実売データから、リアルな相場がわかる。買う前に、売る前に。"
          />
          <FeatureCard
            emoji="📦"
            title="コレクション管理"
            description="持ってるもの・欲しいもの・売りたいものを一覧管理。資産価値もひと目でわかる。"
          />
          <FeatureCard
            emoji="🌐"
            title="みんなで作るWiki"
            description="アイテム情報・相場報告をコミュニティで共有。Discogs式のコントリビューション。"
          />
        </div>
      </section>

      {/* Stats placeholder */}
      <section className="bg-white border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <StatBox label="登録アイテム" value="—" />
            <StatBox label="相場データ" value="—" />
            <StatBox label="コレクター" value="—" />
            <StatBox label="対応カテゴリ" value="一番くじ" />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-8">
          <p className="text-lg font-bold text-amber-900 mb-2">
            現在アーリーアクセス中
          </p>
          <p className="text-sm text-amber-700 mb-4">
            一番くじカテゴリからスタート。フィギュア・アクスタ・缶バッジは順次追加予定。
          </p>
          <Link
            href="/lottery"
            className="inline-block bg-amber-500 text-white font-bold px-6 py-3 rounded-xl hover:bg-amber-600 transition-colors"
          >
            一番くじデータベースを見る
          </Link>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({
  emoji,
  title,
  description,
}: {
  emoji: string;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
      <div className="text-4xl mb-3">{emoji}</div>
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-2xl font-black text-blue-800">{value}</div>
      <div className="text-sm text-gray-500 mt-1">{label}</div>
    </div>
  );
}
