import { db } from "@/db";
import { usersTable, videoReactionsTable, videosTable, videoViewsTable } from "@/db/schema";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { eq, and, or, lt, desc, getTableColumns } from "drizzle-orm";
import { z } from "zod";

export const suggestionsRouter = createTRPCRouter({
  getMany: baseProcedure
    .input(
      z.object({
        videoId: z.string().uuid(),
        cursor: z.object({
          id: z.string().uuid(),
          updateAt: z.date(),
        }).nullish(),
        limit: z.number().min(1).max(100).default(20)
      })
    )
    .query(async ({ input }) => {
      const { limit, cursor, videoId } = input;

      const [existingVideo] = await db
        .select()
        .from(videosTable)
        .where(
          eq(videosTable.id, videoId)
        )

      if (!existingVideo) throw new TRPCError({ code: "NOT_FOUND" })

      const data = await db
        .select({
          ...getTableColumns(videosTable),
          user: usersTable,
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
        .where(
          and(
            existingVideo.categoryId
              ? eq(videosTable.categoryId, existingVideo.categoryId)
              : undefined,
            cursor
              ? or(
                lt(videosTable.updateAt, cursor.updateAt),
                and(
                  eq(videosTable.updateAt, cursor.updateAt),
                  lt(videosTable.id, cursor.id),
                )
              )
              : undefined
          )
        )
        .orderBy(desc(videosTable.updateAt), desc(videosTable.id))
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
    })
});