import type { Theme } from "@/lib/types/personality.types";
import type { Data } from "./_layouts";

function truncate(s: string, max: number) {
  return s.length > max ? `${s.slice(0, max - 1)}…` : s;
}

export function langChips(d: Data, fontSize: number) {
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
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      {langs.map((l, i) => (
        <div
          key={l}
          style={{
            display: "flex",
            alignItems: "center",
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

export function blobs(theme: Theme) {
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

export function yearPill(d: Data, theme: Theme, fontSize: number) {
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

export function personalityEyebrow(theme: Theme, fontSize: number) {
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

export function personalityHeadline(
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

export function bigNumber(d: Data, theme: Theme, fontSize: number) {
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

export function identityRow(d: Data, fontSize: number, avatarSize: number) {
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

export function weirdFactLine(d: Data, theme: Theme, fontSize: number) {
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

export function statRow(d: Data, fontSize: number, max = 4) {
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

export function topRepoLine(d: Data, fontSize: number, stacked = false) {
  if (!d.topRepo) return null;
  const icon = fontSize * 0.9;
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
      {d.topRepoCommits > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <svg
            width={icon}
            height={icon}
            viewBox="0 0 24 24"
            fill="none"
            stroke="#34d399"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ display: "flex" }}
          >
            <circle cx="12" cy="12" r="3" />
            <line x1="3" y1="12" x2="9" y2="12" />
            <line x1="15" y1="12" x2="21" y2="12" />
          </svg>
          <div style={{ display: "flex" }}>
            {d.topRepoCommits.toLocaleString()}
          </div>
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
