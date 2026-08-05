"use client";

import { Linkedin02Icon, NewTwitterIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@notra/ui/components/ui/avatar";
import { useMemo } from "react";
import {
  InstrumentEmpty,
  InstrumentSection,
} from "@/components/instrument/instrument-module";
import { Table, type TableColumn } from "@/components/motion/table";
import { TABLE_ROW_HEIGHT } from "@/constants/table";
import type { TopPostItem, TopPostsCardProps } from "@/types/analytics";
import {
  formatDayLabel,
  formatMetric,
  previewPostContent,
} from "@/utils/analytics-charts";
import { tableHeightFor } from "@/utils/table";

function PostAvatar({ post }: { post: TopPostItem }) {
  const name = post.username ?? post.providerAccountId;
  return (
    <Avatar className="size-7 shrink-0">
      {post.profileImageUrl && (
        <AvatarImage alt={name} src={post.profileImageUrl} />
      )}
      <AvatarFallback className="text-[0.625rem]">
        {name.slice(0, 2).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
}

export function TopPostsCard({ posts }: TopPostsCardProps) {
  const columns = useMemo<TableColumn<TopPostItem>[]>(
    () => [
      {
        key: "account",
        header: "Account",
        width: "1.4fr",
        sortable: true,
        cell: (row) => (
          <span className="flex min-w-0 items-center gap-2">
            <PostAvatar post={row} />
            <span className="flex min-w-0 items-center gap-1.5 font-mono text-[0.6875rem] text-muted-foreground">
              <HugeiconsIcon
                icon={
                  row.provider === "linkedin" ? Linkedin02Icon : NewTwitterIcon
                }
                size={12}
              />
              <span className="truncate">
                {row.username ? `@${row.username}` : row.providerAccountId}
              </span>
            </span>
          </span>
        ),
        sortValue: (row) => row.username ?? row.providerAccountId,
      },
      {
        key: "content",
        header: "Post",
        width: "2.6fr",
        cell: (row) => (
          <span
            className="block truncate text-sm leading-snug"
            title={row.content}
          >
            {previewPostContent(row.content)}
          </span>
        ),
      },
      {
        key: "postedAt",
        header: "Posted",
        width: "7.5rem",
        sortable: true,
        cell: (row) => (
          <span className="whitespace-nowrap font-mono text-[0.6875rem] text-muted-foreground tabular-nums">
            {formatDayLabel(row.postedAt.slice(0, 10))}
          </span>
        ),
      },
      {
        key: "likes",
        header: "Likes",
        width: "5.625rem",
        align: "right",
        sortable: true,
        cell: (row) => (
          <span className="font-mono text-sm tabular-nums">
            {formatMetric(row.likes)}
          </span>
        ),
        sortValue: (row) => row.likes ?? 0,
      },
      {
        key: "replies",
        header: "Replies",
        width: "5.625rem",
        align: "right",
        sortable: true,
        cell: (row) => (
          <span className="font-mono text-sm tabular-nums">
            {formatMetric(row.replies)}
          </span>
        ),
        sortValue: (row) => row.replies ?? 0,
      },
      {
        key: "reposts",
        header: "Reposts",
        width: "5.625rem",
        align: "right",
        sortable: true,
        cell: (row) => (
          <span className="font-mono text-sm tabular-nums">
            {formatMetric(row.reposts)}
          </span>
        ),
        sortValue: (row) => row.reposts ?? 0,
      },
      {
        key: "impressions",
        header: "Impressions",
        width: "6.875rem",
        align: "right",
        sortable: true,
        cell: (row) => (
          <span className="font-mono text-muted-foreground text-sm tabular-nums">
            {row.impressions === null ? "-" : formatMetric(row.impressions)}
          </span>
        ),
        sortValue: (row) => row.impressions ?? 0,
      },
      {
        key: "engagement",
        header: "Engagement",
        width: "7.5rem",
        align: "right",
        sortable: true,
        cell: (row) => (
          <span className="font-mono text-sm tabular-nums">
            {formatMetric(row.engagement)}
          </span>
        ),
      },
    ],
    []
  );

  return (
    <InstrumentSection eyebrow="Top posts" readout="latest sync, by engagement">
      {posts.length === 0 ? (
        <InstrumentEmpty
          className="h-40"
          message="No tracked posts yet"
          seed="Top posts"
        />
      ) : (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between px-1 text-muted-foreground text-xs">
            <span>{posts.length.toLocaleString()} posts</span>
          </div>
          <Table
            className="rounded-2xl"
            columns={columns}
            data={posts}
            defaultSort={{ key: "engagement", direction: "desc" }}
            emptyState="No tracked posts yet"
            getRowId={(row) => `${row.provider}:${row.platformPostId}`}
            height={tableHeightFor(posts.length)}
            onRowClick={(row) => {
              if (row.url) {
                window.open(row.url, "_blank", "noopener,noreferrer");
              }
            }}
            resizable
            rowHeight={TABLE_ROW_HEIGHT}
          />
        </div>
      )}
    </InstrumentSection>
  );
}
