import { auth, signIn, signOut } from "@/auth";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

type GitHubUser = {
  login: string;
  name: string | null;
  bio: string | null;
  public_repos: number;
  followers: number;
  following: number;
  avatar_url: string;
  html_url: string;
  created_at: string;
};

type GitHubRepo = {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  html_url: string;
  fork: boolean;
};

async function fetchGitHub<T>(path: string, token: string): Promise<T> {
  const res = await fetch(`https://api.github.com${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    next: { revalidate: 300 },
  });
  if (!res.ok) {
    throw new Error(`GitHub ${path} failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.accessToken) {
    redirect("/api/auth/signin");
  }

  const token = session.accessToken;
  const [user, repos] = await Promise.all([
    fetchGitHub<GitHubUser>("/user", token),
    fetchGitHub<GitHubRepo[]>("/user/repos?per_page=100&sort=updated", token),
  ]);

  const ownRepos = repos.filter((r) => !r.fork);
  const totalStars = ownRepos.reduce((sum, r) => sum + r.stargazers_count, 0);

  const languageCounts = ownRepos.reduce<Record<string, number>>((acc, r) => {
    if (r.language) acc[r.language] = (acc[r.language] ?? 0) + 1;
    return acc;
  }, {});
  const topLanguages = Object.entries(languageCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const topRepos = [...ownRepos]
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 5);

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900">
            ⌘
          </span>
          <span className="text-lg tracking-tight">git.wrapped</span>
        </Link>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <button
            type="submit"
            className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
          >
            Sign out
          </button>
        </form>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 pb-24">
        <section className="flex flex-col items-center gap-6 py-12 sm:flex-row sm:items-end">
          <Image
            src={user.avatar_url}
            alt={user.login}
            width={96}
            height={96}
            className="rounded-full ring-2 ring-zinc-200 dark:ring-zinc-800"
            unoptimized
          />
          <div className="text-center sm:text-left">
            <h1 className="text-3xl font-semibold tracking-tight">
              {user.name ?? user.login}
            </h1>
            <p className="text-zinc-500">@{user.login}</p>
            {user.bio && (
              <p className="mt-2 max-w-xl text-zinc-600 dark:text-zinc-400">
                {user.bio}
              </p>
            )}
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Public repos" value={user.public_repos} />
          <Stat label="Followers" value={user.followers} />
          <Stat label="Following" value={user.following} />
          <Stat label="Total stars" value={totalStars} />
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-2">
          <Card title="Top languages">
            {topLanguages.length === 0 ? (
              <p className="text-sm text-zinc-500">No language data yet.</p>
            ) : (
              <ul className="space-y-3">
                {topLanguages.map(([lang, count]) => {
                  const pct = Math.round((count / ownRepos.length) * 100);
                  return (
                    <li key={lang}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{lang}</span>
                        <span className="text-zinc-500">{pct}%</span>
                      </div>
                      <div className="mt-1 h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-indigo-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>

          <Card title="Top repositories">
            {topRepos.length === 0 ? (
              <p className="text-sm text-zinc-500">No repos found.</p>
            ) : (
              <ul className="space-y-3">
                {topRepos.map((r) => (
                  <li key={r.id} className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <a
                        href={r.html_url}
                        className="font-medium hover:underline"
                      >
                        {r.name}
                      </a>
                      {r.description && (
                        <p className="truncate text-sm text-zinc-500">
                          {r.description}
                        </p>
                      )}
                    </div>
                    <span className="shrink-0 text-sm text-zinc-500">
                      ★ {r.stargazers_count}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </section>

        <p className="mt-10 text-center text-sm text-zinc-500">
          Stats cached for 5 minutes. Backend will replace this with daily
          background sync + insights.
        </p>
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-1 text-3xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="mb-4 text-lg font-semibold">{title}</h2>
      {children}
    </div>
  );
}
