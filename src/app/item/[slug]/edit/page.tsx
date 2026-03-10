"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { updateItem } from "@/app/actions";
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

interface ItemData {
  id: string;
  name: string;
  category: string;
  character: string | null;
  series: { name: string } | null;
  maker: string | null;
  jan: string | null;
  description: string | null;
}

export default function EditItemPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  const { data: session } = useSession();
  const [item, setItem] = useState<ItemData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/items/${slug}`)
      .then((r) => r.json())
      .then((data) => setItem(data))
      .catch(() => setError("アイテムが見つかりません"));
  }, [slug]);

  if (!session) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 className="text-xl font-black text-white mb-4">編集するにはログインが必要です</h1>
        <Link href="/signin" className="btn-primary text-sm">ログイン</Link>
      </div>
    );
  }

  if (!item && !error) {
    return <div className="max-w-2xl mx-auto px-4 py-16 text-center text-slate-500">読み込み中...</div>;
  }

  if (error || !item) {
    return <div className="max-w-2xl mx-auto px-4 py-16 text-center text-red-400">{error}</div>;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.set("itemId", item!.id);
    const result = await updateItem(formData);
    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push(`/item/${slug}`);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <nav className="text-xs text-slate-500 mb-6">
        <Link href={`/item/${slug}`} className="hover:text-[#a78bfa] transition-colors">{item.name}</Link>
        <span className="text-slate-700 mx-1.5">/</span>
        <span className="text-slate-300">編集</span>
      </nav>

      <div className="card p-6">
        <h1 className="text-xl font-black text-white mb-1">アイテムを編集</h1>
        <p className="text-sm text-slate-500 mb-6">
          Wikiのように誰でも情報を改善できます。変更は履歴に記録されます。
        </p>

        {error && (
          <div className="rounded-lg p-3 mb-4 text-sm text-red-400 border border-red-500/20" style={{ background: "rgba(239,68,68,0.08)" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">商品名 <span className="text-red-400">*</span></label>
            <input type="text" name="name" required defaultValue={item.name}
              className="w-full px-4 py-2.5 rounded-lg text-sm outline-none text-slate-200 border border-white/[0.08] focus:border-[#7c5cfc] transition-colors"
              style={{ background: "var(--bg-elevated)" }} />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">カテゴリ</label>
            <select name="category" defaultValue={item.category}
              className="w-full px-4 py-2.5 rounded-lg text-sm outline-none text-slate-200 border border-white/[0.08] focus:border-[#7c5cfc] transition-colors"
              style={{ background: "var(--bg-elevated)" }}>
              {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">シリーズ / 作品名</label>
            <input type="text" name="series" defaultValue={item.series?.name || ""}
              className="w-full px-4 py-2.5 rounded-lg text-sm outline-none text-slate-200 placeholder:text-slate-600 border border-white/[0.08] focus:border-[#7c5cfc] transition-colors"
              style={{ background: "var(--bg-elevated)" }} />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">キャラクター名</label>
            <input type="text" name="character" defaultValue={item.character || ""}
              className="w-full px-4 py-2.5 rounded-lg text-sm outline-none text-slate-200 placeholder:text-slate-600 border border-white/[0.08] focus:border-[#7c5cfc] transition-colors"
              style={{ background: "var(--bg-elevated)" }} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">メーカー</label>
              <input type="text" name="maker" defaultValue={item.maker || ""}
                className="w-full px-4 py-2.5 rounded-lg text-sm outline-none text-slate-200 placeholder:text-slate-600 border border-white/[0.08] focus:border-[#7c5cfc] transition-colors"
                style={{ background: "var(--bg-elevated)" }} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">JANコード</label>
              <input type="text" name="jan" defaultValue={item.jan || ""}
                className="w-full px-4 py-2.5 rounded-lg text-sm outline-none text-slate-200 placeholder:text-slate-600 border border-white/[0.08] focus:border-[#7c5cfc] transition-colors font-mono"
                style={{ background: "var(--bg-elevated)" }} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">説明</label>
            <textarea name="description" rows={4} defaultValue={item.description || ""}
              className="w-full px-4 py-2.5 rounded-lg text-sm outline-none text-slate-200 placeholder:text-slate-600 border border-white/[0.08] focus:border-[#7c5cfc] transition-colors resize-none"
              style={{ background: "var(--bg-elevated)" }} />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">編集コメント</label>
            <input type="text" name="summary" placeholder="例: 画像追加、情報修正"
              className="w-full px-4 py-2.5 rounded-lg text-sm outline-none text-slate-200 placeholder:text-slate-600 border border-white/[0.08] focus:border-[#7c5cfc] transition-colors"
              style={{ background: "var(--bg-elevated)" }} />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="btn-primary text-sm flex-1 disabled:opacity-50">
              {loading ? "保存中..." : "変更を保存"}
            </button>
            <Link href={`/item/${slug}`} className="btn-outline text-sm px-6 flex items-center">キャンセル</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
