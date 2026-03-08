"use client";

import { useState } from "react";
import { reportPrice } from "@/app/actions";

const SOURCES = [
  { value: "MERCARI", label: "メルカリ" },
  { value: "YAHOO_AUCTION", label: "ヤフオク" },
  { value: "YAHOO_FREEMARKET", label: "Yahoo!フリマ" },
  { value: "SURUGAYA", label: "駿河屋" },
  { value: "MANDARAKE", label: "まんだらけ" },
  { value: "LASHINBAN", label: "らしんばん" },
  { value: "AMAZON", label: "Amazon" },
  { value: "USER_REPORT", label: "その他" },
];

const CONDITIONS = ["未開封", "開封済み", "箱なし", "傷あり"];

export function PriceReportForm({ itemId }: { itemId: string }) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

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

      <div>
        <label className="text-[0.65rem] text-slate-500 block mb-1">ソース *</label>
        <select
          name="source"
          required
          className="w-full bg-[var(--bg-primary)] border border-white/[0.1] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#7c5cfc] transition-colors"
        >
          {SOURCES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

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

      <div>
        <label className="text-[0.65rem] text-slate-500 block mb-1">出品URL</label>
        <input
          type="url"
          name="sourceUrl"
          placeholder="https://..."
          className="w-full bg-[var(--bg-primary)] border border-white/[0.1] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#7c5cfc] transition-colors"
        />
      </div>

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
