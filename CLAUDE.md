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

- **Framework:** Next.js 15 (App Router) + TypeScript
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

```
git-wrapped/
├── apps/
│   ├── web/                 # Next.js frontend
│   │   ├── app/
│   │   │   ├── page.tsx              # Landing page
│   │   │   ├── dashboard/page.tsx    # Logged-in dashboard
│   │   │   ├── u/[username]/page.tsx # Public profile
│   │   │   ├── share/[id]/page.tsx   # Share card preview
│   │   │   └── api/
│   │   │       ├── auth/             # NextAuth routes
│   │   │       └── og/               # @vercel/og image generation
│   │   ├── components/
│   │   ├── lib/
│   │   └── package.json
│   └── api/                 # NestJS backend
│       ├── src/
│       │   ├── auth/
│       │   ├── github/      # GitHub API integration
│       │   ├── stats/       # Stats computation logic
│       │   ├── users/
│       │   ├── insights/    # "Night owl" etc. analysis
│       │   └── main.ts
│       ├── prisma/
│       │   └── schema.prisma
│       └── package.json
├── packages/
│   └── shared/              # Shared types, utils
├── package.json
└── CLAUDE.md
```

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
