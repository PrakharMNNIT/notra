import {
  defineEndpoint,
  type InferOutputRow,
  type InferParams,
  node,
  p,
  t,
} from "@tinybirdco/sdk";

export const socialOverview = defineEndpoint("social_overview", {
  description:
    "Latest per-account snapshot with follower counts and lifetime engagement totals",
  params: {
    organization_id: p.string().describe("Organization id"),
  },
  nodes: [
    node({
      name: "latest_account_stats",
      sql: `
        SELECT
          provider,
          provider_account_id,
          argMax(account_id, captured_at) AS account_id,
          argMax(followers_count, captured_at) AS followers_count,
          argMax(following_count, captured_at) AS following_count,
          argMax(posts_count, captured_at) AS posts_count,
          max(captured_at) AS stats_captured_at
        FROM social_account_stats
        WHERE organization_id = {{String(organization_id)}}
        GROUP BY provider, provider_account_id
      `,
    }),
    node({
      name: "latest_post_stats",
      sql: `
        SELECT
          provider,
          provider_account_id,
          count() AS tracked_posts,
          sum(impressions) AS impressions,
          sum(likes) AS likes,
          sum(replies) AS replies,
          sum(reposts) AS reposts,
          sum(quotes) AS quotes,
          sum(bookmarks) AS bookmarks
        FROM (
          SELECT
            provider,
            provider_account_id,
            platform_post_id,
            argMax(impressions, captured_at) AS impressions,
            argMax(likes, captured_at) AS likes,
            argMax(replies, captured_at) AS replies,
            argMax(reposts, captured_at) AS reposts,
            argMax(quotes, captured_at) AS quotes,
            argMax(bookmarks, captured_at) AS bookmarks
          FROM social_post_stats
          WHERE organization_id = {{String(organization_id)}}
          GROUP BY provider, provider_account_id, platform_post_id
        )
        GROUP BY provider, provider_account_id
      `,
    }),
    node({
      name: "overview",
      sql: `
        SELECT
          accounts.provider AS provider,
          accounts.provider_account_id AS provider_account_id,
          argMax(accounts.account_id, accounts.captured_at) AS account_id,
          argMax(accounts.username, accounts.captured_at) AS username,
          argMax(accounts.display_name, accounts.captured_at) AS display_name,
          argMax(accounts.profile_image_url, accounts.captured_at) AS profile_image_url,
          argMax(accounts.verified, accounts.captured_at) AS verified,
          any(stats.followers_count) AS followers_count,
          any(stats.following_count) AS following_count,
          any(stats.posts_count) AS posts_count,
          any(posts.tracked_posts) AS tracked_posts,
          any(posts.impressions) AS impressions,
          any(posts.likes) AS likes,
          any(posts.replies) AS replies,
          any(posts.reposts) AS reposts,
          any(posts.quotes) AS quotes,
          any(posts.bookmarks) AS bookmarks,
          any(stats.stats_captured_at) AS stats_captured_at
        FROM social_accounts AS accounts
        LEFT JOIN latest_account_stats AS stats
          ON stats.provider = accounts.provider
          AND stats.provider_account_id = accounts.provider_account_id
        LEFT JOIN latest_post_stats AS posts
          ON posts.provider = accounts.provider
          AND posts.provider_account_id = accounts.provider_account_id
        WHERE accounts.organization_id = {{String(organization_id)}}
        GROUP BY accounts.provider, accounts.provider_account_id
        ORDER BY followers_count DESC NULLS LAST
      `,
    }),
  ],
  output: {
    provider: t.string(),
    provider_account_id: t.string(),
    account_id: t.string(),
    username: t.string(),
    display_name: t.string().nullable(),
    profile_image_url: t.string().nullable(),
    verified: t.bool(),
    followers_count: t.uint64().nullable(),
    following_count: t.uint64().nullable(),
    posts_count: t.uint64().nullable(),
    tracked_posts: t.uint64().nullable(),
    impressions: t.uint64().nullable(),
    likes: t.uint64().nullable(),
    replies: t.uint64().nullable(),
    reposts: t.uint64().nullable(),
    quotes: t.uint64().nullable(),
    bookmarks: t.uint64().nullable(),
    stats_captured_at: t.dateTime().nullable(),
  },
});

