import { ImageResponse } from "next/og";

export const runtime = "edge";

type Format = "landscape" | "portrait" | "square";

const SIZES: Record<Format, { width: number; height: number }> = {
  landscape: { width: 1200, height: 630 },
  square: { width: 1080, height: 1080 },
  portrait: { width: 1080, height: 1920 },
};

type Data = {
  username: string;
  name: string;
  avatar: string;
  year: string;
  commits: number;
  prs: number;
  reviews: number;
  streak: number;
  total: number;
  topLang: string;
  topLang2: string;
  topLang3: string;
  activeDays: number;
  bestMonth: string;
  topRepo: string;
  topRepoStars: number;
  personalityKey: string;
  personalityLabel: string;
  personalityTagline: string;
};

function readParams(params: URLSearchParams): Data {
  const username = params.get("username") ?? "github-user";
  return {
    username,
    name: params.get("name") ?? username,
    avatar: params.get("avatar") ?? "",
    year: params.get("year") ?? new Date().getFullYear().toString(),
    commits: Number(params.get("commits") ?? 0),
    prs: Number(params.get("prs") ?? 0),
    reviews: Number(params.get("reviews") ?? 0),
    streak: Number(params.get("streak") ?? 0),
    total: Number(params.get("total") ?? 0),
    topLang: params.get("topLang") ?? "",
    topLang2: params.get("topLang2") ?? "",
    topLang3: params.get("topLang3") ?? "",
    activeDays: Number(params.get("activeDays") ?? 0),
    bestMonth: params.get("bestMonth") ?? "",
    topRepo: params.get("topRepo") ?? "",
    topRepoStars: Number(params.get("topRepoStars") ?? 0),
    personalityKey: params.get("personalityKey") ?? "balanced",
    personalityLabel: params.get("personalityLabel") ?? "Balanced Builder",
    personalityTagline:
      params.get("personalityTagline") ?? "steady, consistent, unbothered",
  };
}

type Theme = {
  hero: string;
  blobA: string;
  blobB: string;
  blobC: string;
  pillBg: string;
  pillBorder: string;
  pillText: string;
  accent: string;
};

