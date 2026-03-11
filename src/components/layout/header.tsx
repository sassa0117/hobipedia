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
  const [showMobileNav, setShowMobileNav] = useState(false);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (q) {
      router.push(`/search?q=${encodeURIComponent(q)}`);
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b" style={{ background: "rgba(17,17,19,0.92)", backdropFilter: "blur(12px)", borderColor: "var(--border)" }}>
      <div className="max-w-6xl mx-auto px-4 h-12 flex items-center gap-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="text-base font-black tracking-tight" style={{ color: "var(--accent)" }}>
            Hobipedia
          </span>
        </Link>

        {/* Nav - Desktop */}
        <nav className="hidden md:flex items-center gap-0.5 ml-2">
          <NavLink href="/lottery">一番くじ</NavLink>
          <NavLink href="/search">アイテム検索</NavLink>
          {session && <NavLink href="/timeline">タイムライン</NavLink>}
        </nav>

        {/* Search */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-sm ml-auto">
          <div className="search-bar flex items-center w-full px-2.5 py-1.5 gap-2">
            <svg className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--text-dim)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="アイテム名・作品名で検索..."
              className="w-full bg-transparent text-xs outline-none placeholder:text-zinc-600"
              style={{ color: "var(--text-primary)" }}
            />
          </div>
        </form>

        {/* Right side */}
        <div className="flex items-center gap-2 ml-auto md:ml-3">
          {/* Add item button */}
          <Link
            href="/item/new"
            className="hidden md:inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-md transition-colors"
            style={{ background: "var(--accent)", color: "#fff" }}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            登録
          </Link>

          {/* Auth */}
          {isPending ? (
            <div className="w-7 h-7 rounded-full animate-pulse" style={{ background: "var(--bg-elevated)" }} />
          ) : session ? (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center rounded-full transition-colors"
                style={{ padding: "2px" }}
              >
                {session.user.image ? (
                  <img src={session.user.image} alt="" className="w-7 h-7 rounded-full object-cover" />
                ) : (
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-[0.65rem] font-bold"
                    style={{ background: "var(--accent)", color: "#fff" }}>
                    {session.user.name?.[0]?.toUpperCase() || "?"}
                  </div>
                )}
              </button>

              {showMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                  <div className="absolute right-0 top-full mt-1.5 w-44 rounded-lg border shadow-2xl z-50 py-1"
                    style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
                    <div className="px-3 py-2 border-b" style={{ borderColor: "var(--border)" }}>
                      <div className="text-xs font-bold truncate" style={{ color: "var(--text-primary)" }}>{session.user.name}</div>
                      <div className="text-[0.6rem] truncate" style={{ color: "var(--text-dim)" }}>{session.user.email}</div>
                    </div>
                    <div className="py-0.5">
                      <MenuLink href="/collection" onClick={() => setShowMenu(false)}>マイコレクション</MenuLink>
                      <MenuLink href="/notifications" onClick={() => setShowMenu(false)}>通知</MenuLink>
                      <MenuLink href="/timeline" onClick={() => setShowMenu(false)}>タイムライン</MenuLink>
                      <MenuLink href="/item/new" onClick={() => setShowMenu(false)}>アイテム登録</MenuLink>
                      <MenuLink href="/settings" onClick={() => setShowMenu(false)}>設定</MenuLink>
                    </div>
                    <div className="border-t py-0.5" style={{ borderColor: "var(--border)" }}>
                      <button
                        onClick={async () => {
                          await signOut();
                          setShowMenu(false);
                          router.refresh();
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs transition-colors hover:bg-white/[0.03]"
                        style={{ color: "#ef4444" }}
                      >
                        ログアウト
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link href="/signin" className="text-xs font-bold px-3 py-1.5 rounded-md transition-colors"
              style={{ background: "var(--accent)", color: "#fff" }}>
              ログイン
            </Link>
          )}

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-1"
            onClick={() => setShowMobileNav(!showMobileNav)}
          >
            <svg className="w-5 h-5" style={{ color: "var(--text-secondary)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {showMobileNav ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {showMobileNav && (
        <div className="md:hidden border-t px-4 py-3 space-y-2" style={{ borderColor: "var(--border)", background: "var(--bg-secondary)" }}>
          <form onSubmit={(e) => { handleSearch(e); setShowMobileNav(false); }}>
            <div className="search-bar flex items-center w-full px-2.5 py-2 gap-2">
              <svg className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--text-dim)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="検索..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-zinc-600"
                style={{ color: "var(--text-primary)" }}
              />
            </div>
          </form>
          <MobileNavLink href="/lottery" onClick={() => setShowMobileNav(false)}>一番くじ</MobileNavLink>
          <MobileNavLink href="/search" onClick={() => setShowMobileNav(false)}>アイテム検索</MobileNavLink>
          <MobileNavLink href="/item/new" onClick={() => setShowMobileNav(false)}>アイテム登録</MobileNavLink>
          {session && <MobileNavLink href="/timeline" onClick={() => setShowMobileNav(false)}>タイムライン</MobileNavLink>}
          {session && <MobileNavLink href="/notifications" onClick={() => setShowMobileNav(false)}>通知</MobileNavLink>}
        </div>
      )}
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-xs px-2.5 py-1 rounded-md transition-colors"
      style={{ color: "var(--text-muted)" }}
      onMouseEnter={(e) => { e.currentTarget.style.color = "var(--text-primary)"; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.background = "transparent"; }}
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
      className="block px-3 py-1.5 text-xs transition-colors hover:bg-white/[0.03]"
      style={{ color: "var(--text-secondary)" }}
    >
      {children}
    </Link>
  );
}

function MobileNavLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block py-2 text-sm font-medium"
      style={{ color: "var(--text-secondary)" }}
    >
      {children}
    </Link>
  );
}
