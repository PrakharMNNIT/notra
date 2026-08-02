"use client";

import { Linkedin02Icon, NewTwitterIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@notra/ui/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@notra/ui/components/ui/card";
import { TOP_POST_CONTENT_PREVIEW_LENGTH } from "@/constants/analytics";
import type { TopPostItem } from "@/types/analytics";
import { formatDayLabel, formatMetric } from "@/utils/analytics-charts";

interface TopPostsCardProps {
  posts: TopPostItem[];
}

function previewContent(content: string): string {
  const singleLine = content.replace(/\s+/g, " ").trim();
  if (singleLine.length <= TOP_POST_CONTENT_PREVIEW_LENGTH) {
    return singleLine;
  }
  return `${singleLine.slice(0, TOP_POST_CONTENT_PREVIEW_LENGTH)}…`;
}

function PostAvatar({ post }: { post: TopPostItem }) {
  const name = post.username ?? post.providerAccountId;
  return (
    <Avatar className="size-8 shrink-0">
      {post.profileImageUrl && (
        <AvatarImage alt={name} src={post.profileImageUrl} />
      )}
      <AvatarFallback className="text-[0.625rem]">
        {name.slice(0, 2).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
}

function PostRow({ post }: { post: TopPostItem }) {
  const body = (
    <div className="flex items-start gap-3">
      <PostAvatar post={post} />
      <div className="min-w-0 flex-1 space-y-1">
        <p className="flex items-center gap-1.5 text-muted-foreground text-xs">
          <HugeiconsIcon
            icon={
              post.provider === "linkedin" ? Linkedin02Icon : NewTwitterIcon
            }
            size={12}
          />
          {post.username ? `@${post.username}` : post.providerAccountId}
          <span>·</span>
          {formatDayLabel(post.postedAt.slice(0, 10))}
        </p>
        <p className="text-sm leading-snug">{previewContent(post.content)}</p>
        <p className="text-muted-foreground text-xs tabular-nums">
          {formatMetric(post.likes)} likes · {formatMetric(post.replies)}{" "}
          replies · {formatMetric(post.reposts)} reposts
          {post.impressions !== null &&
            ` · ${formatMetric(post.impressions)} impressions`}
        </p>
      </div>
      <span className="shrink-0 font-semibold text-sm tabular-nums">
        {formatMetric(post.engagement)}
      </span>
    </div>
  );

  if (post.url) {
    return (
      <a
        className="block rounded-md px-2 py-2.5 transition-colors hover:bg-muted/60"
        href={post.url}
        rel="noopener noreferrer"
        target="_blank"
      >
        {body}
      </a>
    );
  }
  return <div className="px-2 py-2.5">{body}</div>;
}

export function TopPostsCard({ posts }: TopPostsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top posts</CardTitle>
        <CardDescription>
          Ranked by likes, replies, and reposts from the latest sync
        </CardDescription>
      </CardHeader>
      <CardContent>
        {posts.length === 0 ? (
          <p className="flex h-40 items-center justify-center text-muted-foreground text-sm">
            No tracked posts yet
          </p>
        ) : (
          <div className="-mx-2 divide-y">
            {posts.map((post) => (
              <PostRow
                key={`${post.provider}:${post.platformPostId}`}
                post={post}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