const THEMES: Record<string, Theme> = {
  "weekend-warrior": {
    hero: "linear-gradient(135deg, #f472b6 0%, #c084fc 50%, #818cf8 100%)",
    blobA: "radial-gradient(circle, rgba(244,114,182,0.7), transparent 70%)",
    blobB: "radial-gradient(circle, rgba(129,140,248,0.6), transparent 70%)",
    blobC: "radial-gradient(circle, rgba(192,132,252,0.45), transparent 70%)",
    pillBg: "rgba(244,114,182,0.18)",
    pillBorder: "rgba(244,114,182,0.55)",
    pillText: "#f9a8d4",
    accent: "#f472b6",
  },
  "streak-master": {
    hero: "linear-gradient(135deg, #fbbf24 0%, #f97316 45%, #ef4444 100%)",
    blobA: "radial-gradient(circle, rgba(251,191,36,0.7), transparent 70%)",
    blobB: "radial-gradient(circle, rgba(239,68,68,0.55), transparent 70%)",
    blobC: "radial-gradient(circle, rgba(249,115,22,0.5), transparent 70%)",
    pillBg: "rgba(251,191,36,0.18)",
    pillBorder: "rgba(251,191,36,0.55)",
    pillText: "#fcd34d",
    accent: "#f97316",
  },
  "nine-to-fiver": {
    hero: "linear-gradient(135deg, #34d399 0%, #38bdf8 100%)",
    blobA: "radial-gradient(circle, rgba(52,211,153,0.6), transparent 70%)",
    blobB: "radial-gradient(circle, rgba(56,189,248,0.55), transparent 70%)",
    blobC: "radial-gradient(circle, rgba(99,102,241,0.35), transparent 70%)",
    pillBg: "rgba(52,211,153,0.18)",
    pillBorder: "rgba(52,211,153,0.55)",
    pillText: "#6ee7b7",
    accent: "#34d399",
  },
  seasonal: {
    hero: "linear-gradient(135deg, #fbbf24 0%, #fb7185 60%, #c084fc 100%)",
    blobA: "radial-gradient(circle, rgba(251,191,36,0.6), transparent 70%)",
    blobB: "radial-gradient(circle, rgba(251,113,133,0.55), transparent 70%)",
    blobC: "radial-gradient(circle, rgba(192,132,252,0.45), transparent 70%)",
    pillBg: "rgba(251,113,133,0.18)",
    pillBorder: "rgba(251,113,133,0.55)",
    pillText: "#fda4af",
    accent: "#fb7185",
  },
  sprinter: {
    hero: "linear-gradient(135deg, #fb7185 0%, #f97316 50%, #fbbf24 100%)",
    blobA: "radial-gradient(circle, rgba(251,113,133,0.65), transparent 70%)",
    blobB: "radial-gradient(circle, rgba(249,115,22,0.6), transparent 70%)",
    blobC: "radial-gradient(circle, rgba(251,191,36,0.45), transparent 70%)",
    pillBg: "rgba(251,113,133,0.18)",
    pillBorder: "rgba(251,113,133,0.55)",
    pillText: "#fda4af",
    accent: "#fb7185",
  },
  marathoner: {
    hero: "linear-gradient(135deg, #34d399 0%, #14b8a6 50%, #38bdf8 100%)",
    blobA: "radial-gradient(circle, rgba(52,211,153,0.65), transparent 70%)",
    blobB: "radial-gradient(circle, rgba(20,184,166,0.55), transparent 70%)",
    blobC: "radial-gradient(circle, rgba(56,189,248,0.45), transparent 70%)",
    pillBg: "rgba(52,211,153,0.18)",
    pillBorder: "rgba(52,211,153,0.55)",
    pillText: "#6ee7b7",
    accent: "#14b8a6",
  },
  polyglot: {
    hero: "linear-gradient(135deg, #34d399 0%, #38bdf8 25%, #818cf8 50%, #f472b6 75%, #fbbf24 100%)",
    blobA: "radial-gradient(circle, rgba(52,211,153,0.55), transparent 70%)",
    blobB: "radial-gradient(circle, rgba(244,114,182,0.55), transparent 70%)",
    blobC: "radial-gradient(circle, rgba(251,191,36,0.45), transparent 70%)",
    pillBg: "rgba(129,140,248,0.18)",
    pillBorder: "rgba(129,140,248,0.55)",
    pillText: "#a5b4fc",
    accent: "#818cf8",
  },
  specialist: {
    hero: "linear-gradient(135deg, #38bdf8 0%, #6366f1 100%)",
    blobA: "radial-gradient(circle, rgba(56,189,248,0.65), transparent 70%)",
    blobB: "radial-gradient(circle, rgba(99,102,241,0.6), transparent 70%)",
    blobC: "radial-gradient(circle, rgba(129,140,248,0.4), transparent 70%)",
    pillBg: "rgba(56,189,248,0.18)",
    pillBorder: "rgba(56,189,248,0.55)",
    pillText: "#7dd3fc",
    accent: "#38bdf8",
  },
  balanced: {
    hero: "linear-gradient(135deg, #34d399 0%, #38bdf8 50%, #818cf8 100%)",
    blobA: "radial-gradient(circle, rgba(52,211,153,0.6), transparent 70%)",
    blobB: "radial-gradient(circle, rgba(129,140,248,0.55), transparent 70%)",
    blobC: "radial-gradient(circle, rgba(56,189,248,0.45), transparent 70%)",
    pillBg: "rgba(52,211,153,0.15)",
    pillBorder: "rgba(52,211,153,0.4)",
    pillText: "#34d399",
    accent: "#38bdf8",
  },
};

function themeFor(d: Data): Theme {
  return THEMES[d.personalityKey] ?? THEMES.balanced;
}

function langChips(d: Data, fontSize: number) {
  const langs = [d.topLang, d.topLang2, d.topLang3].filter(Boolean);
  const colors = [
    "rgba(52,211,153,0.18)",
    "rgba(56,189,248,0.18)",
    "rgba(129,140,248,0.18)",
  ];
  const borders = [
    "rgba(52,211,153,0.5)",
    "rgba(56,189,248,0.5)",
    "rgba(129,140,248,0.5)",
  ];
  const colorsText = ["#6ee7b7", "#7dd3fc", "#a5b4fc"];
  return (
    <div style={{ display: "flex", gap: 10 }}>
      {langs.map((l, i) => (
        <div
          key={l}
          style={{
            display: "flex",
            background: colors[i],
            border: `1px solid ${borders[i]}`,
            color: colorsText[i],
            padding: `${fontSize * 0.45}px ${fontSize * 0.95}px`,
            borderRadius: 999,
            fontSize,
            fontWeight: 600,
          }}
        >
          {l}
        </div>
      ))}
    </div>
  );
}

