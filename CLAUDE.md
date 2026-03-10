# Hobipedia - ホビーグッズのWikipedia

## Overview
ホビー・おもちゃ・アニメグッズの Wikipedia。誰でも商品を登録・編集でき、相場情報やコレクションをコミュニティで共有するプラットフォーム。

## Tech Stack
- **Web**: Next.js 16 (App Router, Server Components, Server Actions, Turbopack)
- **Mobile**: Expo SDK 55 + React Native + Expo Router (mobile/)
- **Language**: TypeScript
- **ORM**: Prisma 7 + PostgreSQL (Neon, ap-southeast-1)
- **Auth**: Better Auth (Google + Twitter/X OAuth)
- **Styling**: Web=Tailwind CSS v4, Mobile=StyleSheet (共通ダークテーマ)
- **Deployment**: Web=Vercel (https://hobipedia.vercel.app), Mobile=EAS Build予定
- **Image Storage**: Vercel Blob (BLOB_READ_WRITE_TOKEN未設定時はURL入力フォールバック)

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
3. **Server Actions for mutations** + API Routes for Expo app
4. **Wiki-style editing**: All users can create/edit items, revisions tracked in ItemRevision (JSON snapshot)
5. **Service layer**: Business logic in `src/lib/services/`, called by both Server Actions and API Routes
6. **REST API v1**: `/api/v1/` endpoints for mobile app consumption
7. **Build**: `NODE_OPTIONS="--max-old-space-size=8192"` needed for build (OOM prevention)

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

## Key Files
```
src/
  app/
    page.tsx                 # Home
    actions.ts               # Server Actions (price, collection, item CRUD, follow, like, notification)
    signin/page.tsx          # ログインページ
    item/new/page.tsx        # 商品新規登録 (Wiki)
    item/[slug]/page.tsx     # アイテム詳細 (price chart, comments, likes)
    item/[slug]/edit/page.tsx # Wiki編集
    item/[slug]/history/page.tsx # 編集履歴
    timeline/page.tsx        # タイムライン
    notifications/page.tsx   # 通知
    user/[username]/page.tsx # ユーザープロフィール
    api/auth/[...all]/       # Better Auth
    api/items/[slug]/        # Item API
    api/upload/              # 画像アップロード (POST=Blob, PUT=URL)
    api/v1/items/            # REST: アイテム一覧・検索
    api/v1/users/[username]/ # REST: ユーザー情報
    api/v1/notifications/    # REST: 通知一覧
  components/
    layout/header.tsx        # Auth-aware header
    item/price-report-form.tsx  # PriceType 5種選択
    item/collection-button.tsx  # 非公開/価格設定
    item/comment-form.tsx    # コメント投稿
    item/image-uploader.tsx  # 画像アップロード/URL入力
    item/price-chart.tsx     # Recharts 価格推移グラフ
    social/like-button.tsx   # ハートいいね
    social/follow-button.tsx # フォロー/解除
    social/mark-all-read-button.tsx
  lib/
    auth.ts, auth-client.ts, prisma.ts, utils.ts
    services/auth-helpers.ts

mobile/                      # Expo React Native アプリ
  app/
    _layout.tsx              # Stack navigator
    (tabs)/_layout.tsx       # Tab navigator (5タブ)
    (tabs)/index.tsx         # ホーム (アイテム一覧)
    (tabs)/search.tsx        # 検索
    (tabs)/timeline.tsx      # タイムライン (要ログイン)
    (tabs)/notifications.tsx # 通知 (要ログイン)
    (tabs)/profile.tsx       # プロフィール (要ログイン)
    item/[slug].tsx          # アイテム詳細
  lib/
    api.ts                   # APIクライアント (dev=localhost, prod=Vercel)
    theme.ts                 # 共通ダークテーマ定数
```

## Phase Plan (ALL DONE)
- **Phase 1**: Auth + Wiki + Schema redesign ← DONE
- **Phase 2**: 相場強化 (PriceType UI, Recharts chart), コレクション強化, 画像アップロード ← DONE
- **Phase 3**: 交流機能 (Follow, Timeline, Like, Notification), REST API v1 ← DONE
- **Phase 4**: Expo React Native モバイルアプリ ← DONE (初期実装)

## Commands
### Web
- `npm run dev` — Start dev server (Turbopack)
- `NODE_OPTIONS="--max-old-space-size=8192" npx next build` — Production build
- `npx prisma db push` — Push schema to DB
- `npx prisma generate` — Generate client

### Mobile
- `cd mobile && npm start` — Start Expo dev server
- `cd mobile && npm run android` — Android emulator
- `cd mobile && npm run web` — Web preview

## Env Vars
- `DATABASE_URL` — Neon PostgreSQL
- `BETTER_AUTH_SECRET` — Auth secret
- `BETTER_AUTH_URL` / `NEXT_PUBLIC_APP_URL` — Base URLs
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — Google OAuth
- `TWITTER_CLIENT_ID` / `TWITTER_CLIENT_SECRET` — Twitter/X OAuth
- `BLOB_READ_WRITE_TOKEN` — Vercel Blob (optional, fallback to URL input)
