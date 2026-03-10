import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET /api/v1/items?q=&category=&page=1&limit=20
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const q = searchParams.get("q") || "";
  const category = searchParams.get("category");
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));

  const where: Record<string, unknown> = {};
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { character: { contains: q, mode: "insensitive" } },
    ];
  }
  if (category) {
    where.category = category;
  }

  const [items, total] = await Promise.all([
    prisma.item.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        slug: true,
        imageUrl: true,
        category: true,
        character: true,
        maker: true,
        series: { select: { name: true } },
        _count: { select: { likes: true, collections: true, priceReports: true } },
      },
    }),
    prisma.item.count({ where }),
  ]);

  return NextResponse.json({
    items,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}
