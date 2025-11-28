import { DEFAULT_LIMIT } from "@/constants";
import { db } from "@/db";
import { usersTable, videoReactionsTable, videosTable, videoViewsTable } from "@/db/schema";
import { createTRPCRouter, protectedProcedure, baseProcedure } from "@/trpc/init";
import { and, desc, eq, getTableColumns, lt, or } from "drizzle-orm";
import z from "zod";

export const playListsRouter = createTRPCRouter({
  getLiked: protectedProcedure
    .input(
      z.object({
        cursor: z.object({
          id: z.string(),
          likedAt: z.date(),
        }).nullish(),
        limit: z.number().min(1).max(100).default(DEFAULT_LIMIT)
      })
    )
    .query(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;
      const { cursor, limit } = input;

      const viewerVideoReactions = db.$with("viewer_video_reactions").as(
        db
          .select({
            videoId: videoReactionsTable.videoId,
            likedAt: videoReactionsTable.updateAt,
          })
          .from(videoReactionsTable)
          .where(and(
            eq(videoReactionsTable.userId, userId),
            eq(videoReactionsTable.type, "like"),
          ))
      )

      const data = await db
        .with(viewerVideoReactions)
        .select({
          ...getTableColumns(videosTable),
          user: usersTable,
          likedAt: viewerVideoReactions.likedAt,
          viewCount: db.$count(videoViewsTable, eq(videoViewsTable.videoId, videosTable.id)),
          likeCount: db.$count(videoReactionsTable, and(
            eq(videoReactionsTable.videoId, videosTable.id),
            eq(videoReactionsTable.type, "like")
          )),
          dislikeCount: db.$count(videoReactionsTable, and(
            eq(videoReactionsTable.videoId, videosTable.id),
            eq(videoReactionsTable.type, "dislike")
          )),
        })
        .from(videosTable)
        .innerJoin(usersTable, eq(videosTable.userId, usersTable.id))
        .innerJoin(viewerVideoReactions, eq(videosTable.id, viewerVideoReactions.videoId))
        .where(
          and(
            eq(videosTable.visbility, "public"),
            cursor
              ? or(
                lt(viewerVideoReactions.likedAt, cursor.likedAt),
                and(
                  eq(viewerVideoReactions.likedAt, cursor.likedAt),
                  lt(videosTable.id, cursor.id),
                )
              )
              : undefined
          )
        )
        .orderBy(desc(viewerVideoReactions.likedAt), desc(videosTable.id))
        .limit(limit + 1);

      const hasMore = data.length > limit;
      const items = hasMore ? data.slice(0, -1) : data;
      const lastItem = items[items.length - 1];
      const nextCursor = hasMore && lastItem
        ? {
          id: lastItem.id,
          likedAt: lastItem.likedAt,
        }
        : null;

      return {
        items,
        nextCursor,
      };
    }),
  getHistory: protectedProcedure
    .input(
      z.object({
        cursor: z.object({
          id: z.string(),
          viewedAt: z.date(),
        }).nullish(),
        limit: z.number().min(1).max(100).default(DEFAULT_LIMIT)
      })
    )
    .query(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;
      const { cursor, limit } = input;

      const viewerVideoViews = db.$with("viewer_video_views").as(
        db
          .select({
            videoId: videoViewsTable.videoId,
            viewedAt: videoViewsTable.createdAt,
          })
          .from(videoViewsTable)
          .where(
            eq(videoViewsTable.userId, userId),
          )
      )

      const data = await db
        .with(viewerVideoViews)
        .select({
          ...getTableColumns(videosTable),
          user: usersTable,
          viewedAt: viewerVideoViews.viewedAt,
          viewCount: db.$count(videoViewsTable, eq(videoViewsTable.videoId, videosTable.id)),
          likeCount: db.$count(videoReactionsTable, and(
            eq(videoReactionsTable.videoId, videosTable.id),
            eq(videoReactionsTable.type, "like")
          )),
          dislikeCount: db.$count(videoReactionsTable, and(
            eq(videoReactionsTable.videoId, videosTable.id),
            eq(videoReactionsTable.type, "dislike")
          )),
        })
        .from(videosTable)
        .innerJoin(usersTable, eq(videosTable.userId, usersTable.id))
        .innerJoin(viewerVideoViews, eq(videosTable.id, viewerVideoViews.videoId))
        .where(
          and(
            eq(videosTable.visbility, "public"),
            cursor
              ? or(
                lt(viewerVideoViews.viewedAt, cursor.viewedAt),
                and(
                  eq(viewerVideoViews.viewedAt, cursor.viewedAt),
                  lt(videosTable.id, cursor.id),
                )
              )
              : undefined
          )
        )
        .orderBy(desc(viewerVideoViews.viewedAt), desc(videosTable.id))
        .limit(limit + 1);

      const hasMore = data.length > limit;
      const items = hasMore ? data.slice(0, -1) : data;
      const lastItem = items[items.length - 1];
      const nextCursor = hasMore && lastItem
        ? {
          id: lastItem.id,
          viewedAt: lastItem.viewedAt,
        }
        : null;

      return {
        items,
        nextCursor,
      };
    }),
})