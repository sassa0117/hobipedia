# Hobipedia - ホビーグッズのWikipedia

## Overview
ホビー・おもちゃ・アニメグッズの Wikipedia。誰でも商品を登録・編集でき、相場情報やコレクションをコミュニティで共有するプラットフォーム。

## Tech Stack
- **Framework**: Next.js 16 (App Router, Server Components, Server Actions, Turbopack)
- **Language**: TypeScript
- **ORM**: Prisma 7 + PostgreSQL (Neon, ap-southeast-1)
- **Auth**: Better Auth (Google + Twitter/X OAuth)
- **Styling**: Tailwind CSS v4 (dark theme, CSS custom properties)
- **Deployment**: Vercel (https://hobipedia.vercel.app)
- **Image Storage**: Vercel Blob (planned) → Cloudflare R2 (scale時)

## Prisma 7 Notes (IMPORTANT)
- No `url` in `datasource` block — connection via `prisma.config.ts`
- ESM-only generated client at `src/generated/prisma/`
- Requires `@prisma/adapter-pg` + `pg` for PostgreSQL
- Import: `import { PrismaClient } from "@/generated/prisma/client.ts"`
- Seed: `npx prisma db execute --file prisma/seed.sql`
- Clean + re-seed: `npx prisma db execute --file prisma/clean.sql && npx prisma db execute --file prisma/seed.sql`

## Architecture Principles
1. **Japanese-first**: All UI defaults to Japanese
2. **Server Components by default**: Only use "use client" when interactivity is needed
3. **Server Actions for mutations** + API Routes for future Expo app
4. **Wiki-style editing**: All users can create/edit items, revisions tracked in ItemRevision (JSON snapshot)
5. **Service layer**: Business logic in `src/lib/services/`, called by both Server Actions and API Routes
6. **App化を見据える**: API Routes (`/api/`) を整備。将来 Expo (React Native) からも叩ける設計

## Domain Model
```
Series (作品) ─┬─ Lottery (一番くじロット) → Prize (賞) ─┐
               └─ Item (商品、一番くじ以外も直接登録可)  ←┘
                    ↓
              PriceReport (相場: SOLD/LISTING/STORE_FIND/WANT_TO_BUY/WANT_TO_SELL)
              CollectionItem (コレクション: OWNED/WANTED/FOR_SALE/SOLD + 非公開設定)
              Comment (コメント、返信対応)
              ItemRevision (Wiki編集履歴、JSONスナップショット)
              Like (いいね)

User ← Follow (フォロー/フォロワー)
     ← Activity (タイムライン)
     ← Notification (通知)
```

## Auth (Better Auth)
- Server: `src/lib/auth.ts` → `betterAuth({ database: prismaAdapter(...) })`
- Client: `src/lib/auth-client.ts` → `createAuthClient()` with `useSession`, `signIn`, `signOut`
- API route: `src/app/api/auth/[...all]/route.ts`
- Session取得 (Server): `auth.api.getSession({ headers: await headers() })`
- Helper: `src/lib/services/auth-helpers.ts` → `getSessionUser()`, `requireSessionUser()`
- Google callback: `/api/auth/callback/google`
- Twitter callback: `/api/auth/callback/twitter`

## Design System
- **Theme**: Dark (#0c0f1a base, #7c5cfc accent)
- **Badge colors**: A賞=red, B賞=orange, C賞=yellow, D賞=green, E賞=blue, ラストワン=gold
- **CSS vars**: --bg-primary, --bg-card, --bg-elevated, --accent, --accent-muted
- **Components**: .card, .btn-primary, .btn-outline, .data-table, .search-bar, .series-tag

## Key Files
```
src/
  app/
    page.tsx                 # Home (stats, recent items)
    actions.ts               # Server Actions (reportPrice, addToCollection, createItem, updateItem, addComment)
    signin/page.tsx          # ログインページ (Google + Twitter)
    item/new/page.tsx        # 商品新規登録 (Wiki)
    item/[slug]/page.tsx     # アイテム詳細 (price stats, history, comments)
    lottery/page.tsx         # 一番くじ一覧
    lottery/[slug]/page.tsx  # ロット詳細
    collection/page.tsx      # コレクション
    ranking/page.tsx         # ランキング
    search/page.tsx          # 検索
    api/auth/[...all]/route.ts  # Better Auth
    globals.css              # Design system
  components/
    layout/header.tsx        # Auth-aware header (session, user menu)
    item/price-report-form.tsx
    item/collection-button.tsx
    ui/placeholders.tsx
  lib/
    auth.ts                  # Better Auth server config
    auth-client.ts           # Better Auth client (useSession, signIn, signOut)
    prisma.ts                # Prisma client (PrismaPg adapter)
    utils.ts                 # formatPrice, formatDate, slugify, cn
    services/
      auth-helpers.ts        # getSessionUser, requireSessionUser
prisma/
  schema.prisma              # Full data model (auth + catalog + social)
  prisma.config.ts           # Connection URL from env
  seed.sql                   # Seed data (3 series, 3 lotteries, 14 items, 27 price reports)
  clean.sql                  # Truncate all tables
```

## Env Vars
- `DATABASE_URL` — Neon PostgreSQL connection string
- `BETTER_AUTH_SECRET` — Auth secret key
- `BETTER_AUTH_URL` — Base URL (http://localhost:3000 or production URL)
- `NEXT_PUBLIC_APP_URL` — Public app URL
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — Google OAuth
- `TWITTER_CLIENT_ID` / `TWITTER_CLIENT_SECRET` — Twitter/X OAuth

## Phase Plan
- **Phase 1 (current)**: Auth + Wiki + Schema redesign ← DONE
- **Phase 2**: 相場強化 (PriceType UI, chart), コレクション強化 (非公開, 売りたい/買いたい価格), 画像アップロード
- **Phase 3**: 交流機能 (Follow, Timeline, Like, Comment投稿, Notification), REST API整備
- **Phase 4**: Expo (React Native) ネイティブアプリ化

## Commands
- `npm run dev` — Start dev server (Turbopack)
- `npx prisma db push` — Push schema to DB (development)
- `npx prisma generate` — Generate client
- `npx prisma db execute --file prisma/seed.sql` — Seed data
- `npx prisma studio` — Open Prisma Studio
