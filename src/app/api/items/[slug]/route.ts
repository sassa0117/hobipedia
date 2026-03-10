import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const item = await prisma.item.findUnique({
    where: { slug },
    include: {
      series: { select: { name: true } },
    },
  });

  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: item.id,
    name: item.name,
    category: item.category,
    character: item.character,
    series: item.series,
    maker: item.maker,
    jan: item.jan,
    description: item.description,
  });
}
