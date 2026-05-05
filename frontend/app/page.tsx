import { auth } from "@/auth";
import Image from "next/image";
import Link from "next/link";

export default async function Home() {
  const session = await auth();
  const isAuthed = Boolean(session?.user);

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <header className="sticky top-0 z-40 border-b border-zinc-200/60 bg-zinc-50/80 backdrop-blur-md dark:border-zinc-800/60 dark:bg-zinc-950/80">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900">
              ⌘
            </span>
            <span className="text-lg tracking-tight">git.wrapped</span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm text-zinc-600 sm:flex dark:text-zinc-400">
            <a href="#features" className="transition-colors hover:text-zinc-900 dark:hover:text-zinc-100">
              Features
            </a>
            <a href="#how-it-works" className="transition-colors hover:text-zinc-900 dark:hover:text-zinc-100">
              How it works
            </a>
            <a href="#faq" className="transition-colors hover:text-zinc-900 dark:hover:text-zinc-100">
              FAQ
            </a>
          </nav>
          {isAuthed && session?.user ? (
            <Link
              href="/dashboard"
              className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white/70 px-2 py-1 pl-1 text-sm font-medium text-zinc-700 shadow-sm backdrop-blur transition-all hover:scale-[1.03] hover:bg-white dark:border-zinc-800 dark:bg-zinc-900/70 dark:text-zinc-200 dark:hover:bg-zinc-900"
            >
              {session.user.image && (
                <Image
                  src={session.user.image}
                  alt={session.user.name ?? "You"}
                  width={28}
                  height={28}
                  className="rounded-full"
                  unoptimized
                />
              )}
              <span className="pr-2">Dashboard</span>
            </Link>
          ) : (
            <Link
              href="/dashboard"
              className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-50 shadow-sm transition-all hover:scale-[1.03] hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
            >
              Sign in
            </Link>
          )}
        </div>
      </header>

      <main className="flex flex-1 flex-col">
        <section className="relative mx-auto flex min-h-[calc(100svh-4rem)] w-full max-w-6xl flex-col items-center justify-center overflow-hidden px-6 py-16 text-center">
          <div
            aria-hidden
            className="hero-glow pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[36rem] w-[36rem] max-w-[90vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-emerald-400/30 via-sky-400/20 to-indigo-500/30 blur-3xl dark:from-emerald-500/20 dark:via-sky-500/10 dark:to-indigo-500/25"
          />
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/70 px-3 py-1 text-xs font-medium text-zinc-600 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/70 dark:text-zinc-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
            Your year in code, beautifully wrapped.
          </span>
          <h1 className="max-w-3xl text-5xl font-semibold leading-[1.1] tracking-tight sm:text-6xl md:text-7xl">
            Spotify Wrapped,{" "}
            <span className="bg-gradient-to-r from-emerald-500 via-sky-500 to-indigo-500 bg-clip-text text-transparent">
              but for your code.
            </span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
            Connect your GitHub account and turn a year of commits, pull
            requests, and reviews into beautiful share cards your followers will
            actually want to see.
          </p>
          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
            <Link
              href="/dashboard"
              className="group flex h-12 items-center justify-center gap-2 rounded-full bg-zinc-900 px-6 text-sm font-medium text-zinc-50 shadow-lg shadow-zinc-900/10 transition-all hover:scale-[1.03] hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:shadow-zinc-100/10 dark:hover:bg-zinc-300"
            >
              {isAuthed ? "Open your dashboard" : "Connect with GitHub"}
              <span className="transition-transform group-hover:translate-x-0.5">→</span>
            </Link>
            <a
              href="#how-it-works"
              className="flex h-12 items-center justify-center rounded-full border border-zinc-200 bg-white/70 px-6 text-sm font-medium backdrop-blur transition-all hover:scale-[1.03] hover:bg-white dark:border-zinc-800 dark:bg-zinc-900/70 dark:hover:bg-zinc-900"
            >
              See how it works
            </a>
          </div>
          <p className="mt-4 text-xs text-zinc-500">
            Free · Read-only access · No data sold
          </p>

          <a
            href="#features"
            aria-label="Scroll to features"
            className="absolute bottom-8 left-1/2 -translate-x-1/2 text-zinc-400 transition-colors hover:text-zinc-700 dark:hover:text-zinc-200"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-bounce">
              <path d="M12 5v14M19 12l-7 7-7-7" />
            </svg>
          </a>
        </section>

        <section
          id="features"
          className="scroll-mt-24 border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="reveal mx-auto w-full max-w-6xl px-6 py-24">
            <div className="mb-14 text-center">
              <p className="mb-3 text-sm font-medium uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                Features
              </p>
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                More than just numbers
              </h2>
              <p className="mt-3 text-zinc-600 dark:text-zinc-400">
                Personality-driven insights you can actually share.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <Feature
                icon="✦"
                accent="emerald"
                title="Beautiful share cards"
                body="Square, story, and banner formats — perfect for LinkedIn, Twitter, and Instagram. One click to download a PNG."
              />
              <Feature
                icon="◐"
                accent="indigo"
                title="Personality insights"
                body="Are you a Night Owl? Weekend Warrior? Early Bird? Your commit patterns tell a story — we just put it on a card."
              />
              <Feature
                icon="◆"
                accent="sky"
                title="Top languages & repos"
                body="See your top languages, most-touched repos, and favorite collaborators across the year at a glance."
              />
              <Feature
                icon="↯"
                accent="amber"
                title="Streaks & momentum"
                body="Longest streak, busiest week, and the days you absolutely went off — laid out like a music recap."
              />
              <Feature
                icon="◉"
                accent="rose"
                title="Public profile page"
                body="Share a clean public URL like git.wrapped/u/yourname so anyone can see your year without a login wall."
              />
              <Feature
                icon="❄"
                accent="violet"
                title="Yearly recap"
                body="Built for that end-of-year share moment. Re-runs each December — your wrapped, on time."
              />
            </div>
          </div>
        </section>

        <section
          id="how-it-works"
          className="scroll-mt-24 border-t border-zinc-200 dark:border-zinc-800"
        >
          <div className="reveal mx-auto w-full max-w-6xl px-6 py-24">
            <div className="mb-14 text-center">
              <p className="mb-3 text-sm font-medium uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                How it works
              </p>
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Three steps. About a minute.
              </h2>
            </div>
            <ol className="relative grid gap-6 sm:grid-cols-3">
              <Step n={1} title="Sign in with GitHub" body="Read-only access to your public contributions. Revoke anytime." />
              <Step n={2} title="We crunch the numbers" body="Commits, PRs, reviews, languages, hours, weekdays — all aggregated." />
              <Step n={3} title="Download & share" body="Pick a card format, download the PNG, post it. Done." />
            </ol>
          </div>
        </section>

        <section
          id="faq"
          className="scroll-mt-24 border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="reveal mx-auto w-full max-w-3xl px-6 py-24">
            <div className="mb-12 text-center">
              <p className="mb-3 text-sm font-medium uppercase tracking-widest text-sky-600 dark:text-sky-400">
                FAQ
              </p>
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Frequently asked
              </h2>
            </div>
            <div className="space-y-2">
              <Faq
                q="Is it free?"
                a="Yes. git.wrapped is free for individual GitHub users."
              />
              <Faq
                q="Do you store my data?"
                a="We cache aggregated stats so the dashboard loads quickly. We never sell your data, and you can delete your account at any time."
              />
              <Faq
                q="Does it see my private repos?"
                a="By default, no — only your public contribution graph. You can opt in to private contribution counts during sign-in if you want them included."
              />
              <Faq
                q="Can I share without making an account public?"
                a="Yes. Share cards are opt-in, and your public profile page can be disabled in settings."
              />
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden border-t border-zinc-200 dark:border-zinc-800">
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-96 w-[40rem] max-w-[90vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-emerald-400/20 to-indigo-500/20 blur-3xl"
          />
          <div className="reveal mx-auto w-full max-w-6xl px-6 py-24 text-center">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Ready to see your year?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-zinc-600 dark:text-zinc-400">
              Connect your GitHub and get your wrapped in seconds.
            </p>
            <Link
              href="/dashboard"
              className="group mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-zinc-900 px-6 text-sm font-medium text-zinc-50 shadow-lg shadow-zinc-900/10 transition-all hover:scale-[1.03] hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:shadow-zinc-100/10 dark:hover:bg-zinc-300"
            >
              {isAuthed ? "Open your dashboard" : "Connect with GitHub"}
              <span className="transition-transform group-hover:translate-x-0.5">→</span>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-zinc-500 sm:flex-row">
          <p>© {new Date().getFullYear()} git.wrapped</p>
          <p>
            Built by{" "}
            <a
              href="https://github.com/jonelescaran"
              className="font-medium text-zinc-700 transition-colors hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
            >
              @jonelescaran
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

const accentMap: Record<string, string> = {
  emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-emerald-500/20",
  indigo: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 ring-indigo-500/20",
  sky: "bg-sky-500/10 text-sky-600 dark:text-sky-400 ring-sky-500/20",
  amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-amber-500/20",
  rose: "bg-rose-500/10 text-rose-600 dark:text-rose-400 ring-rose-500/20",
  violet: "bg-violet-500/10 text-violet-600 dark:text-violet-400 ring-violet-500/20",
};

function Feature({
  icon,
  title,
  body,
  accent,
}: {
  icon: string;
  title: string;
  body: string;
  accent: keyof typeof accentMap;
}) {
  return (
    <div className="group relative rounded-2xl border border-zinc-200 bg-zinc-50 p-6 transition-all hover:-translate-y-1 hover:border-zinc-300 hover:shadow-xl hover:shadow-zinc-900/5 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700 dark:hover:shadow-black/20">
      <div
        className={`mb-4 grid h-10 w-10 place-items-center rounded-xl text-lg ring-1 ${accentMap[accent]}`}
      >
        {icon}
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        {body}
      </p>
    </div>
  );
}

function Step({ n, title, body }: { n: number; title: string; body: string }) {
  return (
    <li className="group relative rounded-2xl border border-zinc-200 bg-white p-6 transition-all hover:-translate-y-1 hover:border-zinc-300 hover:shadow-xl hover:shadow-zinc-900/5 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700 dark:hover:shadow-black/20">
      <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-zinc-900 to-zinc-700 text-sm font-semibold text-zinc-50 shadow-md dark:from-zinc-100 dark:to-zinc-300 dark:text-zinc-900">
        {n}
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        {body}
      </p>
    </li>
  );
}

function Faq({ q, a }: { q: string; a: string }) {
  return (
    <details className="group rounded-xl border border-zinc-200 bg-white px-5 py-4 transition-colors open:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:open:border-zinc-700 dark:hover:bg-zinc-900">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
        <span>{q}</span>
        <span className="text-zinc-400 transition-transform group-open:rotate-45">
          +
        </span>
      </summary>
      <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">{a}</p>
    </details>
  );
}