export const engagementTimeseries = defineEndpoint("engagement_timeseries", {
  description:
    "Daily post counts and engagement per account, attributed to each post's publish date",
  params: {
    organization_id: p.string().describe("Organization id"),
    days: p.int32().optional(30).describe("Number of trailing days"),
  },
  nodes: [
    node({
      name: "latest_post_metrics",
      sql: `
        SELECT
          provider,
          platform_post_id,
          argMax(impressions, captured_at) AS impressions,
          argMax(likes, captured_at) AS likes,
          argMax(replies, captured_at) AS replies,
          argMax(reposts, captured_at) AS reposts
        FROM social_post_stats
        WHERE organization_id = {{String(organization_id)}}
        GROUP BY provider, platform_post_id
      `,
    }),
    node({
      name: "post_days",
      sql: `
        SELECT
          provider,
          platform_post_id,
          argMax(provider_account_id, captured_at) AS provider_account_id,
          min(posted_at) AS first_posted_at
        FROM social_posts
        WHERE organization_id = {{String(organization_id)}}
          AND posted_at >= now() - INTERVAL {{Int32(days, 30)}} DAY
        GROUP BY provider, platform_post_id
      `,
    }),
    node({
      name: "daily_totals",
      sql: `
        SELECT
          toDate(posts.first_posted_at) AS day,
          posts.provider AS provider,
          posts.provider_account_id AS provider_account_id,
          count() AS posts,
          sum(stats.impressions) AS impressions,
          sum(stats.likes) AS likes,
          sum(stats.replies) AS replies,
          sum(stats.reposts) AS reposts
        FROM post_days AS posts
        LEFT JOIN latest_post_metrics AS stats
          ON stats.provider = posts.provider
          AND stats.platform_post_id = posts.platform_post_id
        GROUP BY day, provider, provider_account_id
        ORDER BY day ASC
      `,
    }),
  ],
  output: {
    day: t.date(),
    provider: t.string(),
    provider_account_id: t.string(),
    posts: t.uint64(),
    impressions: t.uint64().nullable(),
    likes: t.uint64().nullable(),
    replies: t.uint64().nullable(),
    reposts: t.uint64().nullable(),
  },
});

export const topPosts = defineEndpoint("top_posts", {
  description: "Best performing posts by latest engagement snapshot",
  params: {
    organization_id: p.string().describe("Organization id"),
    limit: p.int32().optional(10).describe("Number of posts"),
  },
  nodes: [
    node({
      name: "latest_stats",
      sql: `
        SELECT
          provider,
          platform_post_id,
          argMax(impressions, captured_at) AS impressions,
          argMax(likes, captured_at) AS likes,
          argMax(replies, captured_at) AS replies,
          argMax(reposts, captured_at) AS reposts,
          argMax(bookmarks, captured_at) AS bookmarks
        FROM social_post_stats
        WHERE organization_id = {{String(organization_id)}}
        GROUP BY provider, platform_post_id
      `,
    }),
    node({
      name: "ranked",
      sql: `
        SELECT
          posts.provider AS provider,
          posts.platform_post_id AS platform_post_id,
          argMax(posts.content, posts.captured_at) AS content,
          argMax(posts.url, posts.captured_at) AS url,
          argMax(posts.provider_account_id, posts.captured_at) AS provider_account_id,
          min(posts.posted_at) AS posted_at,
          any(stats.impressions) AS impressions,
          any(stats.likes) AS likes,
          any(stats.replies) AS replies,
          any(stats.reposts) AS reposts,
          any(stats.bookmarks) AS bookmarks,
          coalesce(any(stats.likes), 0)
            + coalesce(any(stats.replies), 0)
            + coalesce(any(stats.reposts), 0) AS engagement
        FROM social_posts AS posts
        LEFT JOIN latest_stats AS stats
          ON stats.provider = posts.provider
          AND stats.platform_post_id = posts.platform_post_id
        WHERE posts.organization_id = {{String(organization_id)}}
        GROUP BY posts.provider, posts.platform_post_id
        ORDER BY engagement DESC, posted_at DESC
        LIMIT {{Int32(limit, 10)}}
      `,
    }),
  ],
  output: {
    provider: t.string(),
    platform_post_id: t.string(),
    provider_account_id: t.string(),
    content: t.string(),
    url: t.string().nullable(),
    posted_at: t.dateTime(),
    impressions: t.uint64().nullable(),
    likes: t.uint64().nullable(),
    replies: t.uint64().nullable(),
    reposts: t.uint64().nullable(),
    bookmarks: t.uint64().nullable(),
    engagement: t.uint64(),
  },
});

