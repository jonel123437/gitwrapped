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
  };
}

function langChips(d: Data, fontSize: number) {
  const langs = [d.topLang, d.topLang2, d.topLang3].filter(Boolean);
  const colors = [
    "rgba(52,211,153,0.15)",
    "rgba(56,189,248,0.15)",
    "rgba(129,140,248,0.15)",
  ];
  const borders = [
    "rgba(52,211,153,0.4)",
    "rgba(56,189,248,0.4)",
    "rgba(129,140,248,0.4)",
  ];
  const colorsText = ["#34d399", "#38bdf8", "#a5b4fc"];
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
            padding: `${fontSize * 0.4}px ${fontSize * 0.85}px`,
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

function insightLabel(label: string, fontSize: number) {
  return (
    <div
      style={{
        color: "#71717a",
        textTransform: "uppercase",
        letterSpacing: 1.5,
        fontSize: fontSize * 0.6,
        fontWeight: 700,
        display: "flex",
      }}
    >
      {label}
    </div>
  );
}

function insightLine(label: string, value: string, fontSize: number) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 4,
      }}
    >
      {insightLabel(label, fontSize)}
      <div
        style={{
          color: "#fafafa",
          fontWeight: 600,
          fontSize,
          display: "flex",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function repoLine(d: Data, fontSize: number) {
  if (!d.topRepo) return null;
  const star = fontSize * 0.75;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 4,
      }}
    >
      {insightLabel("Top repo", fontSize)}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontSize,
          color: "#fafafa",
          fontWeight: 600,
        }}
      >
        <div style={{ display: "flex" }}>{truncate(d.topRepo, 24)}</div>
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
    </div>
  );
}

function statTiles(d: Data) {
  return [
    { label: "Pull requests", value: d.prs.toLocaleString() },
    { label: "Reviews", value: d.reviews.toLocaleString() },
    {
      label: "Longest streak",
      value: `${d.streak} ${d.streak === 1 ? "day" : "days"}`,
    },
    { label: "Contributions", value: d.total.toLocaleString() },
  ];
}

const FRAME = {
  display: "flex",
  flexDirection: "column" as const,
  background: "#09090b",
  color: "white",
  position: "relative" as const,
  fontFamily: "sans-serif",
  width: "100%",
  height: "100%",
};

const BLOB_TOP_LEFT = {
  position: "absolute" as const,
  top: -200,
  left: -200,
  width: 700,
  height: 700,
  borderRadius: 9999,
  background:
    "radial-gradient(circle, rgba(52,211,153,0.55), rgba(56,189,248,0.25) 45%, transparent 70%)",
  display: "flex",
  filter: "blur(60px)",
};

const BLOB_BOTTOM_RIGHT = {
  position: "absolute" as const,
  bottom: -240,
  right: -180,
  width: 700,
  height: 700,
  borderRadius: 9999,
  background:
    "radial-gradient(circle, rgba(129,140,248,0.45), transparent 70%)",
  display: "flex",
  filter: "blur(60px)",
};

const YEAR_PILL = {
  display: "flex",
  background: "rgba(52,211,153,0.15)",
  border: "1px solid rgba(52,211,153,0.4)",
  color: "#34d399",
  borderRadius: 999,
  letterSpacing: 3,
  textTransform: "uppercase" as const,
  fontWeight: 700,
};

const TILE_BASE = {
  display: "flex",
  flexDirection: "column" as const,
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 16,
};

const TILE_LABEL = {
  color: "#71717a",
  textTransform: "uppercase" as const,
  letterSpacing: 1.5,
  fontWeight: 700,
  display: "flex",
};

const HERO_GRADIENT_TEXT = {
  backgroundImage:
    "linear-gradient(135deg, #34d399 0%, #38bdf8 50%, #818cf8 100%)",
  backgroundClip: "text",
  color: "transparent",
  display: "flex",
  fontWeight: 800,
  letterSpacing: -4,
  lineHeight: 0.95,
};

const TAGLINE = "Spotify Wrapped, but for your code.";

