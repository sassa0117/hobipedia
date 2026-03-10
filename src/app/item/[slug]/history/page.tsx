import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default async function HistoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const item = await prisma.item.findUnique({
    where: { slug },
    include: {
      revisions: {
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true, image: true } },
        },
      },
    },
  });

  if (!item) notFound();

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <nav className="text-xs text-slate-500 mb-6">
        <Link
          href={`/item/${slug}`}
          className="hover:text-[#a78bfa] transition-colors"
        >
          {item.name}
        </Link>
        <span className="text-slate-700 mx-1.5">/</span>
        <span className="text-slate-300">編集履歴</span>
      </nav>

      <h1 className="text-xl font-black text-white mb-6">編集履歴</h1>

      {item.revisions.length === 0 ? (
        <p className="text-slate-500 text-sm">まだ編集履歴がありません。</p>
      ) : (
        <div className="space-y-3">
          {item.revisions.map((rev, i) => {
            const snapshot = rev.snapshot as Record<string, unknown> | null;
            return (
              <div key={rev.id} className="card p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-[#7c5cfc]/20 flex items-center justify-center text-xs font-bold text-[#a78bfa] shrink-0">
                      {rev.user?.name?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm text-white font-medium truncate">
                        {rev.user?.name || "不明なユーザー"}
                      </div>
                      <div className="text-xs text-slate-500">
                        {formatDate(rev.createdAt)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs text-slate-400">
                      #{item.revisions.length - i}
                    </span>
                  </div>
                </div>

                <div className="mt-3 text-sm text-slate-300">
                  {rev.summary}
                </div>

                {snapshot && (
                  <details className="mt-3">
                    <summary className="text-xs text-slate-500 cursor-pointer hover:text-slate-400 transition-colors">
                      スナップショットを表示
                    </summary>
                    <div className="mt-2 p-3 rounded-lg text-xs font-mono text-slate-400 overflow-x-auto" style={{ background: "var(--bg-primary)" }}>
                      <table className="w-full">
                        <tbody>
                          {Object.entries(snapshot).map(([key, value]) => (
                            <tr key={key} className="border-b border-white/[0.04] last:border-0">
                              <td className="py-1 pr-4 text-slate-500 whitespace-nowrap align-top">
                                {key}
                              </td>
                              <td className="py-1 text-slate-300">
                                {value === null ? (
                                  <span className="text-slate-600">—</span>
                                ) : (
                                  String(value)
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </details>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-6">
        <Link
          href={`/item/${slug}`}
          className="btn-outline text-sm px-4 py-2 inline-block"
        >
          アイテムに戻る
        </Link>
      </div>
    </div>
  );
}
