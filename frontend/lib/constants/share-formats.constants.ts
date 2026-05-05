import type { ShareFormatSpec } from "@/lib/types/share-formats.types";

export const SHARE_FORMATS: ShareFormatSpec[] = [
  {
    id: "landscape",
    label: "Landscape",
    width: 1200,
    height: 630,
    aspect: "1200×630",
    description: "Twitter, LinkedIn, and Open Graph previews. 1.91:1.",
    previewClass: "aspect-[1200/630]",
  },
  {
    id: "square",
    label: "Square",
    width: 1080,
    height: 1080,
    aspect: "1080×1080",
    description: "Best for the Instagram feed and LinkedIn posts. 1:1.",
    previewClass: "aspect-square mx-auto max-w-md",
  },
  {
    id: "portrait",
    label: "Portrait",
    width: 1080,
    height: 1920,
    aspect: "1080×1920",
    description: "Made for Instagram, TikTok, and Facebook stories. 9:16.",
    previewClass: "aspect-[1080/1920] mx-auto max-w-[260px] sm:max-w-[300px]",
  },
];
