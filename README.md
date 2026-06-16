# VOLTRA — Full-stack brand site

A fictional energy-drink brand site, built as a complete consumer + commerce + admin platform.

**Live demo:** [voltra-gold.vercel.app](https://voltra-gold.vercel.app) — deployed on Vercel, Postgres on Neon, seeded with the demo data described below.

> **Disclaimer.** VOLTRA is a fictional brand. Any resemblance to real energy-drink brands is intentional only in genre (motorsport / esports sponsorships) — none of the trademarks, taglines, or product lines belong to a real company. Built as a portfolio piece.

**Stack.** Next.js 16 (App Router · Turbopack) · React 19 · Prisma 6 + Postgres · Auth.js v5 · Stripe Checkout · Tailwind v4 · TypeScript

---

## What's in here

A single Next.js codebase that wires up nine real-world systems end-to-end:

| Surface | What it does |
|---|---|
| **Landing page** | Hero, animated marquees, region-aware product lineup, sponsored-athlete grid, live-stream embed, event countdowns. Six locales. |
| **i18n** | `app/[lang]/` routing, IP/`Accept-Language` detection in `proxy.ts`, dictionary-driven copy in EN / ES / DE / FR / JA / PT. |
| **Auth** | Email/password + Google / Discord / Facebook OAuth (Auth.js v5 with the Prisma adapter). Role-based gating in [`lib/dal.ts`](lib/dal.ts). |
| **Admin CMS** | Auth-gated `/admin` console for athletes, products, videos, articles, events, streams, merch, rewards, promo codes, orders, users, reviews, comments, reports. All CRUD via Server Actions. |
| **Search** | Server-side full-text + faceted search across products / athletes / articles / videos. JSON endpoint at `/api/search`. |
| **Loyalty** | Cryptographically-random promo-code generator (10k codes per batch, CSV export), rewards marketplace, tier system (ROOKIE / SURGE / APEX) with auto-promotion. |
| **E-commerce** | Cookie-based cart, Stripe Checkout with webhook reconciliation, atomic inventory holds (stock − reserved) to prevent oversell during drops. |
| **Streaming** | Twitch / YouTube / Kick polling with 60s cache, live indicator + inline embed on the homepage. Graceful fallback when API keys are missing. |
| **Analytics** | Server-side pageview logging + click-event tracking (`POST /api/track`). `/admin/analytics` dashboard with timeline, region demand, top athletes / products / articles, flavor clicks, and store-locator search heatmap. |
| **Community** | Reviews on products + athletes (5-star), threaded comments on articles, content-report flow, admin moderation queues with auto-moderator. |

---

## Live deployment

The production site runs on Vercel with a managed Neon Postgres database.

- **URL:** [voltra-gold.vercel.app](https://voltra-gold.vercel.app)
- **Hosting:** Vercel — Next.js runtime, serverless functions, global edge
- **Database:** Neon Postgres — pooled connection (`-pooler` host) for the serverless runtime, direct endpoint for schema operations
- **Build:** Vercel runs `npm install` (which triggers `postinstall: prisma generate`) followed by `next build`

**Seeded accounts on the live site:**

| Email | Password | Role |
|---|---|---|
| `admin@voltra.local` | `VoltMode!2026` | ADMIN — full `/admin` access |
| `rider@voltra.local` | `RiderVoltRider!` | USER — demo customer (EU, SURGE tier, 350 volts) |

Promo codes you can redeem at [`/en/redeem`](https://voltra-gold.vercel.app/en/redeem): `VOLT-2026` · `RUN-IT` · `ANAHEIM-A1` · `ZEDD-VIP`.

---

## Local development

The Prisma schema targets **Postgres** (matches production). The simplest local setup is a free Neon branch — same connection-string format as production, pointed at a separate `dev` branch — or a local Postgres via Docker.

```bash
# 1. Install deps
npm install

# 2. Copy env template and fill in DATABASE_URL + AUTH_SECRET
cp .env.example .env.local
#   DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
#   AUTH_SECRET="$(openssl rand -base64 32)"

# 3. Push the schema + run the seed
npm run db:push
npm run db:seed

# 4. Run dev (Turbopack)
npm run dev    # http://localhost:3000
```

### Useful scripts

```
npm run dev          # Turbopack dev server
npm run build        # production build
npm run lint
npm run db:push      # sync schema → Postgres (no migration files; mirrors `prisma db push`)
npm run db:seed      # idempotent seed (skips already-populated tables)
npm run db:studio    # open Prisma Studio
npm run db:reset     # ⚠ wipes + reseeds
```

---

## Environment variables

The app degrades gracefully when optional integrations aren't configured. Required for any environment: `DATABASE_URL` and `AUTH_SECRET`.

| Var | Required | Effect when missing |
|---|---|---|
| `DATABASE_URL` | ✅ | Nothing works — Prisma needs a Postgres connection string. |
| `AUTH_SECRET` | ✅ | Auth.js refuses to run in production. Generate with `openssl rand -base64 32`. |
| `AUTH_TRUST_HOST` | ✅ on Vercel | Set to `true` so Auth.js trusts the Vercel-managed host. |
| `NEXT_PUBLIC_SITE_URL` | optional | Falls back to request origin. Set explicitly to bake canonical URLs at build time. |
| `STRIPE_SECRET_KEY` | optional | Cart checkout runs in "demo mode" — orders are auto-marked PAID without a real charge. |
| `STRIPE_WEBHOOK_SECRET` | optional | Webhook endpoint returns 503. Demo mode doesn't need it. |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | optional | Google button hidden from `/login`. |
| `AUTH_DISCORD_ID` / `AUTH_DISCORD_SECRET` | optional | Discord button hidden. |
| `AUTH_FACEBOOK_ID` / `AUTH_FACEBOOK_SECRET` | optional | Facebook button hidden. |
| `TWITCH_CLIENT_ID` / `TWITCH_CLIENT_SECRET` | optional | Twitch channels show as offline. |
| `YOUTUBE_API_KEY` | optional | YouTube channels show as offline. Kick works without any key. |
| `ADMIN_EMAIL` | optional | First signup with this email is auto-promoted to ADMIN. |

To get real Stripe working: grab test keys from [the Stripe dashboard](https://dashboard.stripe.com/test/apikeys) and use card `4242 4242 4242 4242` in checkout.

---

## Deploying your own copy

```bash
# 1. Install Vercel CLI (or use npx)
npm i -g vercel

# 2. From the project root
vercel link                                 # create or link a Vercel project
vercel env add DATABASE_URL production      # paste your Neon pooled connection string
vercel env add AUTH_SECRET production       # paste `openssl rand -base64 32`
vercel env add AUTH_TRUST_HOST production   # value: true

# 3. Deploy
vercel --prod
```

**One-time: push schema + seed against Neon** (run locally with the **direct**, non-pooled endpoint — strip `-pooler` from the host):

```bash
DATABASE_URL="postgresql://user:pass@HOST.neon.tech/neondb?sslmode=require" \
  npx prisma db push

DATABASE_URL="postgresql://user:pass@HOST.neon.tech/neondb?sslmode=require" \
  npx tsx prisma/seed.ts
```

Why two URLs? Prisma's `db push` and migrations use session-level advisory locks, which Neon's PgBouncer pooler (transaction-mode) can't hold. Use the **direct** endpoint for schema operations and the **pooled** endpoint for the app at runtime.

After the first deploy, register your Stripe webhook at `https://<your-domain>/api/webhooks/stripe` and set OAuth redirect URIs to `https://<your-domain>/api/auth/callback/<provider>` in each provider's console.

---

## Architecture notes

**Routing.** `proxy.ts` (Next 16's renamed middleware) detects locale from cookie → `x-vercel-ip-country` / `cf-ipcountry` → `Accept-Language`, then redirects unprefixed URLs into `/[lang]/…`. Admin routes are locale-agnostic.

**Auth.** Auth.js v5 with the Prisma adapter and JWT session strategy. Role (`USER` / `EDITOR` / `ADMIN`), region, locale, and tier are stamped onto the JWT on first login; refreshed from DB when the JWT updates. Pages enforce auth via `requireAuth` / `requireRole` helpers in [`lib/dal.ts`](lib/dal.ts).

**Inventory.** Merch products track both `stock` (committed) and `reserved` (held by in-flight checkouts). The checkout API atomically increments `reserved` with `updateMany` + a stock guard (`stock: { gte: quantity }`), then either commits on the Stripe webhook (decrement both) or releases on cancel/expire. Demo mode commits inline.

**Promo codes.** [`lib/promo-codes.ts`](lib/promo-codes.ts) uses `crypto.randomBytes` against a 31-character Crockford-style alphabet (no `I L O U` — unambiguous when typed off a can). Bulk insert chunks of 500; collisions retry transparently. CSV export at [`/api/admin/promo-codes/export`](app/api/admin/promo-codes/export/route.ts).

**Analytics.** [`lib/analytics.ts`](lib/analytics.ts) exposes `trackPageView` (server-side, fire-and-forget from page components) and `trackEvent` (client-side via [`POST /api/track`](app/api/track/route.ts)). Both auto-attach a `voltra.sid` cookie for session uniqueness without auth. The analytics dashboard ([`/admin/analytics`](app/admin/analytics/page.tsx)) uses CSS-only bar charts driven by Prisma `groupBy` queries — no charting library. The pageview timeline uses a Postgres raw query (`to_char` for day bucketing) since `groupBy` can't bucket by date.

**Streaming.** [`lib/streams.ts`](lib/streams.ts) polls per-channel with a 60s `lastChecked` cache. Twitch uses an app-token flow (cached for `expires_in - 60s`); YouTube uses the Data API v3 live-events search; Kick uses the public v2 API (no auth). Live embeds use each platform's official player URL.

---

## What's stubbed (and where to look)

This is a portfolio build — some things are deliberately scoped down:

- **Image upload** in admin takes URLs only; no file uploader.
- **Email sending** is not wired (newsletter signup just flips a DB flag).
- **No password reset** flow yet.
- **No tests.**
- **Cart doesn't merge** anonymous → user on sign-in.
- **Multi-language content** — product / athlete descriptions are English-only. UI strings are fully translated.

These are good follow-up exercises and are documented in commit history.
