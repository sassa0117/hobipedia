"use client";

import { useState, useTransition } from "react";
import { toggleFollow } from "@/app/actions";
import { useSession } from "@/lib/auth-client";

export function FollowButton({
  targetUserId,
  initialFollowing,
}: {
  targetUserId: string;
  initialFollowing: boolean;
}) {
  const { data: session } = useSession();
  const [following, setFollowing] = useState(initialFollowing);
  const [isPending, startTransition] = useTransition();
  const [hover, setHover] = useState(false);

  if (!session || session.user.id === targetUserId) return null;

  function handleClick() {
    const newState = !following;
    setFollowing(newState);

    startTransition(async () => {
      const result = await toggleFollow(targetUserId);
      if ("error" in result) {
        setFollowing(!newState);
      }
    });
  }

  const label = following
    ? hover
      ? "解除"
      : "フォロー中"
    : "フォロー";

  return (
    <button
      onClick={handleClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      disabled={isPending}
      className={`text-xs font-bold px-4 py-1.5 rounded-full transition-all ${
        following
          ? hover
            ? "bg-red-500/10 text-red-400 border border-red-500/30"
            : "bg-white/[0.06] text-slate-300 border border-white/[0.1]"
          : "bg-[#7c5cfc] text-white hover:bg-[#6d4de8]"
      } disabled:opacity-50`}
    >
      {label}
    </button>
  );
}
