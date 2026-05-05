export type PersonalityKey =
  | "streak-master"
  | "weekend-warrior"
  | "nine-to-fiver"
  | "seasonal"
  | "sprinter"
  | "marathoner"
  | "polyglot"
  | "specialist"
  | "balanced";

export type Personality = {
  key: PersonalityKey;
  label: string;
  tagline: string;
};

export type Theme = {
  hero: string;
  blobA: string;
  blobB: string;
  blobC: string;
  pillBg: string;
  pillBorder: string;
  pillText: string;
  accent: string;
};
