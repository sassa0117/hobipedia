import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/services/auth-helpers";
import { prisma } from "@/lib/prisma";

// POST: File upload via Vercel Blob
export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "ファイルアップロード未対応。URL入力をお使いください。" },
      { status: 501 }
    );
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const itemId = formData.get("itemId") as string | null;

  if (!file || !itemId) {
    return NextResponse.json({ error: "ファイルとアイテムIDが必要です" }, { status: 400 });
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: "JPEG, PNG, WebP, GIF のみ対応" }, { status: 400 });
  }

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "ファイルサイズは5MB以下にしてください" }, { status: 400 });
  }

  const item = await prisma.item.findUnique({ where: { id: itemId } });
  if (!item) {
    return NextResponse.json({ error: "アイテムが見つかりません" }, { status: 404 });
  }

  try {
    const { put } = await import("@vercel/blob");
    const ext = file.name.split(".").pop() || "jpg";
    const filename = `items/${itemId}/${Date.now()}.${ext}`;

    const blob = await put(filename, file, {
      access: "public",
      addRandomSuffix: false,
    });

    await prisma.item.update({
      where: { id: itemId },
      data: { imageUrl: blob.url },
    });

    return NextResponse.json({ url: blob.url });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "アップロードに失敗しました" }, { status: 500 });
  }
}

// PUT: Set image URL directly (fallback when Blob is not configured)
export async function PUT(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  const body = await request.json();
  const { itemId, imageUrl } = body as { itemId: string; imageUrl: string };

  if (!itemId) {
    return NextResponse.json({ error: "アイテムIDが必要です" }, { status: 400 });
  }

  const url = imageUrl?.trim() || null;

  if (url && !url.startsWith("https://") && !url.startsWith("http://")) {
    return NextResponse.json({ error: "有効なURLを入力してください" }, { status: 400 });
  }

  try {
    await prisma.item.update({
      where: { id: itemId },
      data: { imageUrl: url },
    });
    return NextResponse.json({ url });
  } catch {
    return NextResponse.json({ error: "保存に失敗しました" }, { status: 500 });
  }
}