function renderLandscape(d: Data) {
  const tiles = statTiles(d);
  return (
    <div style={{ ...FRAME, padding: 56 }}>
      <div style={BLOB_TOP_LEFT} />
      <div style={BLOB_BOTTOM_RIGHT} />

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          position: "relative",
        }}
      >
        <div style={{ ...YEAR_PILL, fontSize: 16, padding: "6px 14px" }}>
          Year {d.year}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 20,
          marginTop: 44,
          position: "relative",
        }}
      >
        {d.avatar && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={d.avatar}
            alt=""
            width={88}
            height={88}
            style={{
              borderRadius: 9999,
              border: "3px solid rgba(255,255,255,0.25)",
            }}
          />
        )}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 38, fontWeight: 700, display: "flex" }}>
            {d.name}
          </div>
          <div style={{ fontSize: 22, color: "#a1a1aa", display: "flex" }}>
            @{d.username}
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: 36,
          marginTop: 18,
          position: "relative",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ ...HERO_GRADIENT_TEXT, fontSize: 140 }}>
            {d.commits.toLocaleString()}
          </div>
          <div
            style={{
              fontSize: 22,
              color: "#d4d4d8",
              marginTop: 2,
              display: "flex",
              fontWeight: 500,
            }}
          >
            commits across {d.activeDays} active days
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 14,
            marginBottom: 18,
            flex: 1,
          }}
        >
          {d.bestMonth && insightLine("Most active in", d.bestMonth, 20)}
          {repoLine(d, 20)}
        </div>
      </div>

      {(d.topLang || d.topLang2) && (
        <div
          style={{
            display: "flex",
            marginTop: 14,
            position: "relative",
          }}
        >
          {langChips(d, 16)}
        </div>
      )}

      <div
        style={{
          display: "flex",
          gap: 14,
          marginTop: "auto",
          position: "relative",
        }}
      >
        {tiles.map((s) => (
          <div
            key={s.label}
            style={{ ...TILE_BASE, flex: 1, padding: "14px 18px" }}
          >
            <div style={{ ...TILE_LABEL, fontSize: 11 }}>{s.label}</div>
            <div
              style={{
                fontSize: 28,
                fontWeight: 700,
                marginTop: 2,
                display: "flex",
              }}
            >
              {s.value}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          marginTop: 12,
          fontSize: 13,
          color: "#71717a",
          position: "relative",
        }}
      >
        {TAGLINE}
      </div>
    </div>
  );
}

