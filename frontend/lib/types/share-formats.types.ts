export type ShareFormat = "landscape" | "square" | "portrait";

export type ShareFormatSpec = {
  id: ShareFormat;
  label: string;
  width: number;
  height: number;
  aspect: string;
  description: string;
  previewClass: string;
};
