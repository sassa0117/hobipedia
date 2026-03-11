"use client";

import { signIn } from "@/lib/auth-client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignInPage() {
  const router = useRouter();
  const [devLoading, setDevLoading] = useState(false);

  async function handleDevLogin() {
    setDevLoading(true);
    try {
      const res = await fetch("/api/dev-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (res.ok) {
        router.push("/");
        router.refresh();
      } else {
        alert("開発者ログインに失敗しました");
      }
    } catch {
      alert("エラーが発生しました");
    } finally {
      setDevLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <span className="text-2xl font-black" style={{ color: "var(--accent)" }}>Hobipedia</span>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>ホビーグッズWikiに参加しよう</p>
        </div>

        <div className="card p-6 space-y-3">
          <button
            onClick={() => signIn.social({ provider: "google", callbackURL: "/" })}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-lg border transition-colors text-sm font-medium"
            style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
          >
            <svg className="w-4.5 h-4.5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Googleでログイン
          </button>

          <button
            onClick={() => signIn.social({ provider: "twitter", callbackURL: "/" })}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-lg border transition-colors text-sm font-medium"
            style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
          >
            <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            X (Twitter) でログイン
          </button>

          {/* 開発者ログイン */}
          <div className="pt-2 border-t" style={{ borderColor: "var(--border)" }}>
            <button
              onClick={handleDevLogin}
              disabled={devLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
              style={{ background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.2)", color: "var(--accent)" }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              {devLoading ? "ログイン中..." : "テストログイン（OAuth不要）"}
            </button>
          </div>
        </div>

        <p className="text-center text-[0.65rem] mt-4" style={{ color: "var(--text-dim)" }}>
          ログインすると商品の登録・編集、相場報告、コレクション管理ができます
        </p>

        <div className="mt-4 text-center">
          <Link href="/" className="text-sm text-link">← トップに戻る</Link>
        </div>
      </div>
    </div>
  );
}
