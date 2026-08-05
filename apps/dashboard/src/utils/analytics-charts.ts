import { TOP_POST_CONTENT_PREVIEW_LENGTH } from "@/constants/analytics";
import type {
  AccountSeriesRow,
  AnalyticsHeroSummary,
  EngagementTimeseriesPoint,
  FollowerGrowthPoint,
  LeaderboardDetailMetric,
  PostingPerformanceChartRow,
  PostingPerformancePoint,
  SocialOverviewAccount,
} from "@/types/analytics";
import { chartKey } from "@/utils/chart-keys";

const compactFormatter = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const dayLabelFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

const MS_PER_DAY = 86_400_000;
const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function formatMetric(value: number | null): string {
  if (value === null) {
    return "N/A";
  }
  return compactFormatter.format(value);
}

export function formatDayLabel(day: string): string {
  const date = new Date(`${day}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) {
    return day;
  }
  return dayLabelFormatter.format(date);
}

export function accountSeriesKey(
  provider: string,
  providerAccountId: string
): string {
  return chartKey(`${provider}-${providerAccountId}`);
}

export function buildTimelineDays(days: number): string[] {
  const today = new Date();
  const result: string[] = [];
  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = new Date(today.getTime() - offset * MS_PER_DAY);
    result.push(date.toISOString().slice(0, 10));
  }
  return result;
}

export function buildAccountSeriesRows(
  timelineDays: string[],
  accountKeys: string[],
  points: EngagementTimeseriesPoint[],
  metric: (point: EngagementTimeseriesPoint) => number
): AccountSeriesRow[] {
  const valuesByDay = new Map<string, Map<string, number>>();
  for (const point of points) {
    const key = accountSeriesKey(point.provider, point.providerAccountId);
    const dayValues = valuesByDay.get(point.day) ?? new Map<string, number>();
    dayValues.set(key, (dayValues.get(key) ?? 0) + metric(point));
    valuesByDay.set(point.day, dayValues);
  }

  return timelineDays.map((day) => {
    const row: AccountSeriesRow = { day: formatDayLabel(day), rawDay: day };
    const dayValues = valuesByDay.get(day);
    for (const key of accountKeys) {
      row[key] = dayValues?.get(key) ?? 0;
    }
    return row;
  });
}

export function markerLabelForDate(
  timelineDays: string[],
  isoDate: string | null
): string | null {
  if (!isoDate) {
    return null;
  }
  const day = isoDate.slice(0, 10);
  const first = timelineDays.at(0);
  const last = timelineDays.at(-1);
  if (!(first && last) || day > last) {
    return null;
  }
  if (day < first) {
    return null;
  }
  const index = timelineDays.indexOf(day);
  return index === -1 ? null : formatDayLabel(day);
}

export function sumMetric(
  accounts: SocialOverviewAccount[],
  metric: (account: SocialOverviewAccount) => number | null
): number | null {
  let total: number | null = null;
  for (const account of accounts) {
    const value = metric(account);
    if (value !== null) {
      total = (total ?? 0) + value;
    }
  }
  return total;
}

export function buildPostingPerformanceRows(
  points: PostingPerformancePoint[]
): PostingPerformanceChartRow[] {
  const byWeekday = new Map(points.map((point) => [point.weekday, point]));
  return WEEKDAY_LABELS.map((label, index) => {
    const point = byWeekday.get(index + 1);
    return {
      day: label,
      avgEngagement: point?.avgEngagement ?? 0,
      posts: point?.posts ?? 0,
    };
  });
}

const PERCENT = 100;

export function buildAnalyticsHeroSummary(
  accounts: SocialOverviewAccount[],
  points: EngagementTimeseriesPoint[]
): AnalyticsHeroSummary {
  const followers = sumMetric(accounts, (account) => account.followersCount);
  let impressions = 0;
  let interactions = 0;
  let posts = 0;
  for (const point of points) {
    impressions += point.impressions ?? 0;
    interactions +=
      (point.likes ?? 0) + (point.replies ?? 0) + (point.reposts ?? 0);
    posts += point.posts;
  }
  const engagementRate =
    impressions > 0 ? (interactions / impressions) * PERCENT : null;
  return { followers, impressions, interactions, posts, engagementRate };
}

const WHITESPACE_REGEX = /\s+/g;

export function previewPostContent(content: string): string {
  const singleLine = content.replace(WHITESPACE_REGEX, " ").trim();
  if (singleLine.length <= TOP_POST_CONTENT_PREVIEW_LENGTH) {
    return singleLine;
  }
  return `${singleLine.slice(0, TOP_POST_CONTENT_PREVIEW_LENGTH)}\u2026`;
}

export function leaderboardDetailMetrics(
  account: SocialOverviewAccount
): LeaderboardDetailMetric[] {
  const interactions =
    (account.likes ?? 0) + (account.replies ?? 0) + (account.reposts ?? 0);
  const engagementRate =
    account.impressions && account.impressions > 0
      ? `${((interactions / account.impressions) * PERCENT).toFixed(1)}%`
      : "N/A";
  return [
    { label: "Followers", value: formatMetric(account.followersCount) },
    { label: "Impressions", value: formatMetric(account.impressions) },
    { label: "Likes", value: formatMetric(account.likes) },
    { label: "Replies", value: formatMetric(account.replies) },
    { label: "Reposts", value: formatMetric(account.reposts) },
    { label: "Quotes", value: formatMetric(account.quotes) },
    { label: "Bookmarks", value: formatMetric(account.bookmarks) },
    { label: "Eng. rate", value: engagementRate },
  ];
}
