import type { ShareCardData } from "@/lib/types/share-card.types";
import type { ShareFormat } from "@/lib/types/share-formats.types";

export type Data = ShareCardData;

export function personalityPortraitSize(label: string): number {
  const longest = label
    .split(/\s+/)
    .reduce((max, w) => Math.max(max, w.length), 0);
  if (longest >= 11) return 130;
  if (longest >= 9) return 150;
  if (longest >= 8) return 165;
  if (longest >= 7) return 175;
  return 200;
}

export type LayoutConfig = {
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

export const LAYOUTS: Record<ShareFormat, LayoutConfig> = {
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
