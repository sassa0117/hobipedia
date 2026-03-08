"use client";

import { useState } from "react";
import { addToCollection } from "@/app/actions";

const STATUSES = [
  { value: "OWNED", label: "持ってる", color: "bg-[#22c55e]" },
  { value: "WANTED", label: "欲しい", color: "bg-[#f472b6]" },
  { value: "FOR_SALE", label: "売りたい", color: "bg-[#38bdf8]" },
];

export function CollectionButton({ itemId }: { itemId: string }) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);

  async function handleAdd(status: string) {
    setPending(true);
    const fd = new FormData();
    fd.set("itemId", itemId);
    fd.set("status", status);
    await addToCollection(fd);
    setPending(false);
    setDone(true);
    setOpen(false);
    setTimeout(() => setDone(false), 3000);
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
    <div className="space-y-2">
      <div className="text-[0.65rem] text-slate-500 text-center mb-1">ステータスを選択</div>
      {STATUSES.map((s) => (
        <button
          key={s.value}
          onClick={() => handleAdd(s.value)}
          disabled={pending}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-white/[0.08] hover:border-white/[0.2] transition-colors text-sm text-slate-200 disabled:opacity-50"
        >
          <div className={`w-2.5 h-2.5 rounded-full ${s.color}`} />
          {s.label}
        </button>
      ))}
      <button
        onClick={() => setOpen(false)}
        className="w-full text-xs text-slate-600 py-1"
      >
        キャンセル
      </button>
    </div>
  );
}
