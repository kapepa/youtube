import { db } from "@/db";
import { usersTable, videoReactionsTable, videosTable, videoViewsTable } from "@/db/schema";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { eq, and, or, lt, desc, ilike, getTableColumns } from "drizzle-orm";
import { z } from "zod";

export const searchRouter = createTRPCRouter({
  getMany: baseProcedure
    .input(
      z.object({
        query: z.string().nullish(),
        categoryId: z.string().nullish(),
        cursor: z.object({
          id: z.string(),
          updateAt: z.date(),
        }).nullish(),
        limit: z.number().min(1).max(100).default(20)
      })
    )
    .query(async ({ input }) => {
      const { cursor, limit, query, categoryId } = input;

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
            eq(videosTable.visbility, "public"),
            ilike(videosTable.title, `%${query}%`),
            categoryId ? eq(videosTable.categoryId, categoryId) : undefined,
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