export const postingPerformance = defineEndpoint("posting_performance", {
  description:
    "Post volume and average engagement grouped by weekday of publish",
  params: {
    organization_id: p.string().describe("Organization id"),
    days: p.int32().optional(90).describe("Number of trailing days"),
  },
  nodes: [
    node({
      name: "post_metrics",
      sql: `
        SELECT
          provider,
          platform_post_id,
          argMax(likes, captured_at) AS likes,
          argMax(replies, captured_at) AS replies,
          argMax(reposts, captured_at) AS reposts,
          argMax(impressions, captured_at) AS impressions
        FROM social_post_stats
        WHERE organization_id = {{String(organization_id)}}
        GROUP BY provider, platform_post_id
      `,
    }),
    node({
      name: "post_weekdays",
      sql: `
        SELECT
          provider,
          platform_post_id,
          toDayOfWeek(min(posted_at)) AS weekday
        FROM social_posts
        WHERE organization_id = {{String(organization_id)}}
          AND posted_at >= now() - INTERVAL {{Int32(days, 90)}} DAY
        GROUP BY provider, platform_post_id
      `,
    }),
    node({
      name: "weekday_totals",
      sql: `
        SELECT
          posts.weekday AS weekday,
          count() AS posts,
          sum(coalesce(stats.likes, 0) + coalesce(stats.replies, 0) + coalesce(stats.reposts, 0)) AS engagement,
          sum(stats.impressions) AS impressions,
          round(sum(coalesce(stats.likes, 0) + coalesce(stats.replies, 0) + coalesce(stats.reposts, 0)) / count(), 1) AS avg_engagement
        FROM post_weekdays AS posts
        LEFT JOIN post_metrics AS stats
          ON stats.provider = posts.provider
          AND stats.platform_post_id = posts.platform_post_id
        GROUP BY weekday
        ORDER BY weekday ASC
      `,
    }),
  ],
  output: {
    weekday: t.uint64(),
    posts: t.uint64(),
    engagement: t.uint64(),
    impressions: t.uint64().nullable(),
    avg_engagement: t.float64(),
  },
});

export type PostingPerformanceParams = InferParams<typeof postingPerformance>;
export type PostingPerformanceRow = InferOutputRow<typeof postingPerformance>;

export const followerGrowth = defineEndpoint("follower_growth", {
  description: "Daily follower counts per account",
  params: {
    organization_id: p.string().describe("Organization id"),
    days: p.int32().optional(30).describe("Number of trailing days"),
  },
  nodes: [
    node({
      name: "daily_followers",
      sql: `
        SELECT
          toDate(captured_at) AS day,
          provider,
          provider_account_id,
          argMax(followers_count, captured_at) AS followers_count
        FROM social_account_stats
        WHERE organization_id = {{String(organization_id)}}
          AND captured_at >= now() - INTERVAL {{Int32(days, 30)}} DAY
        GROUP BY day, provider, provider_account_id
        ORDER BY day ASC
      `,
    }),
  ],
  output: {
    day: t.date(),
    provider: t.string(),
    provider_account_id: t.string(),
    followers_count: t.uint64().nullable(),
  },
});

export type SocialOverviewParams = InferParams<typeof socialOverview>;
export type SocialOverviewRow = InferOutputRow<typeof socialOverview>;
export type EngagementTimeseriesParams = InferParams<
  typeof engagementTimeseries
>;
export type EngagementTimeseriesRow = InferOutputRow<
  typeof engagementTimeseries
>;
export type TopPostsParams = InferParams<typeof topPosts>;
export type TopPostsRow = InferOutputRow<typeof topPosts>;
export type FollowerGrowthParams = InferParams<typeof followerGrowth>;
export type FollowerGrowthRow = InferOutputRow<typeof followerGrowth>;

export const notraAdoption = defineEndpoint("notra_adoption", {
  description: "When the organization first published through Notra",
  params: {
    organization_id: p.string().describe("Organization id"),
  },
  nodes: [
    node({
      name: "adoption",
      sql: `
        SELECT
          min(captured_at) AS first_notra_post_at,
          count() AS notra_posts
        FROM social_post_sources
        WHERE organization_id = {{String(organization_id)}}
          AND source = 'notra'
      `,
    }),
  ],
  output: {
    first_notra_post_at: t.dateTime().nullable(),
    notra_posts: t.uint64(),
  },
});

export type NotraAdoptionRow = InferOutputRow<typeof notraAdoption>;
