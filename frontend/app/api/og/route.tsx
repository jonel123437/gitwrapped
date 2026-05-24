import { ImageResponse } from "next/og";
import {
  parseShareFormat,
  getShareFormat,
} from "@/lib/utils/share-formats.utils";
import { themeFor } from "@/lib/utils/personality.utils";
import { readShareParams } from "@/lib/utils/share-card.utils";
import type { ShareFormat } from "@/lib/types/share-formats.types";
import { LAYOUTS, type Data } from "./_layouts";
import {
  blobs,
  yearPill,
  personalityEyebrow,
  personalityHeadline,
  bigNumber,
  identityRow,
  weirdFactLine,
  langChips,
  statRow,
  topRepoLine,
} from "./_components";

export const runtime = "edge";

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

// Satori (the engine behind @vercel/og) crashes if any style value is
// undefined — it does `.trim()` on every value as if it were a string.
// Strip undefined props before handing styles to JSX.
function prune<T extends object>(
  style: T,
): { [K in keyof T]-?: Exclude<T[K], undefined> } {
  const out: Record<string, unknown> = {};
  for (const k in style) {
    if (style[k] !== undefined) out[k] = style[k];
  }
  return out as { [K in keyof T]-?: Exclude<T[K], undefined> };
}

const TAGLINE = "git.wrapped — Spotify Wrapped, but for your code.";

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
        style={prune({
          display: "flex",
          flexDirection: format === "square" ? "column" : "row",
          alignItems: format === "square" ? undefined : "flex-end",
          gap: isPortrait ? 32 : 28,
          marginTop: isPortrait ? 40 : 18,
          position: "relative",
        })}
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
              style={prune({
                display: "flex",
                fontSize: c.commitsLabelFont,
                color: "#d4d4d8",
                fontWeight: 500,
                lineHeight: isPortrait ? 1 : undefined,
              })}
            >
              commits
            </div>
            <div
              style={prune({
                display: "flex",
                fontSize: c.commitsSubFont,
                color: "#a1a1aa",
                lineHeight: isPortrait ? 1 : undefined,
              })}
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

      {isPortrait ? (
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
          {(d.topLang || d.topLang2) && langChips(d, c.langChipFont)}
          {topRepoLine(d, c.topRepoFont, c.topRepoStacked)}
          {statRow(d, c.statFont, c.statMax)}
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
      ) : format === "square" ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 22,
            marginTop: "auto",
            position: "relative",
          }}
        >
          {(d.topLang || d.topLang2) && langChips(d, c.langChipFont)}
          {topRepoLine(d, c.topRepoFont)}
          {statRow(d, c.statFont)}
          <div
            style={{
              display: "flex",
              fontSize: c.taglineFont,
              color: "#71717a",
              marginTop: 4,
            }}
          >
            {TAGLINE}
          </div>
        </div>
      ) : (
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
      )}
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
