import type { LeaderboardWindow } from "@/types/analytics";

export const ANALYTICS_TIMESERIES_DAYS = 30;
export const ANALYTICS_TOP_POSTS_LIMIT = 8;
export const TOP_POST_CONTENT_PREVIEW_LENGTH = 96;

export const LEADERBOARD_WINDOWS = [7, 30] as const;

export const ANALYTICS_PROVIDER_FILTER_VALUES = [
  "all",
  "twitter",
  "linkedin",
] as const;

export const ANALYTICS_PROVIDER_FILTERS = [
  { value: "all", label: "All platforms" },
  { value: "twitter", label: "X" },
  { value: "linkedin", label: "LinkedIn" },
] as const;

export const ACCOUNT_DETAIL_SERIES_KEY = "engagement";
export const ACCOUNT_DETAIL_MIN_POINTS = 2;
export const ACCOUNT_DETAIL_WINDOW: LeaderboardWindow = 30;
export const ACCOUNT_DETAIL_POSTS_LIMIT = 50;
export const ACCOUNT_POSTS_TABLE_HEIGHT = 288;
export const ACCOUNT_POSTS_PAGE_TABLE_HEIGHT = 620;

export const CONNECT_X_CLASS =
  "bg-[#0f1419] text-white hover:bg-[#0f1419]/90 dark:bg-white dark:text-[#0f1419] dark:hover:bg-white/90";

export const LEADERBOARD_PAGE_HEIGHT = 620;

export const CONNECT_LINKEDIN_CLASS =
  "bg-[#0a66c2] text-white hover:bg-[#0a66c2]/90";

export const ANALYTICS_TAB_VALUES = ["overview", "leaderboard"] as const;
