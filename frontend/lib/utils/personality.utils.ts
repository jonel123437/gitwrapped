import { THEMES } from "@/lib/constants/personality.constants";
import type {
  Personality,
  PersonalityKey,
  Theme,
} from "@/lib/types/personality.types";

export function themeFor(key: string): Theme {
  return THEMES[key as PersonalityKey] ?? THEMES.balanced;
}

export function detectPersonality(input: {
  longestStreak: number;
  weekendShare: number;
  weekdayShare: number;
  bestMonthShare: number;
  bestMonth: string;
  intensity: number;
  activeDays: number;
  numLangs: number;
  topLangShare: number;
  topLang: string;
}): Personality {
  const {
    longestStreak,
    weekendShare,
    weekdayShare,
    bestMonthShare,
    bestMonth,
    intensity,
    activeDays,
    numLangs,
    topLangShare,
    topLang,
  } = input;

  if (longestStreak >= 30) {
    return {
      key: "streak-master",
      label: "Streak Master",
      tagline: `${longestStreak} days in a row. relentless.`,
    };
  }
  if (weekendShare >= 0.35) {
    return {
      key: "weekend-warrior",
      label: "Weekend Warrior",
      tagline: `${Math.round(weekendShare * 100)}% of commits land on Sat/Sun`,
    };
  }
  if (weekdayShare >= 0.92 && activeDays >= 40) {
    return {
      key: "nine-to-fiver",
      label: "Nine-to-Fiver",
      tagline: "your weekends are commit-free",
    };
  }
  if (bestMonthShare >= 0.3 && bestMonth) {
    return {
      key: "seasonal",
      label: "Seasonal Coder",
      tagline: `${Math.round(bestMonthShare * 100)}% of the year happened in ${bestMonth}`,
    };
  }
  if (intensity >= 6) {
    return {
      key: "sprinter",
      label: "Sprinter",
      tagline: `${intensity.toFixed(1)} commits per active day`,
    };
  }
  if (activeDays >= 250) {
    return {
      key: "marathoner",
      label: "Marathoner",
      tagline: `${activeDays} active days · barely a day off`,
    };
  }
  if (numLangs >= 6) {
    return {
      key: "polyglot",
      label: "Polyglot",
      tagline: `${numLangs} languages shipped`,
    };
  }
  if (topLangShare >= 0.7 && topLang) {
    return {
      key: "specialist",
      label: "Specialist",
      tagline: `${Math.round(topLangShare * 100)}% all-in on ${topLang}`,
    };
  }
  return {
    key: "balanced",
    label: "Balanced Builder",
    tagline: "steady, consistent, unbothered",
  };
}
