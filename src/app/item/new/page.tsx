"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createItem } from "@/app/actions";
import { useSession } from "@/lib/auth-client";

const CATEGORIES = [
  { value: "FIGURE", label: "フィギュア" },
  { value: "SCALE_FIGURE", label: "スケールフィギュア" },
  { value: "PRIZE_FIGURE", label: "プライズフィギュア" },
  { value: "NENDOROID", label: "ねんどろいど" },
  { value: "ICHIBAN_KUJI", label: "一番くじ" },
  { value: "ACSTA", label: "アクリルスタンド" },
  { value: "CAN_BADGE", label: "缶バッジ" },
  { value: "PLUSH", label: "ぬいぐるみ" },
  { value: "TRADING_CARD", label: "トレカ" },
  { value: "RUBBER_STRAP", label: "ラバーストラップ" },
  { value: "TAPESTRY", label: "タペストリー" },
  { value: "CLEAR_FILE", label: "クリアファイル" },
  { value: "TOWEL", label: "タオル" },
  { value: "OTHER", label: "その他" },
];

export default function NewItemPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!session) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 className="text-xl font-black text-white mb-4">商品を登録するにはログインが必要です</h1>
        <Link href="/signin" className="btn-primary text-sm">ログイン</Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await createItem(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else if (result.slug) {
      router.push(`/item/${result.slug}`);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <nav className="text-xs text-slate-500 mb-6">
        <Link href="/" className="hover:text-[#a78bfa] transition-colors">トップ</Link>
        <span className="text-slate-700 mx-1.5">/</span>
        <span className="text-slate-300">商品を登録</span>
      </nav>

      <div className="card p-6">
        <h1 className="text-xl font-black text-white mb-1">商品を登録する</h1>
        <p className="text-sm text-slate-500 mb-6">
          フィギュア、一番くじ、トレカ、ぬいぐるみ... あらゆるホビーグッズを登録できます。
        </p>

        {error && (
          <div className="rounded-lg p-3 mb-4 text-sm text-red-400 border border-red-500/20" style={{ background: "rgba(239,68,68,0.08)" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 商品名 */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              商品名 <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="name"
              required
              placeholder="例: MASTERLISE ルフィ太郎フィギュア"
              className="w-full px-4 py-2.5 rounded-lg text-sm outline-none text-slate-200 placeholder:text-slate-600 border border-white/[0.08] focus:border-[#7c5cfc] transition-colors"
              style={{ background: "var(--bg-elevated)" }}
            />
          </div>

          {/* カテゴリ */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">カテゴリ</label>
            <select
              name="category"
              defaultValue="FIGURE"
              className="w-full px-4 py-2.5 rounded-lg text-sm outline-none text-slate-200 border border-white/[0.08] focus:border-[#7c5cfc] transition-colors"
              style={{ background: "var(--bg-elevated)" }}
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          {/* シリーズ */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">シリーズ / 作品名</label>
            <input
              type="text"
              name="series"
              placeholder="例: ワンピース, 呪術廻戦, 初音ミク"
              className="w-full px-4 py-2.5 rounded-lg text-sm outline-none text-slate-200 placeholder:text-slate-600 border border-white/[0.08] focus:border-[#7c5cfc] transition-colors"
              style={{ background: "var(--bg-elevated)" }}
            />
          </div>

          {/* キャラクター */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">キャラクター名</label>
            <input
              type="text"
              name="character"
              placeholder="例: モンキー・D・ルフィ"
              className="w-full px-4 py-2.5 rounded-lg text-sm outline-none text-slate-200 placeholder:text-slate-600 border border-white/[0.08] focus:border-[#7c5cfc] transition-colors"
              style={{ background: "var(--bg-elevated)" }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* メーカー */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">メーカー</label>
              <input
                type="text"
                name="maker"
                placeholder="例: BANDAI SPIRITS"
                className="w-full px-4 py-2.5 rounded-lg text-sm outline-none text-slate-200 placeholder:text-slate-600 border border-white/[0.08] focus:border-[#7c5cfc] transition-colors"
                style={{ background: "var(--bg-elevated)" }}
              />
            </div>

            {/* JAN */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">JANコード</label>
              <input
                type="text"
                name="jan"
                placeholder="4573102..."
                className="w-full px-4 py-2.5 rounded-lg text-sm outline-none text-slate-200 placeholder:text-slate-600 border border-white/[0.08] focus:border-[#7c5cfc] transition-colors font-mono"
                style={{ background: "var(--bg-elevated)" }}
              />
            </div>
          </div>

          {/* 説明 */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">説明</label>
            <textarea
              name="description"
              rows={4}
              placeholder="商品の詳細情報、サイズ、素材など"
              className="w-full px-4 py-2.5 rounded-lg text-sm outline-none text-slate-200 placeholder:text-slate-600 border border-white/[0.08] focus:border-[#7c5cfc] transition-colors resize-none"
              style={{ background: "var(--bg-elevated)" }}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary text-sm flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "登録中..." : "商品を登録する"}
            </button>
            <Link href="/" className="btn-outline text-sm px-6">
              キャンセル
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
