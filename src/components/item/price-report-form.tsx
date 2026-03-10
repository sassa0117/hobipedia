"use client";

import { useState } from "react";
import { reportPrice } from "@/app/actions";
import { useSession } from "@/lib/auth-client";
import Link from "next/link";

const PRICE_TYPES = [
  { value: "SOLD", label: "実売価格", desc: "メルカリsold等の実際に売れた価格" },
  { value: "LISTING", label: "出品中", desc: "現在出品されている価格" },
  { value: "STORE_FIND", label: "店舗発見", desc: "実店舗で見つけた価格" },
  { value: "WANT_TO_BUY", label: "買いたい", desc: "この価格なら買いたい" },
  { value: "WANT_TO_SELL", label: "売りたい", desc: "この価格で売りたい" },
];

const SOURCES = [
  { value: "MERCARI", label: "メルカリ" },
  { value: "YAHOO_AUCTION", label: "ヤフオク" },
  { value: "YAHOO_FREEMARKET", label: "Yahoo!フリマ" },
  { value: "SURUGAYA", label: "駿河屋" },
  { value: "MANDARAKE", label: "まんだらけ" },
  { value: "LASHINBAN", label: "らしんばん" },
  { value: "AMAZON", label: "Amazon" },
  { value: "RAKUTEN", label: "楽天" },
  { value: "STORE", label: "実店舗" },
  { value: "USER_REPORT", label: "自己申告" },
  { value: "OTHER", label: "その他" },
];

const CONDITIONS = ["未開封", "開封済み", "箱なし", "傷あり"];

export function PriceReportForm({ itemId }: { itemId: string }) {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [priceType, setPriceType] = useState("SOLD");

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setMessage(null);
    const result = await reportPrice(formData);
    setPending(false);
    if (result.error) {
      setMessage({ type: "error", text: result.error });
    } else {
      setMessage({ type: "success", text: "相場を報告しました" });
      setOpen(false);
      setTimeout(() => setMessage(null), 3000);
    }
  }

  if (!open) {
    return (
      <div>
        {message && (
          <div className={`text-xs mb-2 px-3 py-2 rounded-lg ${message.type === "success" ? "bg-[#22c55e]/10 text-[#22c55e]" : "bg-[#ef4444]/10 text-[#ef4444]"}`}>
            {message.text}
          </div>
        )}
        <button onClick={() => setOpen(true)} className="btn-primary w-full text-sm py-2.5">
          相場を報告する
        </button>
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="space-y-3">
      <input type="hidden" name="itemId" value={itemId} />
      <input type="hidden" name="priceType" value={priceType} />

      {/* Price Type Tabs */}
      <div>
        <label className="text-[0.65rem] text-slate-500 block mb-1.5">報告タイプ</label>
        <div className="grid grid-cols-2 gap-1.5">
          {PRICE_TYPES.map((pt) => (
            <button
              key={pt.value}
              type="button"
              onClick={() => setPriceType(pt.value)}
              className={`text-left px-2.5 py-2 rounded-lg border text-[0.7rem] transition-all ${
                priceType === pt.value
                  ? "border-[#7c5cfc] bg-[#7c5cfc]/10 text-[#a78bfa]"
                  : "border-white/[0.08] text-slate-400 hover:border-white/[0.15]"
              }`}
            >
              <div className="font-bold">{pt.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Price */}
      <div>
        <label className="text-[0.65rem] text-slate-500 block mb-1">価格 (円) *</label>
        <input
          type="number"
          name="price"
          required
          min={1}
          placeholder="3500"
          className="w-full bg-[var(--bg-primary)] border border-white/[0.1] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#7c5cfc] transition-colors"
        />
      </div>

      {/* Source - 店舗発見の場合は STORE がデフォルト */}
      <div>
        <label className="text-[0.65rem] text-slate-500 block mb-1">ソース *</label>
        <select
          name="source"
          required
          defaultValue={priceType === "STORE_FIND" ? "STORE" : "MERCARI"}
          className="w-full bg-[var(--bg-primary)] border border-white/[0.1] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#7c5cfc] transition-colors"
        >
          {SOURCES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      {/* Store name - 店舗発見時のみ */}
      {priceType === "STORE_FIND" && (
        <div>
          <label className="text-[0.65rem] text-slate-500 block mb-1">店舗名</label>
          <input
            type="text"
            name="storeName"
            placeholder="例: ブックオフ 渋谷店"
            className="w-full bg-[var(--bg-primary)] border border-white/[0.1] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#7c5cfc] transition-colors"
          />
        </div>
      )}

      {/* Condition */}
      <div>
        <label className="text-[0.65rem] text-slate-500 block mb-1">状態</label>
        <select
          name="condition"
          className="w-full bg-[var(--bg-primary)] border border-white/[0.1] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#7c5cfc] transition-colors"
        >
          <option value="">選択なし</option>
          {CONDITIONS.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Source URL */}
      {(priceType === "SOLD" || priceType === "LISTING") && (
        <div>
          <label className="text-[0.65rem] text-slate-500 block mb-1">URL</label>
          <input
            type="url"
            name="sourceUrl"
            placeholder="https://..."
            className="w-full bg-[var(--bg-primary)] border border-white/[0.1] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#7c5cfc] transition-colors"
          />
        </div>
      )}

      {!session && (
        <div className="text-[0.65rem] text-slate-500 text-center">
          <Link href="/signin" className="text-[#a78bfa] hover:underline">ログイン</Link>するとユーザー名で記録されます
        </div>
      )}

      {message?.type === "error" && (
        <div className="text-xs text-[#ef4444]">{message.text}</div>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="btn-primary flex-1 text-sm py-2 disabled:opacity-50"
        >
          {pending ? "送信中..." : "報告する"}
        </button>
        <button
          type="button"
          onClick={() => { setOpen(false); setMessage(null); }}
          className="btn-outline text-sm py-2 px-4"
        >
          キャンセル
        </button>
      </div>
    </form>
  );
}