function truncate(s: string, max: number) {
  return s.length > max ? `${s.slice(0, max - 1)}…` : s;
}

const FRAME = {
  display: "flex",
  flexDirection: "column" as const,
  background: "#070708",
  color: "white",
  position: "relative" as const,
  fontFamily: "sans-serif",
  width: "100%",
  height: "100%",
  overflow: "hidden" as const,
};

function blobs(theme: Theme) {
  return (
    <>
      <div
        style={{
          position: "absolute",
          top: -260,
          left: -220,
          width: 820,
          height: 820,
          borderRadius: 9999,
          background: theme.blobA,
          display: "flex",
          filter: "blur(70px)",
          opacity: 0.85,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -300,
          right: -240,
          width: 880,
          height: 880,
          borderRadius: 9999,
          background: theme.blobB,
          display: "flex",
          filter: "blur(80px)",
          opacity: 0.8,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "30%",
          left: "55%",
          width: 520,
          height: 520,
          borderRadius: 9999,
          background: theme.blobC,
          display: "flex",
          filter: "blur(90px)",
          opacity: 0.55,
        }}
      />
    </>
  );
}

function yearPill(d: Data, theme: Theme, fontSize: number) {
  const yearText = /^\d{4}$/.test(d.year)
    ? `Year ${d.year}`
    : d.year.toLowerCase() === "all time"
      ? "All time"
      : d.year;
  return (
    <div
      style={{
        display: "flex",
        background: theme.pillBg,
        border: `1px solid ${theme.pillBorder}`,
        color: theme.pillText,
        borderRadius: 999,
        letterSpacing: 3,
        textTransform: "uppercase",
        fontWeight: 700,
        fontSize,
        padding: `${fontSize * 0.5}px ${fontSize * 1}px`,
      }}
    >
      {yearText}
    </div>
  );
}

function personalityEyebrow(theme: Theme, fontSize: number) {
  return (
    <div
      style={{
        display: "flex",
        color: theme.pillText,
        textTransform: "uppercase",
        letterSpacing: 4,
        fontSize,
        fontWeight: 700,
      }}
    >
      You are a
    </div>
  );
}

function personalityHeadline(d: Data, theme: Theme, fontSize: number) {
  return (
    <div
      style={{
        display: "flex",
        backgroundImage: theme.hero,
        backgroundClip: "text",
        color: "transparent",
        fontWeight: 800,
        letterSpacing: -2,
        lineHeight: 0.95,
        fontSize,
        textTransform: "uppercase",
      }}
    >
      {d.personalityLabel}
    </div>
  );
}

function bigNumber(d: Data, theme: Theme, fontSize: number) {
  return (
    <div
      style={{
        display: "flex",
        backgroundImage: theme.hero,
        backgroundClip: "text",
        color: "transparent",
        fontWeight: 800,
        letterSpacing: -3,
        lineHeight: 0.95,
        fontSize,
      }}
    >
      {d.commits.toLocaleString()}
    </div>
  );
}

function identityRow(d: Data, fontSize: number, avatarSize: number) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: fontSize * 0.7 }}>
      {d.avatar && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={d.avatar}
          alt=""
          width={avatarSize}
          height={avatarSize}
          style={{
            borderRadius: 9999,
            border: "2px solid rgba(255,255,255,0.3)",
          }}
        />
      )}
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            fontSize,
            fontWeight: 700,
            display: "flex",
            color: "#fafafa",
          }}
        >
          {d.name}
        </div>
        <div
          style={{
            fontSize: fontSize * 0.7,
            color: "#a1a1aa",
            display: "flex",
          }}
        >
          @{d.username}
        </div>
      </div>
    </div>
  );
}

