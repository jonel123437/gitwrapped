import type { ShareCardData } from "@/lib/types/share-card.types";
import type { ShareFormat } from "@/lib/types/share-formats.types";

export function buildShareParams(
  d: ShareCardData & { format: ShareFormat },
): URLSearchParams {
  return new URLSearchParams({
    username: d.username,
    name: d.name,
    avatar: d.avatar,
    year: d.year,
    commits: d.commits.toString(),
    prs: d.prs.toString(),
    reviews: d.reviews.toString(),
    streak: d.streak.toString(),
    total: d.total.toString(),
    topLang: d.topLang,
    topLang2: d.topLang2,
    topLang3: d.topLang3,
    activeDays: d.activeDays.toString(),
    bestMonth: d.bestMonth,
    topRepo: d.topRepo,
    topRepoCommits: d.topRepoCommits.toString(),
    personalityKey: d.personalityKey,
    personalityLabel: d.personalityLabel,
    personalityTagline: d.personalityTagline,
    format: d.format,
  });
}

export function readShareParams(params: URLSearchParams): ShareCardData {
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
    topRepoCommits: Number(params.get("topRepoCommits") ?? 0),
    personalityKey: params.get("personalityKey") ?? "balanced",
    personalityLabel: params.get("personalityLabel") ?? "Balanced Builder",
    personalityTagline:
      params.get("personalityTagline") ?? "steady, consistent, unbothered",
  };
}
