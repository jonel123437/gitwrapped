import { SHARE_FORMATS } from "@/lib/constants/share-formats.constants";
import type { ShareFormat } from "@/lib/types/share-formats.types";

export function parseShareFormat(value: string | undefined): ShareFormat {
  return value === "portrait" || value === "square" ? value : "landscape";
}

export function getShareFormat(id: ShareFormat) {
  return SHARE_FORMATS.find((f) => f.id === id) ?? SHARE_FORMATS[0];
}
