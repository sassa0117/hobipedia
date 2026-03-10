"use client";

import { useState } from "react";
import { addComment } from "@/app/actions";
import { useSession } from "@/lib/auth-client";
import Link from "next/link";

export function CommentForm({ itemId }: { itemId: string }) {
  const { data: session } = useSession();
  const [body, setBody] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (!session) {
    return (
      <div className="text-center py-3">
        <Link href="/signin" className="text-sm text-[#a78bfa] hover:underline">
          ログインしてコメントする
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setPending(true);
    const fd = new FormData();
    fd.set("itemId", itemId);
    fd.set("body", body.trim());
    const result = await addComment(fd);
    setPending(false);
    if (result.error) {
      setMessage(result.error);
    } else {
      setBody("");
      setMessage(null);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7c5cfc] to-[#a78bfa] flex items-center justify-center text-xs font-bold text-white shrink-0">
          {session.user.name?.[0]?.toUpperCase() || "?"}
        </div>
        <div className="flex-1">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={2}
            placeholder="コメントを書く..."
            className="w-full bg-[var(--bg-primary)] border border-white/[0.1] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#7c5cfc] transition-colors resize-none"
          />
        </div>
      </div>
      {message && <div className="text-xs text-[#ef4444]">{message}</div>}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={pending || !body.trim()}
          className="btn-primary text-xs px-4 py-1.5 disabled:opacity-50"
        >
          {pending ? "送信中..." : "投稿"}
        </button>
      </div>
    </form>
  );
}