function weirdFactLine(d: Data, theme: Theme, fontSize: number) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: fontSize * 0.5,
        fontSize,
        fontWeight: 600,
        color: "#fafafa",
      }}
    >
      <div
        style={{
          display: "flex",
          width: fontSize * 0.55,
          height: fontSize * 0.55,
          borderRadius: 9999,
          background: theme.accent,
        }}
      />
      <div style={{ display: "flex" }}>{d.personalityTagline}</div>
    </div>
  );
}

function statRow(d: Data, fontSize: number, max = 4) {
  const items: { label: string; value: string }[] = [];
  if (d.streak > 0)
    items.push({
      label: "Longest streak",
      value: `${d.streak}d`,
    });
  if (d.activeDays > 0)
    items.push({
      label: "Active days",
      value: d.activeDays.toString(),
    });
  if (d.prs > 0)
    items.push({
      label: "Pull requests",
      value: d.prs.toLocaleString(),
    });
  if (d.bestMonth)
    items.push({
      label: "Peak month",
      value: d.bestMonth.slice(0, 3),
    });
  const visible = items.slice(0, max);
  if (visible.length === 0) return null;
  return (
    <div style={{ display: "flex", gap: fontSize * 1.2, alignItems: "center" }}>
      {visible.map((it, i) => (
        <div
          key={it.label}
          style={{
            display: "flex",
            alignItems: "center",
            gap: fontSize * 1.2,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: fontSize * 0.15,
            }}
          >
            <div
              style={{
                display: "flex",
                color: "#71717a",
                textTransform: "uppercase",
                letterSpacing: 1.5,
                fontSize: fontSize * 0.55,
                fontWeight: 700,
              }}
            >
              {it.label}
            </div>
            <div
              style={{
                display: "flex",
                fontSize,
                fontWeight: 700,
                color: "#fafafa",
                lineHeight: 1,
              }}
            >
              {it.value}
            </div>
          </div>
          {i < visible.length - 1 && (
            <div
              style={{
                display: "flex",
                width: 1,
                height: fontSize * 1.4,
                background: "rgba(255,255,255,0.12)",
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function topRepoLine(d: Data, fontSize: number, stacked = false) {
  if (!d.topRepo) return null;
  const star = fontSize * 0.85;
  const value = (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        fontSize,
        color: "#fafafa",
        fontWeight: 600,
      }}
    >
      <div style={{ display: "flex" }}>{`/${truncate(d.topRepo, 22)}`}</div>
      {d.topRepoStars > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <svg
            width={star}
            height={star}
            viewBox="0 0 24 24"
            style={{ display: "flex" }}
          >
            <path
              d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
              fill="#fbbf24"
            />
          </svg>
          <div style={{ display: "flex" }}>{d.topRepoStars}</div>
        </div>
      )}
    </div>
  );
  const label = (
    <div
      style={{
        display: "flex",
        color: "#71717a",
        textTransform: "uppercase",
        letterSpacing: 1.5,
        fontSize: fontSize * 0.6,
        fontWeight: 700,
      }}
    >
      Top repo
    </div>
  );
  if (stacked) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: fontSize * 0.25,
        }}
      >
        {label}
        {value}
      </div>
    );
  }
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      {label}
      {value}
    </div>
  );
}

const TAGLINE = "git.wrapped — Spotify Wrapped, but for your code.";

function renderLandscape(d: Data) {
  const theme = themeFor(d);
  return (
    <div style={{ ...FRAME, padding: 56 }}>
      {blobs(theme)}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "relative",
        }}
      >
        {identityRow(d, 22, 64)}
        {yearPill(d, theme, 14)}
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          marginTop: 28,
          position: "relative",
        }}
      >
        {personalityEyebrow(theme, 18)}
        {personalityHeadline(d, theme, 96)}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: 28,
          marginTop: 18,
          position: "relative",
        }}
      >
        {bigNumber(d, theme, 110)}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 4,
            paddingBottom: 14,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 22,
              color: "#d4d4d8",
              fontWeight: 500,
            }}
          >
            commits
          </div>
          <div style={{ display: "flex", fontSize: 16, color: "#a1a1aa" }}>
            across {d.activeDays} active days
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          marginTop: 14,
          position: "relative",
        }}
      >
        {weirdFactLine(d, theme, 22)}
      </div>

      <div
        style={{
          display: "flex",
          marginTop: "auto",
          alignItems: "center",
          justifyContent: "space-between",
          position: "relative",
        }}
      >
        <div style={{ display: "flex", gap: 12 }}>
          {(d.topLang || d.topLang2) && langChips(d, 14)}
        </div>
        <div style={{ display: "flex", fontSize: 13, color: "#71717a" }}>
          {TAGLINE}
        </div>
      </div>
    </div>
  );
}

