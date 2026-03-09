import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "./prisma";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    twitter: {
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30日
    updateAge: 60 * 60 * 24, // 1日ごとにセッション更新
  },
  user: {
    additionalFields: {
      username: { type: "string", required: false },
      displayName: { type: "string", required: false },
      bio: { type: "string", required: false },
      coverImageUrl: { type: "string", required: false },
      twitterHandle: { type: "string", required: false },
      website: { type: "string", required: false },
      isProfilePublic: { type: "boolean", defaultValue: true },
      locale: { type: "string", defaultValue: "ja" },
      role: { type: "string", defaultValue: "USER" },
    },
  },
  plugins: [nextCookies()],
});
