# CLAUDE.md

This file provides guidance to Claude Code (and other AI assistants) when working with this repository.

## Project Overview

**Name:** git.wrapped (working title)
**Type:** Full-stack web application
**Purpose:** A "GitHub Wrapped"-style web app that connects to a user's GitHub account, analyzes their public activity, and generates beautiful, shareable cards for social media (LinkedIn, Twitter, Instagram).

**Author:** Jonel C. Escaran ([@jonelescaran](https://github.com/jonelescaran))

### Core value proposition

Most existing GitHub stats tools focus on README-embeddable SVG widgets (numbers only). This project differentiates by:

1. Beautiful, social-media-optimized share cards (PNG download)
2. Personality-driven insights ("Night owl", "Weekend warrior") — not just raw numbers
3. Yearly recap experience — Spotify Wrapped, but for code
4. Public shareable profile pages for each user

## Tech Stack

### Frontend

- **Framework:** Next.js 16 (App Router) + TypeScript — note: this version has breaking changes from your training data; consult `node_modules/next/dist/docs/` before writing new framework code
- **Styling:** TailwindCSS
- **UI components:** shadcn/ui
- **Charts:** Recharts
- **Auth:** NextAuth.js (Auth.js v5) with GitHub provider
- **Image generation:** `@vercel/og` (Satori) for share card PNGs

### Backend

- **Framework:** NestJS + TypeScript
- **API style:** GraphQL (Apollo)
- **ORM:** Prisma
- **Database:** PostgreSQL
- **Cache:** Redis (Upstash)
- **Background jobs:** BullMQ

### External APIs

- **GitHub GraphQL API** — primary data source
- **GitHub REST API** — fallback for endpoints not in GraphQL
- **GH Archive** (optional) — for historical data without rate-limit pressure

### Infrastructure

- **Frontend hosting:** Vercel
- **Backend hosting:** Railway (or Render)
- **Database:** Vercel Postgres / Neon / Supabase
- **Cache:** Upstash Redis (free tier)
- **Monitoring:** Sentry
- **Analytics:** Vercel Analytics or Plausible

## Project Structure

The project is currently **frontend-only** — the NestJS backend in the original plan has not been built yet. All GitHub API calls are made directly from the Next.js server components / route handlers using the user's NextAuth session token. The structure below reflects what exists today; the original `apps/web` + `apps/api` monorepo layout is aspirational.

```
gitwrapped/
├── frontend/                          # Next.js 16 (App Router) app
│   ├── app/
│   │   ├── page.tsx                   # Landing page
│   │   ├── layout.tsx                 # Root layout
│   │   ├── globals.css
│   │   ├── signin/page.tsx            # Custom sign-in page
│   │   ├── dashboard/
│   │   │   ├── page.tsx               # Logged-in dashboard (server component)
│   │   │   └── share-preview.tsx      # Client component (zoom modal)
│   │   └── api/
│   │       ├── auth/[...nextauth]/    # NextAuth handler
│   │       └── og/route.tsx           # @vercel/og share-card PNGs (edge runtime)
│   ├── auth.ts                        # NextAuth config (GitHub provider)
│   ├── lib/                           # Shared, framework-agnostic code
│   │   ├── types/                     # *.types.ts — pure type declarations
│   │   ├── constants/                 # *.constants.ts — static data tables, queries, enums-as-objects
│   │   └── utils/                     # *.utils.ts — pure functions (fetchers, aggregators, parsers)
│   ├── types/                         # Ambient TS module augmentations (e.g. next-auth.d.ts)
│   └── public/
├── CLAUDE.md                          # ← you are here
└── package.json                       # Workspace root (runs frontend via concurrently)
```

### `lib/` convention

When adding shared code, pick the right folder by **what kind of value the module exports**, then suffix the filename with the folder's kind:

| Folder           | File suffix      | What goes here                                                      | Example                                                      |
| ---------------- | ---------------- | ------------------------------------------------------------------- | ------------------------------------------------------------ |
| `lib/types/`     | `*.types.ts`     | `type` / `interface` declarations only                              | `share-card.types.ts` exports `ShareCardData`                |
| `lib/constants/` | `*.constants.ts` | Frozen data, lookup tables, GraphQL query strings, enums-as-objects | `personality.constants.ts` exports the `THEMES` map          |
| `lib/utils/`     | `*.utils.ts`     | Pure functions — fetchers, parsers, aggregators, formatters         | `insights.utils.ts` exports `calcStreaks`, `aggregateByTime` |

Rules of thumb:

- **A module is named after its domain, not its kind.** Group by topic (`personality.*`, `share-card.*`, `github.*`), then split into the three folders above. Don't create `helpers/` or `services/` — `utils/` is the bucket for now.
- **Don't add `lib/hooks/`** until at least one hook is actually shared between two client components. Today the only client component is `share-preview.tsx` and its zoom state is used once.
- **Don't add UI components to `lib/`.** Reusable React components belong in a top-level `components/` folder (not yet created — add it when a second page actually consumes a component).
- **Server components / route handlers stay in `app/`.** They orchestrate; the heavy lifting (data fetching, math, type-narrowing) lives in `lib/utils/`.
- **Page-local components stay in the page file.** Promote to `components/` only when used by a second page.

### Why the OG route is fragile

`app/api/og/route.tsx` runs on the **edge runtime** and uses **Satori** (via `@vercel/og`) to render JSX → PNG. Satori has a quirk: it calls `.trim()` on every CSS value as if it were a string, so **any `undefined` style prop crashes the request** with `Cannot read properties of undefined (reading 'trim')`. TypeScript and ESLint cannot detect this — the types accept `undefined`, the runtime does not. The route uses a `prune()` helper to strip `undefined` props before handing styles to JSX. When editing this file, never write `style={{ foo: cond ? value : undefined }}` directly — either wrap the object in `prune()` or use a spread-conditional: `...(cond ? { foo: value } : null)`.

## Development Workflow

### Setup

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Required: GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, NEXTAUTH_SECRET, DATABASE_URL, REDIS_URL

# Set up database
npx prisma migrate dev
npx prisma generate

# Run dev servers
npm run dev:web   # Frontend on http://localhost:3000
npm run dev:api   # Backend on http://localhost:4000/graphql
```

### Common commands

| Command             | What it does                     |
| ------------------- | -------------------------------- |
| `npm run dev`       | Run both web and API in parallel |
| `npm run build`     | Build all apps                   |
| `npm run lint`      | Lint all code                    |
| `npm run test`      | Run unit tests (Jest)            |
| `npm run test:e2e`  | Run E2E tests (Playwright)       |
| `npx prisma studio` | Open Prisma DB GUI               |

## Architecture Notes

### Data flow

```
User → Next.js (Vercel)
         ↓ NextAuth GitHub OAuth
       Get GitHub access token
         ↓
       NestJS backend (Railway)
         ↓ Check Redis cache
       GitHub GraphQL API (rate-limited)
         ↓
       Compute insights (night owl, top languages, etc.)
         ↓
       Store in Postgres (cached for 24h per user)
         ↓
       Return to frontend → Render dashboard
         ↓
       User clicks "Share" → @vercel/og generates PNG
```

### Caching strategy

GitHub rate limits: 5,000 requests/hour per OAuth user. Strategy:

1. **First load:** Full sync from GitHub → store in Postgres + Redis (TTL 24h)
2. **Subsequent loads:** Read from Postgres directly (fast)
3. **Manual refresh:** User-triggered re-sync (rate limited to once per hour)
4. **Background sync:** BullMQ worker re-syncs active users daily

### Database schema (key models)

```prisma
model User {
  id             String   @id @default(cuid())
  githubId       String   @unique
  username       String   @unique
  email          String?
  avatarUrl      String?
  accessToken    String   // encrypted
  createdAt      DateTime @default(now())
  lastSyncedAt   DateTime?
  stats          Stats[]
  shareCards     ShareCard[]
}

model Stats {
  id                  String   @id @default(cuid())
  userId              String
  year                Int
  totalCommits        Int
  totalPRs            Int
  totalReviews        Int
  longestStreak       Int
  topLanguages        Json     // [{ name, percent }, ...]
  commitsByHour       Json     // [0..23] array of counts
  commitsByWeekday    Json     // [0..6] array
  personality         String   // "night-owl" | "early-bird" | etc.
  topRepositories     Json
  topCollaborators    Json
  createdAt           DateTime @default(now())

  user                User     @relation(fields: [userId], references: [id])
  @@unique([userId, year])
}

model ShareCard {
  id        String   @id @default(cuid())
  userId    String
  format    String   // "square" | "story" | "banner"
  imageUrl  String
  createdAt DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id])
}
```

## GitHub API Notes

### Required OAuth scopes

- `read:user` — basic profile
- `repo` — to access private contribution counts (optional, only if user opts in)

### Key GraphQL queries

```graphql
query UserContributions($username: String!, $from: DateTime!, $to: DateTime!) {
  user(login: $username) {
    contributionsCollection(from: $from, to: $to) {
      totalCommitContributions
      totalPullRequestContributions
      totalPullRequestReviewContributions
      totalIssueContributions
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            date
            contributionCount
            weekday
          }
        }
      }
      commitContributionsByRepository(maxRepositories: 25) {
        repository {
          name
          url
        }
        contributions {
          totalCount
        }
      }
    }
    repositoriesContributedTo(first: 100) {
      nodes {
        name
        primaryLanguage {
          name
        }
      }
    }
  }
}
```

### Rate limit handling

- Always check `X-RateLimit-Remaining` header
- If close to limit, defer to background job
- Cache aggressively in Redis

## Insight Generation Logic

### Personality detection

```ts
function detectPersonality(commitsByHour: number[]): string {
  const total = commitsByHour.reduce((a, b) => a + b, 0);
  const nightCommits = commitsByHour
    .slice(21, 24)
    .concat(commitsByHour.slice(0, 3))
    .reduce((a, b) => a + b, 0);
  const morningCommits = commitsByHour.slice(5, 9).reduce((a, b) => a + b, 0);

  if (nightCommits / total > 0.5) return "night-owl";
  if (morningCommits / total > 0.4) return "early-bird";
  // ... other personalities
  return "balanced";
}
```

Personalities: `night-owl`, `early-bird`, `weekend-warrior`, `nine-to-fiver`, `balanced`.

## Coding Conventions

- **TypeScript strict mode** everywhere
- **Function components** only (no class components)
- **Named exports** for components, default exports for pages only
- **Tailwind classes** sorted via `prettier-plugin-tailwindcss`
- **No `any` types** unless documented why
- **Server components by default** (Next.js App Router) — only `"use client"` when needed
- **Prisma queries in services**, never directly in resolvers
- **GraphQL resolvers** stay thin — business logic in services

## Testing Strategy

- **Unit tests (Jest):** business logic, insight calculations, utility functions
- **Integration tests:** API endpoints, GraphQL resolvers
- **E2E tests (Playwright):** critical flows — sign in, view dashboard, generate share card
- **Visual regression:** share card output (snapshot testing)

Aim for 70% coverage on business logic, lower on UI components.

## Build Phases

### Phase 1 — Foundation (Week 1)

- Next.js + Tailwind setup
- NextAuth GitHub login
- Basic dashboard showing user profile

### Phase 2 — Real data (Week 2)

- NestJS backend with GraphQL
- GitHub API integration with caching
- Display real stats with Recharts

### Phase 3 — Insights (Week 3)

- Personality detection
- Top language analysis
- Streak calculation
- Top collaborator detection

### Phase 4 — Sharing (Week 4)

- @vercel/og PNG generation
- Multiple card formats (square, story, banner)
- Public profile pages
- Deploy + analytics

### Phase 5 — Polish (Optional, Week 5+)

- Year-over-year comparison
- Team/organization mode
- README badge embed
- "GitHub Wrapped" annual recap experience (December launch)

## Things to Avoid

- **Don't store GitHub access tokens in plaintext** — encrypt at rest
- **Don't fetch from GitHub on every page load** — always cache
- **Don't put business logic in components** — extract to lib/services
- **Don't generate share cards on the fly synchronously** — use background jobs for slow paths
- **Don't expose sensitive data in public profile pages** — only show data the user opted to make public

## Useful Resources

- [GitHub GraphQL API Explorer](https://docs.github.com/en/graphql/overview/explorer)
- [GitHub REST API docs](https://docs.github.com/en/rest)
- [NextAuth.js docs](https://authjs.dev)
- [@vercel/og docs](https://vercel.com/docs/functions/og-image-generation)
- [Prisma docs](https://www.prisma.io/docs)
- [GH Archive](https://www.gharchive.org/) — historical data archive

## Contact

**Author:** Jonel C. Escaran
**Email:** jonelescaran@gmail.com
**Location:** Cebu City, Philippines

---

_This document should be updated as the project evolves. Keep it current — outdated docs are worse than no docs._
