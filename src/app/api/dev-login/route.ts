import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";

/**
 * テストログイン: OAuth不要でテストユーザーにログインできる。
 * OAuth設定完了後に削除 or 制限をかける。
 */
export async function POST() {
  // テストユーザーを取得 or 作成
  const email = "dev@hobipedia.local";
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        name: "テスト管理者",
        email,
        emailVerified: true,
        username: "dev-admin",
        displayName: "テスト管理者",
        bio: "開発用テストアカウント",
        role: "ADMIN",
      },
    });
    // Better Auth 用の Account レコード
    await prisma.account.create({
      data: {
        userId: user.id,
        accountId: user.id,
        providerId: "credential",
      },
    });
  }

  // セッションを作成
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30日

  await prisma.session.create({
    data: {
      userId: user.id,
      token,
      expiresAt,
    },
  });

  // Better Auth のセッションcookie名
  const cookieName = "better-auth.session_token";

  const response = NextResponse.json({
    ok: true,
    user: { id: user.id, name: user.name, email: user.email, username: user.username },
  });

  response.cookies.set(cookieName, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });

  return response;
}