function renderSquare(d: Data) {
  const tiles = statTiles(d);
  return (
    <div style={{ ...FRAME, padding: 60 }}>
      <div style={BLOB_TOP_LEFT} />
      <div style={BLOB_BOTTOM_RIGHT} />

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          position: "relative",
        }}
      >
        <div style={{ ...YEAR_PILL, fontSize: 18, padding: "8px 16px" }}>
          Year {d.year}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 22,
          marginTop: 40,
          position: "relative",
        }}
      >
        {d.avatar && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={d.avatar}
            alt=""
            width={108}
            height={108}
            style={{
              borderRadius: 9999,
              border: "3px solid rgba(255,255,255,0.25)",
            }}
          />
        )}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 44, fontWeight: 700, display: "flex" }}>
            {d.name}
          </div>
          <div style={{ fontSize: 26, color: "#a1a1aa", display: "flex" }}>
            @{d.username}
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          marginTop: 28,
          position: "relative",
        }}
      >
        <div style={{ ...HERO_GRADIENT_TEXT, fontSize: 220 }}>
          {d.commits.toLocaleString()}
        </div>
        <div
          style={{
            fontSize: 28,
            color: "#d4d4d8",
            marginTop: 4,
            display: "flex",
            fontWeight: 500,
          }}
        >
          commits across {d.activeDays} active days
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          marginTop: 20,
          position: "relative",
        }}
      >
        {(d.topLang || d.topLang2) && langChips(d, 18)}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 14,
            marginTop: 8,
          }}
        >
          {d.bestMonth && insightLine("Most active in", d.bestMonth, 24)}
          {repoLine(d, 24)}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 14,
          marginTop: "auto",
          position: "relative",
        }}
      >
        <div style={{ display: "flex", gap: 14 }}>
          {tiles.slice(0, 2).map((s) => (
            <div
              key={s.label}
              style={{ ...TILE_BASE, flex: 1, padding: "20px 24px" }}
            >
              <div style={{ ...TILE_LABEL, fontSize: 14 }}>{s.label}</div>
              <div
                style={{
                  fontSize: 40,
                  fontWeight: 700,
                  marginTop: 4,
                  display: "flex",
                }}
              >
                {s.value}
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 14 }}>
          {tiles.slice(2).map((s) => (
            <div
              key={s.label}
              style={{ ...TILE_BASE, flex: 1, padding: "20px 24px" }}
            >
              <div style={{ ...TILE_LABEL, fontSize: 14 }}>{s.label}</div>
              <div
                style={{
                  fontSize: 40,
                  fontWeight: 700,
                  marginTop: 4,
                  display: "flex",
                }}
              >
                {s.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          marginTop: 22,
          fontSize: 18,
          color: "#71717a",
          position: "relative",
        }}
      >
        {TAGLINE}
      </div>
    </div>
  );
}

function renderPortrait(d: Data) {
  const tiles = statTiles(d);
  return (
    <div style={{ ...FRAME, padding: 80, alignItems: "center" }}>
      <div
        style={{
          ...BLOB_TOP_LEFT,
          top: -300,
          left: -300,
          width: 900,
          height: 900,
        }}
      />
      <div
        style={{
          ...BLOB_BOTTOM_RIGHT,
          bottom: -340,
          right: -260,
          width: 900,
          height: 900,
        }}
      />

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          width: "100%",
          position: "relative",
        }}
      >
        <div style={{ ...YEAR_PILL, fontSize: 22, padding: "10px 20px" }}>
          Year {d.year}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginTop: 80,
          position: "relative",
        }}
      >
        {d.avatar && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={d.avatar}
            alt=""
            width={200}
            height={200}
            style={{
              borderRadius: 9999,
              border: "5px solid rgba(255,255,255,0.25)",
            }}
          />
        )}
        <div
          style={{
            display: "flex",
            fontSize: 64,
            fontWeight: 700,
            marginTop: 28,
          }}
        >
          {d.name}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 32,
            color: "#a1a1aa",
            marginTop: 4,
          }}
        >
          @{d.username}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginTop: 56,
          position: "relative",
        }}
      >
        <div
          style={{
            ...HERO_GRADIENT_TEXT,
            fontSize: 320,
            letterSpacing: -8,
          }}
        >
          {d.commits.toLocaleString()}
        </div>
        <div
          style={{
            fontSize: 40,
            color: "#d4d4d8",
            marginTop: 8,
            display: "flex",
            fontWeight: 500,
          }}
        >
          commits this year
        </div>
        <div
          style={{
            fontSize: 26,
            color: "#a1a1aa",
            marginTop: 4,
            display: "flex",
          }}
        >
          across {d.activeDays} active days
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 18,
          marginTop: 56,
          position: "relative",
        }}
      >
        {(d.topLang || d.topLang2) && langChips(d, 22)}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 22,
            marginTop: 16,
          }}
        >
          {d.bestMonth && insightLine("Most active in", d.bestMonth, 30)}
          {repoLine(d, 30)}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 18,
          marginTop: "auto",
          width: "100%",
          position: "relative",
        }}
      >
        <div style={{ display: "flex", gap: 18 }}>
          {tiles.slice(0, 2).map((s) => (
            <div
              key={s.label}
              style={{ ...TILE_BASE, flex: 1, padding: "26px 30px" }}
            >
              <div style={{ ...TILE_LABEL, fontSize: 18 }}>{s.label}</div>
              <div
                style={{
                  fontSize: 56,
                  fontWeight: 700,
                  marginTop: 6,
                  display: "flex",
                }}
              >
                {s.value}
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 18 }}>
          {tiles.slice(2).map((s) => (
            <div
              key={s.label}
              style={{ ...TILE_BASE, flex: 1, padding: "26px 30px" }}
            >
              <div style={{ ...TILE_LABEL, fontSize: 18 }}>{s.label}</div>
              <div
                style={{
                  fontSize: 56,
                  fontWeight: 700,
                  marginTop: 6,
                  display: "flex",
                }}
              >
                {s.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          marginTop: 32,
          fontSize: 22,
          color: "#71717a",
          position: "relative",
        }}
      >
        {TAGLINE}
      </div>
    </div>
  );
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