function renderSquare(d: Data) {
  const theme = themeFor(d);
  return (
    <div style={{ ...FRAME, padding: 64 }}>
      {blobs(theme)}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "relative",
        }}
      >
        {identityRow(d, 24, 72)}
        {yearPill(d, theme, 16)}
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
          marginTop: 56,
          position: "relative",
        }}
      >
        {personalityEyebrow(theme, 22)}
        {personalityHeadline(d, theme, 132)}
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          marginTop: 36,
          position: "relative",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-end", gap: 20 }}>
          {bigNumber(d, theme, 180)}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 4,
              paddingBottom: 24,
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 28,
                color: "#d4d4d8",
                fontWeight: 500,
              }}
            >
              commits
            </div>
            <div style={{ display: "flex", fontSize: 20, color: "#a1a1aa" }}>
              across {d.activeDays} active days
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          marginTop: 24,
          position: "relative",
        }}
      >
        {weirdFactLine(d, theme, 28)}
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 22,
          marginTop: "auto",
          position: "relative",
        }}
      >
        {(d.topLang || d.topLang2) && langChips(d, 18)}
        {topRepoLine(d, 20)}
        {statRow(d, 30)}
        <div
          style={{
            display: "flex",
            fontSize: 16,
            color: "#71717a",
            marginTop: 4,
          }}
        >
          {TAGLINE}
        </div>
      </div>
    </div>
  );
}

function renderPortrait(d: Data) {
  const theme = themeFor(d);
  return (
    <div style={{ ...FRAME, padding: "72px 80px" }}>
      {blobs(theme)}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "relative",
        }}
      >
        {identityRow(d, 32, 96)}
        {yearPill(d, theme, 24)}
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 40,
          marginTop: 100,
          position: "relative",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          {personalityEyebrow(theme, 32)}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              width: 920,
              backgroundImage: theme.hero,
              backgroundClip: "text",
              color: "transparent",
              fontWeight: 800,
              letterSpacing: -2,
              lineHeight: 0.92,
              fontSize: personalityPortraitSize(d.personalityLabel),
              textTransform: "uppercase",
            }}
          >
            {d.personalityLabel}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "flex-end", gap: 32 }}>
          {bigNumber(d, theme, 300)}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              paddingBottom: 38,
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 44,
                color: "#d4d4d8",
                fontWeight: 500,
                lineHeight: 1,
              }}
            >
              commits
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 28,
                color: "#a1a1aa",
                lineHeight: 1,
              }}
            >
              across {d.activeDays} active days
            </div>
          </div>
        </div>

        <div style={{ display: "flex" }}>{weirdFactLine(d, theme, 38)}</div>
      </div>

      <div
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "column",
          justifyContent: "space-between",
          marginTop: 60,
          paddingBottom: 8,
          position: "relative",
        }}
      >
        {(d.topLang || d.topLang2) && langChips(d, 36)}
        {topRepoLine(d, 36, true)}
        {statRow(d, 52, 3)}
        <div
          style={{
            display: "flex",
            fontSize: 28,
            color: "#71717a",
          }}
        >
          {TAGLINE}
        </div>
      </div>
    </div>
  );
}

function personalityPortraitSize(label: string): number {
  const longest = label
    .split(/\s+/)
    .reduce((max, w) => Math.max(max, w.length), 0);
  if (longest >= 11) return 130;
  if (longest >= 9) return 150;
  if (longest >= 8) return 165;
  if (longest >= 7) return 175;
  return 200;
}

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const formatParam = params.get("format") ?? "landscape";
  const format: Format =
    formatParam === "portrait" || formatParam === "square"
      ? formatParam
      : "landscape";

  const data = readParams(params);
  const element =
    format === "portrait"
      ? renderPortrait(data)
      : format === "square"
        ? renderSquare(data)
        : renderLandscape(data);

  return new ImageResponse(element, {
    ...SIZES[format],
    headers: {
      "Cache-Control": "public, max-age=300, s-maxage=300",
    },
  });
}
