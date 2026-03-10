"use client";

import { useState, useRef } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export function ImageUploader({
  itemId,
  currentImageUrl,
}: {
  itemId: string;
  currentImageUrl: string | null;
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [urlInput, setUrlInput] = useState(currentImageUrl || "");

  if (!session) return null;

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploading(true);

    const fd = new FormData();
    fd.set("file", file);
    fd.set("itemId", itemId);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        // Blob not configured — fall back to URL mode
        if (res.status === 501) {
          setIsEditing(true);
          setError("ファイルアップロード未対応。画像URLを入力してください");
        } else {
          setError(data.error || "アップロードに失敗しました");
        }
      } else {
        router.refresh();
      }
    } catch {
      setError("アップロードに失敗しました");
    } finally {
      setUploading(false);
    }
  }

  async function handleUrlSave() {
    setError(null);
    setUploading(true);

    try {
      const res = await fetch("/api/upload", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, imageUrl: urlInput.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "保存に失敗しました");
      } else {
        setIsEditing(false);
        router.refresh();
      }
    } catch {
      setError("保存に失敗しました");
    } finally {
      setUploading(false);
    }
  }

  if (isEditing) {
    return (
      <div className="px-3 py-2 border-t border-white/[0.06] space-y-2">
        <input
          type="url"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          placeholder="https://example.com/image.jpg"
          className="w-full text-xs rounded-md px-2.5 py-1.5 text-white border border-white/[0.1] focus:border-[#7c5cfc] focus:outline-none transition-colors"
          style={{ background: "var(--bg-primary)" }}
        />
        <div className="flex gap-1.5">
          <button
            onClick={handleUrlSave}
            disabled={uploading || !urlInput.trim()}
            className="flex-1 text-[0.65rem] py-1 rounded bg-[#7c5cfc] text-white hover:bg-[#6d4de8] disabled:opacity-40 transition-colors"
          >
            {uploading ? "保存中..." : "保存"}
          </button>
          <button
            onClick={() => {
              setIsEditing(false);
              setUrlInput(currentImageUrl || "");
              setError(null);
            }}
            className="text-[0.65rem] px-2 py-1 rounded text-slate-400 hover:text-slate-200 transition-colors"
          >
            キャンセル
          </button>
        </div>
        {error && (
          <p className="text-[0.6rem] text-red-400 text-center">{error}</p>
        )}
      </div>
    );
  }

  return (
    <div className="px-3 py-2 border-t border-white/[0.06]">
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileUpload}
        className="hidden"
      />
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="text-[0.65rem] text-[#a78bfa] hover:text-[#c4b5fd] transition-colors disabled:opacity-50"
        >
          {uploading ? "アップロード中..." : currentImageUrl ? "画像を変更" : "画像を追加"}
        </button>
        <span className="text-slate-700 text-[0.6rem]">|</span>
        <button
          onClick={() => setIsEditing(true)}
          className="text-[0.65rem] text-slate-500 hover:text-slate-300 transition-colors"
        >
          URL入力
        </button>
      </div>
      {error && (
        <p className="text-[0.6rem] text-red-400 text-center mt-1">{error}</p>
      )}
    </div>
  );
}
