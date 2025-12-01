import { DEFAULT_LIMIT } from "@/constants";
import { db } from "@/db";
import { playlistsTable, playlistVideosTable, usersTable, videoReactionsTable, videosTable, videoViewsTable } from "@/db/schema";
import { createTRPCRouter, protectedProcedure, baseProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, getTableColumns, lt, or, sql } from "drizzle-orm";
import z from "zod";

export const playListsRouter = createTRPCRouter({
  removeVideo: protectedProcedure
    .input(z.object({
      videoId: z.string().uuid(),
      playlistId: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { videoId, playlistId } = input;
      const { id: userId } = ctx.user;

      const [existingPlaylist] = await db
        .select()
        .from(playlistsTable)
        .where(
          and(
            eq(playlistsTable.id, playlistId),
            eq(playlistsTable.userId, userId),
          )
        );

      if (!existingPlaylist) throw new TRPCError({ code: "NOT_FOUND" });

      const [existingVideo] = await db
        .select()
        .from(videosTable)
        .where(eq(videosTable.id, videoId));

      if (!existingVideo) throw new TRPCError({ code: "NOT_FOUND" });

      const [existingPlaylistVideo] = await db
        .select()
        .from(playlistVideosTable)
        .where(
          and(
            eq(playlistVideosTable.playlistId, playlistId),
            eq(playlistVideosTable.videoId, videoId)
          )
        );

      if (!existingPlaylistVideo) throw new TRPCError({ code: "NOT_FOUND" });

      const [deletedPlaylistVideo] = await db
        .delete(playlistVideosTable)
        .where(
          and(
            eq(playlistVideosTable.playlistId, playlistId),
            eq(playlistVideosTable.videoId, videoId),
          )
        )
        .returning();

      return deletedPlaylistVideo;
    }),
  addVideo: protectedProcedure
    .input(z.object({
      videoId: z.string().uuid(),
      playlistId: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { videoId, playlistId } = input;
      const { id: userId } = ctx.user;

      const [existingPlaylist] = await db
        .select()
        .from(playlistsTable)
        .where(
          and(
            eq(playlistsTable.id, playlistId),
            eq(playlistsTable.userId, userId),
          )
        );

      if (!existingPlaylist) throw new TRPCError({ code: "NOT_FOUND" });

      const [existingVideo] = await db
        .select()
        .from(videosTable)
        .where(eq(videosTable.id, videoId));

      if (!existingVideo) throw new TRPCError({ code: "NOT_FOUND" });

      const [existingPlaylistVideo] = await db
        .select()
        .from(playlistVideosTable)
        .where(
          and(
            eq(playlistVideosTable.playlistId, playlistId),
            eq(playlistVideosTable.videoId, videoId)
          )
        );

      if (existingPlaylistVideo) throw new TRPCError({ code: "CONFLICT" });

      const [createdPlaylistVideo] = await db
        .insert(playlistVideosTable)
        .values({ playlistId, videoId })
        .returning();

      return createdPlaylistVideo;
    }),
  getManyForVideo: protectedProcedure
    .input(
      z.object({
        videoId: z.string(),
        cursor: z.object({
          id: z.string(),
          updateAt: z.date(),
        }).nullish(),
        limit: z.number().min(1).max(100).default(DEFAULT_LIMIT)
      })
    )
    .query(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;
      const { cursor, limit, videoId } = input;

      const data = await db
        .select({
          ...getTableColumns(playlistsTable),
          videoCount: db.$count(
            playlistVideosTable,
            eq(playlistVideosTable.playlistId, playlistsTable.id)
          ),
          user: usersTable,
          containsVideo: videoId
            ? sql<boolean>`(
            SELECT EXISTS (
              SELECT 1
              FROM ${playlistVideosTable} pv
              WHERE pv.playlist_id = ${playlistsTable.id} AND pv.video_id = ${videoId}
            )
          )`
            : sql<boolean>`false`
        })
        .from(playlistsTable)
        .innerJoin(usersTable, eq(playlistsTable.userId, usersTable.id))
        .where(
          and(
            eq(playlistsTable.userId, userId),
            cursor
              ? or(
                lt(playlistsTable.updateAt, cursor.updateAt),
                and(
                  eq(playlistsTable.updateAt, cursor.updateAt),
                  lt(playlistsTable.id, cursor.id),
                )
              )
              : undefined
          )
        )
        .orderBy(desc(playlistsTable.updateAt), desc(playlistsTable.id))
        .limit(limit + 1);

      const hasMore = data.length > limit;
      const items = hasMore ? data.slice(0, -1) : data;
      const lastItem = items[items.length - 1];
      const nextCursor = hasMore && lastItem
        ? {
          id: lastItem.id,
          updateAt: lastItem.updateAt,
        }
        : null;

      return {
        items,
        nextCursor,
      };
    }),
  getMany: protectedProcedure
    .input(
      z.object({
        cursor: z.object({
          id: z.string(),
          updateAt: z.date(),
        }).nullish(),
        limit: z.number().min(1).max(100).default(DEFAULT_LIMIT)
      })
    )
    .query(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;
      const { cursor, limit } = input;

      const data = await db
        .select({
          ...getTableColumns(playlistsTable),
          videoCount: db.$count(
            playlistVideosTable,
            eq(playlistVideosTable.playlistId, playlistsTable.id)
          ),
          user: usersTable,
          thumbnailUrl: sql<string | null>`(
            SELECT v.thumbnail_url
            FROM ${playlistVideosTable} pv
            JOIN ${videosTable} v ON v.id = pv.video_id
            WHERE pv.playlist_id = ${playlistsTable.id}
            ORDER BY pv.update_at DESC
            LIMIT 1
          )`
        })
        .from(playlistsTable)
        .innerJoin(usersTable, eq(playlistsTable.userId, usersTable.id))
        .where(
          and(
            eq(playlistsTable.userId, userId),
            cursor
              ? or(
                lt(playlistsTable.updateAt, cursor.updateAt),
                and(
                  eq(playlistsTable.updateAt, cursor.updateAt),
                  lt(playlistsTable.id, cursor.id),
                )
              )
              : undefined
          )
        )
        .orderBy(desc(playlistsTable.updateAt), desc(playlistsTable.id))
        .limit(limit + 1);

      const hasMore = data.length > limit;
      const items = hasMore ? data.slice(0, -1) : data;
      const lastItem = items[items.length - 1];
      const nextCursor = hasMore && lastItem
        ? {
          id: lastItem.id,
          updateAt: lastItem.updateAt,
        }
        : null;

      return {
        items,
        nextCursor,
      };
    }),
  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1)
    }))
    .mutation(async ({ ctx, input }) => {
      const { name } = input;
      const { id: userId } = ctx.user;

      const [createdPlaylist] = await db
        .insert(playlistsTable)
        .values({
          name,
          userId,
        })
        .returning();

      if (!createdPlaylist) throw new TRPCError({ code: "BAD_REQUEST" });
      return createdPlaylist;
    }),
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