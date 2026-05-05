import { auth, signIn } from "@/auth";
import Link from "next/link";
import { redirect } from "next/navigation";

const ERROR_MESSAGES: Record<string, string> = {
  OAuthAccountNotLinked:
    "This GitHub account is already linked elsewhere. Try a different account.",
  AccessDenied: "You declined the GitHub authorization. No worries — try again whenever.",
  Configuration: "Server configuration issue. Please contact support.",
  Verification: "The sign-in link is invalid or has expired.",
  default: "Something went wrong signing you in. Please try again.",
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; callbackUrl?: string }>;
}) {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }

  const { error, callbackUrl } = await searchParams;
  const errorMessage = error
    ? (ERROR_MESSAGES[error] ?? ERROR_MESSAGES.default)
    : null;

  return (
    <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden bg-zinc-50 px-6 py-12 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <div
        aria-hidden
        className="hero-glow pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[36rem] w-[36rem] max-w-[90vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-emerald-400/25 via-sky-400/15 to-indigo-500/25 blur-3xl dark:from-emerald-500/15 dark:via-sky-500/10 dark:to-indigo-500/20"
      />

      <Link
        href="/"
        className="absolute left-6 top-6 inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white/70 px-3 py-1.5 text-sm font-medium text-zinc-600 backdrop-blur transition-all hover:bg-white hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900/70 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back
      </Link>

      <Link
        href="/"
        className="mb-10 flex items-center gap-2 font-semibold transition-opacity hover:opacity-80"
      >
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900">
          ⌘
        </span>
        <span className="text-lg tracking-tight">git.wrapped</span>
      </Link>

      <div className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white/80 p-8 shadow-xl shadow-zinc-900/5 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/80 dark:shadow-black/20 sm:p-10">
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Welcome to git.wrapped
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Sign in with GitHub to see your year in code.
          </p>
        </div>

        {errorMessage && (
          <div
            role="alert"
            className="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300"
          >
            {errorMessage}
          </div>
        )}

        <form
          action={async () => {
            "use server";
            await signIn("github", {
              redirectTo: callbackUrl ?? "/dashboard",
            });
          }}
          className="mt-8"
        >
          <button
            type="submit"
            className="group flex h-12 w-full items-center justify-center gap-3 rounded-full bg-zinc-900 px-6 text-sm font-medium text-zinc-50 shadow-lg shadow-zinc-900/10 transition-all hover:scale-[1.02] hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:shadow-zinc-100/10 dark:hover:bg-zinc-300"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 16 16"
              fill="currentColor"
              aria-hidden
            >
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
            Continue with GitHub
            <span className="transition-transform group-hover:translate-x-0.5">→</span>
          </button>
        </form>

        <div className="mt-3 text-center">
          <Link
            href="/"
            className="text-sm text-zinc-500 underline-offset-4 hover:text-zinc-900 hover:underline dark:hover:text-zinc-100"
          >
            Cancel
          </Link>
        </div>

        <div className="my-6 flex items-center gap-3 text-xs text-zinc-400">
          <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
          <span>What you're authorizing</span>
          <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
        </div>

        <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
          <Bullet>Read your profile, contributions, and repositories (public + private)</Bullet>
          <Bullet>We only ever read your data — never write or modify anything</Bullet>
          <Bullet>Revoke access anytime from your GitHub settings</Bullet>
        </ul>
      </div>

      <p className="mt-8 text-center text-xs text-zinc-500">
        By continuing you agree this is a fun toy and not a regulated service.{" "}
        <Link href="/" className="underline-offset-4 hover:text-zinc-700 hover:underline dark:hover:text-zinc-300">
          Back to home
        </Link>
      </p>
    </div>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="mt-0.5 shrink-0 text-emerald-500"
        aria-hidden
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
      <span>{children}</span>
    </li>
  );
}
