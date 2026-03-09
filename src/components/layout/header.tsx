"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSession, signOut } from "@/lib/auth-client";

export function Header() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const { data: session, isPending } = useSession();
  const [showMenu, setShowMenu] = useState(false);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (q) {
      router.push(`/search?q=${encodeURIComponent(q)}`);
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-[#12162b]/95 backdrop-blur-md border-b border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black text-white bg-gradient-to-br from-[#7c5cfc] to-[#6d28d9]">
            H
          </div>
          <span className="text-lg font-black tracking-tight text-slate-100">
            Hobipedia
          </span>
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="search-bar flex items-center w-full px-3 py-2 gap-2">
            <svg className="w-4 h-4 shrink-0 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="作品名・アイテム名で検索..."
              className="w-full bg-transparent text-sm outline-none text-slate-200 placeholder:text-slate-600"
            />
          </div>
        </form>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-1">
          <NavLink href="/lottery">一番くじ</NavLink>
          <NavLink href="/ranking">ランキング</NavLink>
          <NavLink href="/collection">コレクション</NavLink>
        </nav>

        {/* Auth */}
        <div className="flex items-center gap-3 ml-4">
          {isPending ? (
            <div className="w-8 h-8 rounded-full bg-slate-700 animate-pulse" />
          ) : session ? (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-2 rounded-full hover:bg-white/[0.05] p-1 transition-colors"
              >
                {session.user.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7c5cfc] to-[#a78bfa] flex items-center justify-center text-xs font-bold text-white">
                    {session.user.name?.[0]?.toUpperCase() || "?"}
                  </div>
                )}
              </button>

              {showMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                  <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-white/[0.08] shadow-xl z-50"
                    style={{ background: "var(--bg-card)" }}>
                    <div className="px-4 py-3 border-b border-white/[0.06]">
                      <div className="text-sm font-bold text-white truncate">{session.user.name}</div>
                      <div className="text-[0.65rem] text-slate-500 truncate">{session.user.email}</div>
                    </div>
                    <div className="py-1">
                      <MenuLink href="/settings" onClick={() => setShowMenu(false)}>プロフィール設定</MenuLink>
                      <MenuLink href="/collection" onClick={() => setShowMenu(false)}>マイコレクション</MenuLink>
                      <MenuLink href="/item/new" onClick={() => setShowMenu(false)}>商品を登録</MenuLink>
                    </div>
                    <div className="border-t border-white/[0.06] py-1">
                      <button
                        onClick={async () => {
                          await signOut();
                          setShowMenu(false);
                          router.refresh();
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/[0.03] transition-colors"
                      >
                        ログアウト
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link href="/signin" className="btn-primary text-xs px-3 py-1.5">
              ログイン
            </Link>
          )}
        </div>
      </div>

      {/* Mobile search */}
      <form onSubmit={handleSearch} className="md:hidden px-4 pb-3">
        <div className="search-bar flex items-center w-full px-3 py-2 gap-2">
          <svg className="w-4 h-4 shrink-0 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="検索..."
            className="w-full bg-transparent text-sm outline-none text-slate-200 placeholder:text-slate-600"
          />
        </div>
      </form>
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-sm px-3 py-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-[rgba(124,92,252,0.1)] transition-all"
    >
      {children}
    </Link>
  );
}

function MenuLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block px-4 py-2 text-sm text-slate-300 hover:bg-white/[0.03] transition-colors"
    >
      {children}
    </Link>
  );
}
