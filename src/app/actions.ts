"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// ===== Price Report =====

export async function reportPrice(formData: FormData) {
  const itemId = formData.get("itemId") as string;
  const priceStr = formData.get("price") as string;
  const source = formData.get("source") as string;
  const condition = formData.get("condition") as string | null;
  const sourceUrl = formData.get("sourceUrl") as string | null;

  if (!itemId || !priceStr || !source) {
    return { error: "必須項目を入力してください" };
  }

  const price = parseInt(priceStr, 10);
  if (isNaN(price) || price <= 0) {
    return { error: "有効な価格を入力してください" };
  }

  const item = await prisma.item.findUnique({ where: { id: itemId } });
  if (!item) {
    return { error: "アイテムが見つかりません" };
  }

  await prisma.priceReport.create({
    data: {
      itemId,
      price,
      source: source as "MERCARI" | "YAHOO_AUCTION" | "YAHOO_FREEMARKET" | "SURUGAYA" | "MANDARAKE" | "LASHINBAN" | "AMAZON" | "USER_REPORT" | "OTHER",
      condition: condition || null,
      sourceUrl: sourceUrl || null,
    },
  });

  revalidatePath(`/item/${item.slug}`);
  return { success: true };
}

// ===== Collection =====

export async function addToCollection(formData: FormData) {
  const itemId = formData.get("itemId") as string;
  const status = (formData.get("status") as string) || "OWNED";

  if (!itemId) {
    return { error: "アイテムIDが必要です" };
  }

  // For now, without auth, we'll create a demo user or skip
  // TODO: Replace with actual auth user
  let user = await prisma.user.findFirst({ where: { email: "demo@hobipedia.com" } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: "demo@hobipedia.com",
        name: "デモユーザー",
        displayName: "デモユーザー",
      },
    });
  }

  const existing = await prisma.collectionItem.findUnique({
    where: { userId_itemId: { userId: user.id, itemId } },
  });

  if (existing) {
    await prisma.collectionItem.update({
      where: { id: existing.id },
      data: { status: status as "OWNED" | "WANTED" | "FOR_SALE" | "SOLD" },
    });
  } else {
    await prisma.collectionItem.create({
      data: {
        userId: user.id,
        itemId,
        status: status as "OWNED" | "WANTED" | "FOR_SALE" | "SOLD",
      },
    });
  }

  const item = await prisma.item.findUnique({ where: { id: itemId } });
  if (item) revalidatePath(`/item/${item.slug}`);
  return { success: true };
}
