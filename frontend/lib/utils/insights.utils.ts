import { MONTH_NAMES } from "@/lib/constants/insights.constants";
import type { ContributionDay } from "@/lib/types/github.types";

export function calcStreaks(days: ContributionDay[]) {
  let longest = 0;
  let run = 0;
  for (const d of days) {
    if (d.contributionCount > 0) {
      run += 1;
      if (run > longest) longest = run;
    } else {
      run = 0;
    }
  }
  let currentStreak = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].contributionCount > 0) currentStreak += 1;
    else break;
  }
  return { longest, currentStreak };
}

export function aggregateByTime(days: ContributionDay[]) {
  const monthTotals = new Map<number, number>();
  const weekdayCounts = [0, 0, 0, 0, 0, 0, 0];
  for (const d of days) {
    const dt = new Date(d.date);
    const m = dt.getUTCMonth();
    monthTotals.set(m, (monthTotals.get(m) ?? 0) + d.contributionCount);
    weekdayCounts[dt.getUTCDay()] += d.contributionCount;
  }
  let bestMonthIdx = 0;
  let bestMonthCount = -1;
  for (const [m, c] of monthTotals) {
    if (c > bestMonthCount) {
      bestMonthCount = c;
      bestMonthIdx = m;
    }
  }
  const bestMonth = bestMonthCount > 0 ? MONTH_NAMES[bestMonthIdx] : "";
  return { weekdayCounts, bestMonth, bestMonthCount };
}
