# Hobipedia - The Hobby Collector Wiki

## Overview
Hobipedia is a community-driven database for anime/hobby goods pricing and collection tracking.
Think "Discogs for anime goods" - starting with Ichiban Kuji (一番くじ) as the first category.

## Tech Stack
- **Framework**: Next.js 15 (App Router, Server Components, Server Actions)
- **Language**: TypeScript
- **ORM**: Prisma 6 + PostgreSQL (Supabase)
- **Auth**: NextAuth.js v5 (Google + Twitter providers)
- **Styling**: Tailwind CSS v4
- **i18n**: next-intl (Japanese-first, English secondary)
- **Deployment**: Vercel
- **Image Storage**: Cloudflare R2 (planned)

## Architecture Principles
1. **Japanese-first**: All UI defaults to Japanese. English is secondary via i18n
2. **Server Components by default**: Only use "use client" when interactivity is needed
3. **Server Actions for mutations**: No separate API routes for CRUD
4. **Wiki-style editing**: All users can contribute/edit, edits are tracked in ItemEdit table
5. **Single-player value first**: Collection tracking works without community (cold start strategy)

## Domain Model (Ichiban Kuji)
```
Lottery (ロット) → Prize (賞) → Item (個別商品)
                                    ↓
                              PriceReport (相場データ)
                              CollectionItem (コレクション)
                              Comment (コメント)
```

## Key Directories
```
src/
  app/
    (main)/          # Main layout group
      page.tsx        # Home
      lottery/        # 一番くじ一覧・詳細
      item/           # アイテム詳細・価格チャート
      collection/     # マイコレクション
    auth/             # 認証関連
  components/
    ui/               # 汎用UIコンポーネント
    lottery/          # ロット関連
    item/             # アイテム関連
    price/            # 価格チャート・報告
  lib/
    prisma.ts         # Prisma client singleton
    auth.ts           # NextAuth config
    utils.ts          # ユーティリティ
  generated/prisma/   # Prisma generated client
```

## Design Guidelines
- Clean, modern Japanese web design
- Color palette: Blue (#1E40AF primary), subtle grays, white backgrounds
- Card-based layouts for items/lotteries
- Price charts use green (up) / red (down)
- Mobile-first responsive design

## Commands
- `npm run dev` - Start dev server
- `npx prisma migrate dev` - Run migrations
- `npx prisma studio` - Open Prisma Studio
- `npx prisma db seed` - Seed initial data

## Environment Variables
```
DATABASE_URL=         # Supabase PostgreSQL connection string
NEXTAUTH_SECRET=      # NextAuth secret
NEXTAUTH_URL=         # http://localhost:3000 (dev)
GOOGLE_CLIENT_ID=     # Google OAuth
GOOGLE_CLIENT_SECRET=
TWITTER_CLIENT_ID=    # Twitter OAuth
TWITTER_CLIENT_SECRET=
```
