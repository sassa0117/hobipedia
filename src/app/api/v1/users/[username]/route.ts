import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET /api/v1/users/:username
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;

  const user = await prisma.user.findFirst({
    where: { username },
    select: {
      id: true,
      name: true,
      username: true,
      displayName: true,
      bio: true,
      image: true,
      coverImageUrl: true,
      twitterHandle: true,
      website: true,
      isProfilePublic: true,
      createdAt: true,
      _count: {
        select: {
          followers: true,
          following: true,
          collections: true,
          createdItems: true,
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(user);
}
