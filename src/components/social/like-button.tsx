"use client";

import { useState, useTransition } from "react";
import { toggleLikeItem } from "@/app/actions";
import { useSession } from "@/lib/auth-client";

export function LikeButton({
  itemId,
  initialLiked,
  initialCount,
}: {
  itemId: string;
  initialLiked: boolean;
  initialCount: number;
}) {
  const { data: session } = useSession();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!session) return;
    const newLiked = !liked;
    setLiked(newLiked);
    setCount((c) => c + (newLiked ? 1 : -1));

    startTransition(async () => {
      const result = await toggleLikeItem(itemId);
      if ("error" in result) {
        setLiked(!newLiked);
        setCount((c) => c + (newLiked ? -1 : 1));
      }
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending || !session}
      className={`flex items-center gap-1.5 text-xs transition-all ${
        liked
          ? "text-[#f472b6]"
          : session
            ? "text-slate-500 hover:text-[#f472b6]"
            : "text-slate-700 cursor-default"
      }`}
      title={session ? (liked ? "いいね解除" : "いいね") : "ログインが必要です"}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill={liked ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
      <span className="font-medium">{count}</span>
    </button>
  );
}
