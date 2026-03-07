import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">📚</span>
          <span className="text-xl font-black text-blue-800 tracking-tight">
            Hobipedia
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
          <Link href="/lottery" className="hover:text-blue-700 transition-colors">
            一番くじ
          </Link>
          <Link href="/ranking" className="hover:text-blue-700 transition-colors">
            相場ランキング
          </Link>
          <Link href="/collection" className="hover:text-blue-700 transition-colors">
            マイコレクション
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/auth/signin"
            className="text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-lg transition-colors"
          >
            ログイン
          </Link>
        </div>
      </div>
    </header>
  );
}
