"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/services/auth-helpers";
import { slugify } from "@/lib/utils";

// ===== Price Report =====

export async function reportPrice(formData: FormData) {
  const user = await getSessionUser();

  const itemId = formData.get("itemId") as string;
  const priceStr = formData.get("price") as string;
  const source = formData.get("source") as string;
  const priceType = (formData.get("priceType") as string) || "SOLD";
  const condition = formData.get("condition") as string | null;
  const sourceUrl = formData.get("sourceUrl") as string | null;
  const storeName = formData.get("storeName") as string | null;

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
      userId: user?.id ?? null,
      price,
      priceType: priceType as "SOLD" | "LISTING" | "STORE_FIND" | "WANT_TO_BUY" | "WANT_TO_SELL",
      source: source as "MERCARI" | "YAHOO_AUCTION" | "YAHOO_FREEMARKET" | "SURUGAYA" | "MANDARAKE" | "LASHINBAN" | "AMAZON" | "RAKUTEN" | "STORE" | "USER_REPORT" | "OTHER",
      condition: condition || null,
      sourceUrl: sourceUrl || null,
      storeName: storeName || null,
    },
  });

  revalidatePath(`/item/${item.slug}`);
  return { success: true };
}

// ===== Collection =====

export async function addToCollection(formData: FormData) {
  const user = await getSessionUser();
  if (!user) {
    return { error: "ログインが必要です" };
  }

  const itemId = formData.get("itemId") as string;
  const status = (formData.get("status") as string) || "OWNED";
  const isPublicStr = formData.get("isPublic");
  const isPublic = isPublicStr !== "false";
  const sellPriceStr = formData.get("sellPrice") as string | null;
  const buyPriceStr = formData.get("buyPrice") as string | null;

  if (!itemId) {
    return { error: "アイテムIDが必要です" };
  }

  const existing = await prisma.collectionItem.findUnique({
    where: { userId_itemId: { userId: user.id, itemId } },
  });

  const data = {
    status: status as "OWNED" | "WANTED" | "FOR_SALE" | "SOLD",
    isPublic,
    sellPrice: sellPriceStr ? parseInt(sellPriceStr, 10) : null,
    buyPrice: buyPriceStr ? parseInt(buyPriceStr, 10) : null,
  };

  if (existing) {
    await prisma.collectionItem.update({
      where: { id: existing.id },
      data,
    });
  } else {
    await prisma.collectionItem.create({
      data: {
        userId: user.id,
        itemId,
        ...data,
      },
    });
  }

  const item = await prisma.item.findUnique({ where: { id: itemId } });
  if (item) revalidatePath(`/item/${item.slug}`);
  return { success: true };
}

// ===== Wiki: Create Item =====

export async function createItem(formData: FormData) {
  const user = await getSessionUser();
  if (!user) {
    return { error: "ログインが必要です" };
  }

  const name = (formData.get("name") as string)?.trim();
  const category = (formData.get("category") as string) || "OTHER";
  const character = (formData.get("character") as string)?.trim() || null;
  const seriesName = (formData.get("series") as string)?.trim() || null;
  const maker = (formData.get("maker") as string)?.trim() || null;
  const jan = (formData.get("jan") as string)?.trim() || null;
  const description = (formData.get("description") as string)?.trim() || null;

  if (!name) {
    return { error: "商品名は必須です" };
  }

  // Find or create series
  let seriesId: string | null = null;
  if (seriesName) {
    let series = await prisma.series.findFirst({
      where: { name: { equals: seriesName, mode: "insensitive" } },
    });
    if (!series) {
      series = await prisma.series.create({
        data: {
          name: seriesName,
          slug: slugify(seriesName),
        },
      });
    }
    seriesId = series.id;
  }

  const slug = slugify(name);

  // Check for duplicate slug
  const existing = await prisma.item.findUnique({ where: { slug } });
  if (existing) {
    return { error: "同じ名前の商品が既に登録されています" };
  }

  const item = await prisma.item.create({
    data: {
      name,
      slug,
      category: category as "ICHIBAN_KUJI" | "FIGURE" | "SCALE_FIGURE" | "PRIZE_FIGURE" | "NENDOROID" | "ACSTA" | "CAN_BADGE" | "PLUSH" | "TRADING_CARD" | "RUBBER_STRAP" | "TAPESTRY" | "CLEAR_FILE" | "TOWEL" | "OTHER",
      character,
      seriesId,
      maker,
      jan,
      description,
      createdById: user.id,
    },
  });

  // Save initial revision
  await prisma.itemRevision.create({
    data: {
      itemId: item.id,
      userId: user.id,
      snapshot: { name, category, character, seriesName, maker, jan, description },
      summary: "商品を新規登録",
    },
  });

  revalidatePath("/");
  return { success: true, slug: item.slug };
}

// ===== Wiki: Edit Item =====

export async function updateItem(formData: FormData) {
  const user = await getSessionUser();
  if (!user) {
    return { error: "ログインが必要です" };
  }

  const itemId = formData.get("itemId") as string;
  const name = (formData.get("name") as string)?.trim();
  const category = (formData.get("category") as string) || "OTHER";
  const character = (formData.get("character") as string)?.trim() || null;
  const seriesName = (formData.get("series") as string)?.trim() || null;
  const maker = (formData.get("maker") as string)?.trim() || null;
  const jan = (formData.get("jan") as string)?.trim() || null;
  const description = (formData.get("description") as string)?.trim() || null;
  const summary = (formData.get("summary") as string)?.trim() || "情報を更新";

  if (!itemId || !name) {
    return { error: "必須項目が不足しています" };
  }

  const item = await prisma.item.findUnique({ where: { id: itemId } });
  if (!item) {
    return { error: "アイテムが見つかりません" };
  }

  // Find or create series
  let seriesId: string | null = null;
  if (seriesName) {
    let series = await prisma.series.findFirst({
      where: { name: { equals: seriesName, mode: "insensitive" } },
    });
    if (!series) {
      series = await prisma.series.create({
        data: { name: seriesName, slug: slugify(seriesName) },
      });
    }
    seriesId = series.id;
  }

  await prisma.item.update({
    where: { id: itemId },
    data: {
      name,
      category: category as "ICHIBAN_KUJI" | "FIGURE" | "SCALE_FIGURE" | "PRIZE_FIGURE" | "NENDOROID" | "ACSTA" | "CAN_BADGE" | "PLUSH" | "TRADING_CARD" | "RUBBER_STRAP" | "TAPESTRY" | "CLEAR_FILE" | "TOWEL" | "OTHER",
      character,
      seriesId,
      maker,
      jan,
      description,
    },
  });

  // Save revision
  await prisma.itemRevision.create({
    data: {
      itemId: item.id,
      userId: user.id,
      snapshot: { name, category, character, seriesName, maker, jan, description },
      summary,
    },
  });

  revalidatePath(`/item/${item.slug}`);
  return { success: true };
}

// ===== Comment =====

export async function addComment(formData: FormData) {
  const user = await getSessionUser();
  if (!user) {
    return { error: "ログインが必要です" };
  }

  const itemId = formData.get("itemId") as string;
  const body = (formData.get("body") as string)?.trim();
  const parentId = (formData.get("parentId") as string) || null;

  if (!itemId || !body) {
    return { error: "コメントを入力してください" };
  }

  await prisma.comment.create({
    data: {
      itemId,
      userId: user.id,
      body,
      parentId,
    },
  });

  const item = await prisma.item.findUnique({ where: { id: itemId } });
  if (item) revalidatePath(`/item/${item.slug}`);
  return { success: true };
}
