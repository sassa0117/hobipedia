"use client";

import { useState } from "react";
import { addToCollection } from "@/app/actions";
import { useSession } from "@/lib/auth-client";
import Link from "next/link";

const STATUSES = [
  { value: "OWNED", label: "持ってる", color: "bg-[#22c55e]", icon: "O" },
  { value: "WANTED", label: "欲しい", color: "bg-[#f472b6]", icon: "W" },
  { value: "FOR_SALE", label: "売りたい", color: "bg-[#38bdf8]", icon: "S" },
];

export function CollectionButton({ itemId }: { itemId: string }) {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [isPublic, setIsPublic] = useState(true);

  async function handleAdd(e?: React.FormEvent) {
    e?.preventDefault();
    if (!selectedStatus) return;
    setPending(true);
    const fd = new FormData();
    fd.set("itemId", itemId);
    fd.set("status", selectedStatus);
    fd.set("isPublic", isPublic.toString());

    // Get price inputs if they exist
    const form = document.getElementById(`collection-form-${itemId}`) as HTMLFormElement;
    if (form) {
      const sellPrice = (form.querySelector('[name="sellPrice"]') as HTMLInputElement)?.value;
      const buyPrice = (form.querySelector('[name="buyPrice"]') as HTMLInputElement)?.value;
      if (sellPrice) fd.set("sellPrice", sellPrice);
      if (buyPrice) fd.set("buyPrice", buyPrice);
    }

    await addToCollection(fd);
    setPending(false);
    setDone(true);
    setOpen(false);
    setSelectedStatus(null);
    setTimeout(() => setDone(false), 3000);
  }

  if (!session) {
    return (
      <Link href="/signin" className="btn-outline w-full text-sm py-2.5 block text-center">
        ログインしてコレクションに追加
      </Link>
    );
  }

  if (done) {
    return (
      <div className="text-xs text-center py-2.5 text-[#22c55e] font-bold">
        コレクションに追加しました
      </div>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="btn-outline w-full text-sm py-2.5"
      >
        コレクションに追加
      </button>
    );
  }

  return (
    <form id={`collection-form-${itemId}`} onSubmit={handleAdd} className="space-y-3">
      <div className="text-[0.65rem] text-slate-500 text-center">ステータスを選択</div>

      {/* Status buttons */}
      <div className="space-y-1.5">
        {STATUSES.map((s) => (
          <button
            key={s.value}
            type="button"
            onClick={() => setSelectedStatus(s.value)}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors text-sm ${
              selectedStatus === s.value
                ? "border-[#7c5cfc] bg-[#7c5cfc]/10 text-white"
                : "border-white/[0.08] text-slate-200 hover:border-white/[0.2]"
            }`}
          >
            <div className={`w-2.5 h-2.5 rounded-full ${s.color}`} />
            {s.label}
          </button>
        ))}
      </div>

      {/* Price input for FOR_SALE / WANTED */}
      {selectedStatus === "FOR_SALE" && (
        <div>
          <label className="text-[0.65rem] text-slate-500 block mb-1">売りたい価格 (円)</label>
          <input
            type="number"
            name="sellPrice"
            min={1}
            placeholder="希望価格"
            className="w-full bg-[var(--bg-primary)] border border-white/[0.1] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#7c5cfc] transition-colors"
          />
        </div>
      )}
      {selectedStatus === "WANTED" && (
        <div>
          <label className="text-[0.65rem] text-slate-500 block mb-1">買いたい価格 (円)</label>
          <input
            type="number"
            name="buyPrice"
            min={1}
            placeholder="希望価格"
            className="w-full bg-[var(--bg-primary)] border border-white/[0.1] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#7c5cfc] transition-colors"
          />
        </div>
      )}

      {/* Public/Private toggle */}
      <div className="flex items-center justify-between px-1">
        <span className="text-[0.65rem] text-slate-500">公開設定</span>
        <button
          type="button"
          onClick={() => setIsPublic(!isPublic)}
          className={`relative w-10 h-5 rounded-full transition-colors ${isPublic ? "bg-[#7c5cfc]" : "bg-slate-600"}`}
        >
          <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${isPublic ? "left-5" : "left-0.5"}`} />
        </button>
        <span className="text-[0.65rem] text-slate-400">{isPublic ? "公開" : "非公開"}</span>
      </div>

      {/* Submit */}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending || !selectedStatus}
          className="btn-primary flex-1 text-sm py-2 disabled:opacity-50"
        >
          {pending ? "追加中..." : "追加する"}
        </button>
        <button
          type="button"
          onClick={() => { setOpen(false); setSelectedStatus(null); }}
          className="btn-outline text-sm py-2 px-4"
        >
          キャンセル
        </button>
      </div>
    </form>
  );
}
