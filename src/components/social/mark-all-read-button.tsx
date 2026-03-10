"use client";

import { useTransition } from "react";
import { markNotificationsRead } from "@/app/actions";

export function MarkAllReadButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(async () => { await markNotificationsRead(); })}
      disabled={isPending}
      className="text-xs text-[#a78bfa] hover:text-[#c4b5fd] transition-colors disabled:opacity-50"
    >
      {isPending ? "処理中..." : "すべて既読にする"}
    </button>
  );
}
