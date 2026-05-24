import { auth, signOut } from "@/auth";
import { SharePreview } from "./share-preview";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CONTRIBUTIONS_QUERY } from "@/lib/constants/github.constants";
import { SHARE_FORMATS } from "@/lib/constants/share-formats.constants";
import { fetchGitHub, fetchGraphQL } from "@/lib/utils/github.utils";
import { aggregateByTime, calcStreaks } from "@/lib/utils/insights.utils";
import { detectPersonality } from "@/lib/utils/personality.utils";
import {
  parseShareFormat,
  getShareFormat,
} from "@/lib/utils/share-formats.utils";
import { buildShareParams } from "@/lib/utils/share-card.utils";
import type {
  ContributionDay,
  ContributionsResponse,
  GitHubRepo,
  GitHubUser,
} from "@/lib/types/github.types";
import type { ShareFormat } from "@/lib/types/share-formats.types";
import { accentMap } from "@/lib/constants/accent.constants";
import type { AccentKey } from "@/lib/types/accent.types";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ format?: string; year?: string }>;
}) {
  const sp = await searchParams;
  const format: ShareFormat = parseShareFormat(sp.format);

  const session = await auth();

  if (!session?.accessToken) {
    redirect("/signin?callbackUrl=/dashboard");
  }

  const token = session.accessToken;
  const username = session.user?.username;
  if (!username) {
    redirect("/signin?callbackUrl=/dashboard");
  }

  const [user, repos] = await Promise.all([
    fetchGitHub<GitHubUser>("/user", token),
    fetchGitHub<GitHubRepo[]>(
      "/user/repos?per_page=100&sort=updated&affiliation=owner",
      token,
    ),
  ]);

  const currentYear = new Date().getFullYear();
  const createdYear = new Date(user.created_at).getFullYear();
  const availableYears: number[] = [];
  for (let y = currentYear; y >= createdYear; y--) availableYears.push(y);

  const rawYear = sp.year ?? "all";
  const parsedYear = /^\d{4}$/.test(rawYear) ? Number(rawYear) : null;
  const selectedYear: number | "all" =
    parsedYear !== null && availableYears.includes(parsedYear)
      ? parsedYear
      : "all";

  const created = new Date(user.created_at);
  const yearsToFetch = selectedYear === "all" ? availableYears : [selectedYear];
  const ranges = yearsToFetch.map((y) => {
    const yearStart = new Date(Date.UTC(y, 0, 1));
    const yearEnd =
      y === currentYear
        ? new Date()
        : new Date(Date.UTC(y, 11, 31, 23, 59, 59));
    const from = yearStart < created ? created : yearStart;
    return { from: from.toISOString(), to: yearEnd.toISOString() };
  });

  const contributionResults = await Promise.all(
    ranges.map(({ from, to }) =>
      fetchGraphQL<ContributionsResponse>(
        CONTRIBUTIONS_QUERY,
        { username, from, to },
        token,
      ),
    ),
  );

  let totalCommits = 0;
  let totalPRs = 0;
  let totalReviews = 0;
  let totalContributions = 0;
  const allDays: ContributionDay[] = [];
  const repoCommitMap = new Map<
    string,
    { name: string; url: string; description: string | null; commits: number }
  >();
  for (const r of contributionResults) {
    const c = r.user.contributionsCollection;
    totalCommits += c.totalCommitContributions;
    totalPRs += c.totalPullRequestContributions;
    totalReviews += c.totalPullRequestReviewContributions;
    totalContributions += c.contributionCalendar.totalContributions;
    for (const w of c.contributionCalendar.weeks) {
      for (const d of w.contributionDays) allDays.push(d);
    }
    for (const {
      repository,
      contributions,
    } of c.commitContributionsByRepository) {
      const existing = repoCommitMap.get(repository.url);
      if (existing) {
        existing.commits += contributions.totalCount;
      } else {
        repoCommitMap.set(repository.url, {
          name: repository.name,
          url: repository.url,
          description: repository.description,
          commits: contributions.totalCount,
        });
      }
    }
  }
  allDays.sort((a, b) => a.date.localeCompare(b.date));

  const { longest: longestStreak, currentStreak } = calcStreaks(allDays);

  const yearLabel =
    selectedYear === "all" ? "All time" : selectedYear.toString();
  const yearKey = selectedYear === "all" ? "all" : selectedYear.toString();

  const activeDays = allDays.filter((d) => d.contributionCount > 0).length;

  const { weekdayCounts, bestMonth, bestMonthCount } = aggregateByTime(allDays);

  const ownRepos = repos.filter((r) => !r.fork);
  const totalStars = ownRepos.reduce((sum, r) => sum + r.stargazers_count, 0);

  const languageCounts = ownRepos.reduce<Record<string, number>>((acc, r) => {
    if (r.language) acc[r.language] = (acc[r.language] ?? 0) + 1;
    return acc;
  }, {});
  const topLanguages = Object.entries(languageCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const topRepos = [...repoCommitMap.values()]
    .sort((a, b) => b.commits - a.commits)
    .slice(0, 5);

  const memberSinceYear = new Date(user.created_at).getFullYear();

  const topRepo = topRepos[0];
  const topLang2 = topLanguages[1]?.[0] ?? "";
  const topLang3 = topLanguages[2]?.[0] ?? "";

  const weekendCommits = weekdayCounts[0] + weekdayCounts[6];
  const weekendShare =
    totalContributions > 0 ? weekendCommits / totalContributions : 0;
  const weekdayShare = 1 - weekendShare;
  const intensity = activeDays > 0 ? totalCommits / activeDays : 0;
  const bestMonthShare =
    totalContributions > 0 ? bestMonthCount / totalContributions : 0;
  const topLangCount = topLanguages[0]?.[1] ?? 0;
  const topLangShare = ownRepos.length > 0 ? topLangCount / ownRepos.length : 0;
  const numLangs = Object.keys(languageCounts).length;
  const personality = detectPersonality({
    longestStreak,
    weekendShare,
    weekdayShare,
    bestMonthShare,
    bestMonth,
    intensity,
    activeDays,
    numLangs,
    topLangShare,
    topLang: topLanguages[0]?.[0] ?? "",
  });

  const shareParams = buildShareParams({
    username,
    name: user.name ?? username,
    avatar: user.avatar_url,
    year: yearLabel,
    commits: totalCommits,
    prs: totalPRs,
    reviews: totalReviews,
    streak: longestStreak,
    total: totalContributions,
    topLang: topLanguages[0]?.[0] ?? "",
    topLang2,
    topLang3,
    activeDays,
    bestMonth,
    topRepo: topRepo?.name ?? "",
    topRepoCommits: topRepo?.commits ?? 0,
    personalityKey: personality.key,
    personalityLabel: personality.label,
    personalityTagline: personality.tagline,
    format,
  });
  const shareImageUrl = `/api/og?${shareParams.toString()}`;
  const shareFilename = `git-wrapped-${username}-${yearKey}-${format}.png`;

  const formats = SHARE_FORMATS;
  const previewAspectClass = getShareFormat(format).previewClass;

  return (
    <div className="relative flex flex-1 flex-col bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <header className="sticky top-0 z-40 border-b border-zinc-200/60 bg-zinc-50/80 backdrop-blur-md dark:border-zinc-800/60 dark:bg-zinc-950/80">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900">
              ⌘
            </span>
            <span className="text-base tracking-tight sm:text-lg">
              git.wrapped
            </span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href={user.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-2 rounded-full border border-zinc-200 bg-white/70 px-3 py-1.5 text-sm font-medium text-zinc-600 backdrop-blur transition-all hover:bg-white hover:text-zinc-900 sm:inline-flex dark:border-zinc-800 dark:bg-zinc-900/70 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 16 16"
                fill="currentColor"
                aria-hidden
              >
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z" />
              </svg>
              View on GitHub
            </a>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <button
                type="submit"
                className="rounded-full border border-zinc-200 bg-white/70 px-3 py-1.5 text-xs font-medium text-zinc-700 backdrop-blur transition-all hover:bg-white hover:text-zinc-900 sm:px-4 sm:py-2 sm:text-sm dark:border-zinc-800 dark:bg-zinc-900/70 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl min-w-0 px-4 pb-16 sm:px-6 sm:pb-24">
        <section className="relative overflow-hidden py-10 sm:py-16">
          <div
            aria-hidden
            className="hero-glow pointer-events-none absolute top-0 left-1/2 -z-10 h-72 w-[36rem] max-w-[90vw] -translate-x-1/2 rounded-full bg-gradient-to-br from-emerald-400/25 via-sky-400/15 to-indigo-500/25 blur-3xl dark:from-emerald-500/15 dark:via-sky-500/10 dark:to-indigo-500/20"
          />
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
            <div className="relative">
              <div
                aria-hidden
                className="absolute inset-0 -z-10 rounded-full bg-gradient-to-br from-emerald-400 via-sky-400 to-indigo-500 opacity-60 blur-md"
              />
              <Image
                src={user.avatar_url}
                alt={user.login}
                width={120}
                height={120}
                className="relative h-24 w-24 rounded-full shadow-xl ring-4 shadow-zinc-900/10 ring-white sm:h-[120px] sm:w-[120px] dark:shadow-black/30 dark:ring-zinc-900"
                unoptimized
              />
            </div>
            <div className="text-center sm:text-left">
              <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/70 px-3 py-1 text-xs font-medium text-zinc-600 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/70 dark:text-zinc-400">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                Member since {memberSinceYear}
              </span>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
                {user.name ?? user.login}
              </h1>
              <p className="mt-1 text-zinc-500">@{user.login}</p>
              {user.bio && (
                <p className="mt-3 max-w-xl text-zinc-600 dark:text-zinc-400">
                  {user.bio}
                </p>
              )}
              <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-zinc-500 sm:justify-start">
                <span>
                  <strong className="font-semibold text-zinc-700 tabular-nums dark:text-zinc-300">
                    {user.public_repos}
                  </strong>{" "}
                  public repos
                </span>
                <span aria-hidden>·</span>
                <span>
                  <strong className="font-semibold text-zinc-700 tabular-nums dark:text-zinc-300">
                    {user.followers}
                  </strong>{" "}
                  followers
                </span>
                <span aria-hidden>·</span>
                <span>
                  <strong className="font-semibold text-zinc-700 tabular-nums dark:text-zinc-300">
                    {totalStars}
                  </strong>{" "}
                  total stars
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="reveal">
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <h2 className="text-sm font-medium tracking-widest text-emerald-600 uppercase dark:text-emerald-400">
              {selectedYear === "all" ? "All-time stats" : `Your ${yearLabel}`}
            </h2>
            <p className="text-xs text-zinc-500 tabular-nums">
              {totalContributions.toLocaleString()} total contributions
            </p>
          </div>
          <div className="mb-4 flex max-w-full gap-1 overflow-x-auto rounded-full border border-zinc-200 bg-white p-1 text-xs sm:text-sm dark:border-zinc-800 dark:bg-zinc-900">
            {(["all", ...availableYears.map(String)] as const).map((y) => {
              const active = y === yearKey;
              const params = new URLSearchParams();
              if (y !== "all") params.set("year", y);
              if (format !== "landscape") params.set("format", format);
              const qs = params.toString();
              return (
                <Link
                  key={y}
                  href={`/dashboard${qs ? `?${qs}` : ""}`}
                  scroll={false}
                  className={`rounded-full px-3 py-1.5 font-medium whitespace-nowrap transition-colors sm:px-4 ${
                    active
                      ? "bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900"
                      : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                  }`}
                >
                  {y === "all" ? "All time" : y}
                </Link>
              );
            })}
          </div>
          <div className="grid gap-3 sm:grid-cols-4 sm:grid-rows-2 sm:gap-4">
            <BigStat
              className="sm:col-span-2 sm:row-span-2"
              accent="emerald"
              label="Commits"
              value={totalCommits}
              subtitle={`Across ${ownRepos.length} repositories`}
            />
            <Stat accent="sky" label="Pull requests" value={totalPRs} />
            <Stat accent="indigo" label="Reviews" value={totalReviews} />
            <Stat
              className="sm:col-span-2"
              accent="amber"
              label="Longest streak"
              value={longestStreak}
              suffix={longestStreak === 1 ? "day" : "days"}
              subtitle={
                currentStreak > 0
                  ? `${currentStreak}-day current streak — keep it going`
                  : "No active streak right now"
              }
            />
          </div>
        </section>

        <section className="reveal mt-8 grid gap-4 sm:mt-10 sm:gap-6 lg:grid-cols-2">
          <Card
            eyebrow="Languages"
            eyebrowAccent="emerald"
            title="Top languages"
            subtitle={`Across ${ownRepos.length} repositories`}
          >
            {topLanguages.length === 0 ? (
              <p className="text-sm text-zinc-500">No language data yet.</p>
            ) : (
              <ul className="space-y-4">
                {topLanguages.map(([lang, count], i) => {
                  const pct = Math.round((count / ownRepos.length) * 100);
                  return (
                    <li key={lang}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 font-medium">
                          <span className="text-xs text-zinc-400 tabular-nums">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          {lang}
                        </span>
                        <span className="text-zinc-500 tabular-nums">
                          {pct}%
                        </span>
                      </div>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-sky-500 to-indigo-500 transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>

          <Card
            eyebrow="Repositories"
            eyebrowAccent="indigo"
            title="Top repositories"
            subtitle="Sorted by commits"
          >
            {topRepos.length === 0 ? (
              <p className="text-sm text-zinc-500">No repos found.</p>
            ) : (
              <ul className="-mx-2 space-y-1">
                {topRepos.map((r) => (
                  <li key={r.url} className="min-w-0">
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex w-full items-start justify-between gap-4 rounded-xl px-2 py-2 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium group-hover:text-zinc-950 dark:group-hover:text-zinc-50">
                          {r.name}
                        </p>
                        {r.description && (
                          <p className="truncate text-sm text-zinc-500">
                            {r.description}
                          </p>
                        )}
                      </div>
                      <div className="flex shrink-0 items-center gap-1.5 text-sm text-zinc-500 tabular-nums">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-emerald-500"
                          aria-hidden
                        >
                          <circle cx="12" cy="12" r="3" />
                          <line x1="3" y1="12" x2="9" y2="12" />
                          <line x1="15" y1="12" x2="21" y2="12" />
                        </svg>
                        {r.commits.toLocaleString()}
                      </div>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </section>

        <section className="reveal mt-10 sm:mt-12">
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <h2 className="text-sm font-medium tracking-widest text-violet-600 uppercase dark:text-violet-400">
              Share your wrapped
            </h2>
            <p className="text-xs text-zinc-500 tabular-nums">
              {getShareFormat(format).aspect} PNG
            </p>
          </div>

          <div className="mb-4 inline-flex max-w-full overflow-x-auto rounded-full border border-zinc-200 bg-white p-1 text-xs sm:text-sm dark:border-zinc-800 dark:bg-zinc-900">
            {formats.map((f) => {
              const active = f.id === format;
              const params = new URLSearchParams();
              if (yearKey !== "all") params.set("year", yearKey);
              if (f.id !== "landscape") params.set("format", f.id);
              const qs = params.toString();
              return (
                <Link
                  key={f.id}
                  href={`/dashboard${qs ? `?${qs}` : ""}#share`}
                  scroll={false}
                  className={`rounded-full px-3 py-1.5 font-medium whitespace-nowrap transition-colors sm:px-4 ${
                    active
                      ? "bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900"
                      : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                  }`}
                >
                  {f.label}
                </Link>
              );
            })}
          </div>

          <div
            id="share"
            className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="grid gap-0 lg:grid-cols-[3fr_2fr]">
              <div className="flex items-center justify-center bg-zinc-950 p-4 sm:p-6">
                <SharePreview
                  src={shareImageUrl}
                  alt={`Your git.wrapped ${format} share card`}
                  format={format}
                  aspectClass={`w-full ${previewAspectClass}`}
                />
              </div>
              <div className="flex flex-col justify-center gap-4 p-6 sm:p-8">
                <h3 className="text-xl font-semibold tracking-tight sm:text-2xl">
                  {getShareFormat(format).label} card
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {getShareFormat(format).description}
                </p>
                <div className="mt-2 flex flex-wrap gap-3">
                  <a
                    href={shareImageUrl}
                    download={shareFilename}
                    className="group inline-flex h-11 items-center justify-center gap-2 rounded-full bg-zinc-900 px-5 text-sm font-medium text-zinc-50 shadow-lg shadow-zinc-900/10 transition-all hover:scale-[1.03] hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:shadow-zinc-100/10 dark:hover:bg-zinc-300"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                    >
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                    </svg>
                    Download PNG
                  </a>
                </div>
                <p className="mt-2 text-xs text-zinc-500">
                  Click the preview to zoom in. Stats cached for 5 minutes.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
  suffix,
  subtitle,
  className = "",
}: {
  label: string;
  value: number;
  accent: AccentKey;
  suffix?: string;
  subtitle?: string;
  className?: string;
}) {
  return (
    <div
      className={`group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white p-5 transition-all hover:-translate-y-1 hover:border-zinc-300 hover:shadow-xl hover:shadow-zinc-900/5 sm:p-6 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700 dark:hover:shadow-black/20 ${className}`}
    >
      <span
        className={`inline-flex w-fit rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${accentMap[accent]}`}
      >
        {label}
      </span>
      <p className="mt-3 flex items-baseline gap-1.5 text-3xl font-semibold tracking-tight tabular-nums sm:mt-4 sm:text-4xl md:text-5xl">
        {value.toLocaleString()}
        {suffix && (
          <span className="text-sm font-medium text-zinc-400 sm:text-base md:text-lg">
            {suffix}
          </span>
        )}
      </p>
      {subtitle && <p className="mt-2 text-sm text-zinc-500">{subtitle}</p>}
    </div>
  );
}

function BigStat({
  label,
  value,
  accent,
  subtitle,
  className = "",
}: {
  label: string;
  value: number;
  accent: AccentKey;
  subtitle?: string;
  className?: string;
}) {
  return (
    <div
      className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-200 bg-gradient-to-br from-white via-emerald-50/40 to-sky-50/30 p-6 transition-all hover:-translate-y-1 hover:border-zinc-300 hover:shadow-2xl hover:shadow-emerald-500/10 sm:p-8 dark:border-zinc-800 dark:from-zinc-900 dark:via-emerald-950/20 dark:to-sky-950/20 dark:hover:border-zinc-700 ${className}`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full bg-gradient-to-br from-emerald-400/30 to-sky-400/20 blur-3xl"
      />
      <span
        className={`relative inline-flex w-fit rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${accentMap[accent]}`}
      >
        {label}
      </span>
      <div className="relative mt-4 sm:mt-6">
        <p className="bg-gradient-to-br from-zinc-900 to-zinc-700 bg-clip-text text-5xl font-semibold tracking-tight text-transparent tabular-nums sm:text-7xl md:text-8xl dark:from-zinc-100 dark:to-zinc-300">
          {value.toLocaleString()}
        </p>
        {subtitle && <p className="mt-3 text-sm text-zinc-500">{subtitle}</p>}
      </div>
    </div>
  );
}

function Card({
  eyebrow,
  eyebrowAccent,
  title,
  subtitle,
  children,
}: {
  eyebrow: string;
  eyebrowAccent: AccentKey;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0 rounded-2xl border border-zinc-200 bg-white p-5 transition-all hover:border-zinc-300 hover:shadow-xl hover:shadow-zinc-900/5 sm:p-6 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700 dark:hover:shadow-black/20">
      <div className="mb-5">
        <span
          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${accentMap[eyebrowAccent]}`}
        >
          {eyebrow}
        </span>
        <h2 className="mt-3 text-lg font-semibold">{title}</h2>
        {subtitle && <p className="text-sm text-zinc-500">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
