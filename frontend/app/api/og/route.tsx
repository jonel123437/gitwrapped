import { ImageResponse } from "next/og";
import {
  parseShareFormat,
  getShareFormat,
} from "@/lib/utils/share-formats.utils";
import { themeFor } from "@/lib/utils/personality.utils";
import { readShareParams } from "@/lib/utils/share-card.utils";
import type { ShareCardData } from "@/lib/types/share-card.types";
import type { ShareFormat } from "@/lib/types/share-formats.types";
import type { Theme } from "@/lib/types/personality.types";

export const runtime = "edge";

type Data = ShareCardData;

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

function personalityHeadline(
  d: Data,
  theme: Theme,
  fontSize: number,
  options?: { wrap?: boolean; width?: number },
) {
  return (
    <div
      style={{
        display: "flex",
        ...(options?.wrap ? { flexWrap: "wrap", width: options.width } : null),
        backgroundImage: theme.hero,
        backgroundClip: "text",
        color: "transparent",
        fontWeight: 800,
        letterSpacing: -2,
        lineHeight: options?.wrap ? 0.92 : 0.95,
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
    items.push({ label: "Longest streak", value: `${d.streak}d` });
  if (d.activeDays > 0)
    items.push({ label: "Active days", value: d.activeDays.toString() });
  if (d.prs > 0)
    items.push({ label: "Pull requests", value: d.prs.toLocaleString() });
  if (d.bestMonth)
    items.push({ label: "Peak month", value: d.bestMonth.slice(0, 3) });
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

type LayoutConfig = {
  framePadding: string | number;
  identityFont: number;
  avatarSize: number;
  yearPillFont: number;
  eyebrowFont: number;
  headlineFont: number | ((d: Data) => number);
  headlineWrap?: { width: number };
  blockGap: number;
  bigNumberFont: number;
  commitsLabelFont: number;
  commitsSubFont: number;
  commitsPadBottom: number;
  factFont: number;
  langChipFont: number;
  topRepoFont: number;
  topRepoStacked?: boolean;
  statFont: number;
  statMax?: number;
  taglineFont: number;
  showTopRepoInBody: boolean;
  showStatRowInBody: boolean;
  bodyGap: number;
  bodyMarginTop: number | "auto";
};

const LAYOUTS: Record<ShareFormat, LayoutConfig> = {
  landscape: {
    framePadding: 56,
    identityFont: 22,
    avatarSize: 64,
    yearPillFont: 14,
    eyebrowFont: 18,
    headlineFont: 96,
    blockGap: 28,
    bigNumberFont: 110,
    commitsLabelFont: 22,
    commitsSubFont: 16,
    commitsPadBottom: 14,
    factFont: 22,
    langChipFont: 14,
    topRepoFont: 20,
    statFont: 30,
    taglineFont: 13,
    showTopRepoInBody: false,
    showStatRowInBody: false,
    bodyGap: 0,
    bodyMarginTop: "auto",
  },
  square: {
    framePadding: 64,
    identityFont: 24,
    avatarSize: 72,
    yearPillFont: 16,
    eyebrowFont: 22,
    headlineFont: 132,
    blockGap: 56,
    bigNumberFont: 180,
    commitsLabelFont: 28,
    commitsSubFont: 20,
    commitsPadBottom: 24,
    factFont: 28,
    langChipFont: 18,
    topRepoFont: 20,
    statFont: 30,
    taglineFont: 16,
    showTopRepoInBody: true,
    showStatRowInBody: true,
    bodyGap: 22,
    bodyMarginTop: "auto",
  },
  portrait: {
    framePadding: "72px 80px",
    identityFont: 32,
    avatarSize: 96,
    yearPillFont: 24,
    eyebrowFont: 32,
    headlineFont: (d) => personalityPortraitSize(d.personalityLabel),
    headlineWrap: { width: 920 },
    blockGap: 100,
    bigNumberFont: 300,
    commitsLabelFont: 44,
    commitsSubFont: 28,
    commitsPadBottom: 38,
    factFont: 38,
    langChipFont: 36,
    topRepoFont: 36,
    topRepoStacked: true,
    statFont: 52,
    statMax: 3,
    taglineFont: 28,
    showTopRepoInBody: true,
    showStatRowInBody: true,
    bodyGap: 0,
    bodyMarginTop: 60,
  },
};

function renderCard(d: Data, format: ShareFormat) {
  const theme = themeFor(d.personalityKey);
  const c = LAYOUTS[format];
  const headlineFont =
    typeof c.headlineFont === "function" ? c.headlineFont(d) : c.headlineFont;
  const isPortrait = format === "portrait";

  return (
    <div style={{ ...FRAME, padding: c.framePadding }}>
      {blobs(theme)}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "relative",
        }}
      >
        {identityRow(d, c.identityFont, c.avatarSize)}
        {yearPill(d, theme, c.yearPillFont)}
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: isPortrait ? 22 : c.blockGap === 56 ? 10 : 8,
          marginTop: isPortrait ? 100 : c.blockGap === 56 ? 56 : 28,
          position: "relative",
        }}
      >
        {personalityEyebrow(theme, c.eyebrowFont)}
        {personalityHeadline(d, theme, headlineFont, {
          wrap: Boolean(c.headlineWrap),
          width: c.headlineWrap?.width,
        })}
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: format === "square" ? "column" : "row",
          alignItems: format === "square" ? undefined : "flex-end",
          gap: isPortrait ? 32 : 28,
          marginTop: isPortrait ? 40 : 18,
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: isPortrait ? 32 : 20,
          }}
        >
          {bigNumber(d, theme, c.bigNumberFont)}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: isPortrait ? 8 : 4,
              paddingBottom: c.commitsPadBottom,
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: c.commitsLabelFont,
                color: "#d4d4d8",
                fontWeight: 500,
                lineHeight: isPortrait ? 1 : undefined,
              }}
            >
              commits
            </div>
            <div
              style={{
                display: "flex",
                fontSize: c.commitsSubFont,
                color: "#a1a1aa",
                lineHeight: isPortrait ? 1 : undefined,
              }}
            >
              across {d.activeDays} active days
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          marginTop: isPortrait ? 40 : format === "square" ? 24 : 14,
          position: "relative",
        }}
      >
        {weirdFactLine(d, theme, c.factFont)}
      </div>

      <div
        style={{
          display: "flex",
          flex: isPortrait ? 1 : undefined,
          flexDirection: "column",
          justifyContent: isPortrait ? "space-between" : undefined,
          gap: c.bodyGap,
          marginTop: c.bodyMarginTop,
          paddingBottom: isPortrait ? 8 : undefined,
          alignItems: format === "landscape" ? undefined : undefined,
          position: "relative",
        }}
      >
        {format === "landscape" ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", gap: 12 }}>
              {(d.topLang || d.topLang2) && langChips(d, c.langChipFont)}
            </div>
            <div
              style={{
                display: "flex",
                fontSize: c.taglineFont,
                color: "#71717a",
              }}
            >
              {TAGLINE}
            </div>
          </div>
        ) : (
          <>
            {(d.topLang || d.topLang2) && langChips(d, c.langChipFont)}
            {c.showTopRepoInBody &&
              topRepoLine(d, c.topRepoFont, c.topRepoStacked)}
            {c.showStatRowInBody && statRow(d, c.statFont, c.statMax)}
            <div
              style={{
                display: "flex",
                fontSize: c.taglineFont,
                color: "#71717a",
                marginTop: format === "square" ? 4 : 0,
              }}
            >
              {TAGLINE}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const format = parseShareFormat(params.get("format") ?? undefined);
  const data = readShareParams(params);
  const spec = getShareFormat(format);

  return new ImageResponse(renderCard(data, format), {
    width: spec.width,
    height: spec.height,
    headers: {
      "Cache-Control": "public, max-age=300, s-maxage=300",
    },
  });
}
