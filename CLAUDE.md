# Hobipedia - The Hobby Collector Wiki

## Overview
Hobipedia is a community-driven database for anime/hobby goods pricing and collection tracking.
Think "Discogs for anime goods" - starting with Ichiban Kuji (一番くじ) as the first category.

## Tech Stack
- **Framework**: Next.js 16 (App Router, Server Components, Server Actions, Turbopack)
- **Language**: TypeScript
- **ORM**: Prisma 7 + PostgreSQL (Supabase) — adapter pattern required
- **Auth**: NextAuth.js v4 (Google + Twitter providers)
- **Styling**: Tailwind CSS v4 (dark theme, CSS custom properties)
- **Deployment**: Vercel (planned)
- **Image Storage**: Cloudflare R2 (planned)

## Prisma 7 Notes (IMPORTANT)
- No `url` in `datasource` block — connection via `prisma.config.ts`
- ESM-only generated client at `src/generated/prisma/`
- Requires `@prisma/adapter-pg` + `pg` for PostgreSQL
- Import: `import { PrismaClient } from "@/generated/prisma/client.ts"`
- Seed via raw SQL: `npx prisma db execute --file prisma/seed.sql` (tsx OOM workaround)

## Architecture Principles
1. **Japanese-first**: All UI defaults to Japanese
2. **Server Components by default**: Only use "use client" when interactivity is needed
3. **Server Actions for mutations**: No separate API routes for CRUD
4. **Wiki-style editing**: All users can contribute/edit, edits tracked in ItemEdit table
5. **Single-player value first**: Collection tracking works without community

## Domain Model (Ichiban Kuji)
```
Lottery (ロット) → Prize (賞) → Item (個別商品)
                                    ↓
                              PriceReport (相場データ)
                              CollectionItem (コレクション)
                              Comment (コメント)
```

## Design System
- **Theme**: Dark (#0c0f1a base, #7c5cfc accent)
- **References**: Discogs (data tables), MFC (cards), PriceCharting (price stats), ichiban-kuji.com (badge hierarchy)
- **Badge colors**: A賞=red, B賞=orange, C賞=yellow, D賞=green, E賞=blue, ラストワン=gold
- **CSS vars**: --bg-primary, --bg-card, --bg-elevated, --accent, --accent-muted
- **Components**: .card, .btn-primary, .btn-outline, .data-table, .search-bar, .series-tag

## Key Files
```
src/
  app/
    page.tsx              # Home (stats, recent items)
    lottery/page.tsx      # 一番くじ一覧
    lottery/[slug]/page.tsx  # ロット詳細
    item/[slug]/page.tsx  # アイテム詳細 (price stats, history table)
    globals.css           # Design system (CSS custom properties)
  components/
    layout/header.tsx     # "use client" header with search bar
  lib/
    prisma.ts             # Prisma client (PrismaPg adapter)
    utils.ts              # formatPrice, formatDate, slugify, cn
  generated/prisma/       # Prisma generated client (gitignored)
prisma/
  schema.prisma           # Data model
  prisma.config.ts        # Prisma 7 config (connection URL)
  seed.sql                # SQL seed data (3 lotteries, 14 items, 26 price reports)
```

## Commands
- `npm run dev` — Start dev server (Turbopack)
- `npx prisma migrate dev` — Run migrations
- `npx prisma generate` — Generate client
- `npx prisma db execute --file prisma/seed.sql` — Seed data
- `npx prisma studio` — Open Prisma Studio
