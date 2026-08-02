import type { DitherColor } from "@notra/ui/components/dither-kit/palette";

export const PROVIDER_DITHER_COLORS: Record<string, DitherColor> = {
  twitter: "grey",
  linkedin: "blue",
};

export const ACCOUNT_SERIES_COLORS: DitherColor[] = [
  "blue",
  "purple",
  "green",
  "orange",
  "pink",
  "red",
  "grey",
];

export const ANALYTICS_TIMESERIES_DAYS = 30;
export const ANALYTICS_TOP_POSTS_LIMIT = 8;
export const TOP_POST_CONTENT_PREVIEW_LENGTH = 96;
