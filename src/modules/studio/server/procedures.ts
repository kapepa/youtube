import { db } from "@/db";
import { commentsTable, usersTable, videoReactionsTable, videosTable } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { eq, and, or, lt, desc, getTableColumns } from "drizzle-orm";
import { z } from "zod";

export const studioRouter = createTRPCRouter({
  getOne: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;
      const { id } = input;

      const [video] = await db
        .select()
        .from(videosTable)
        .where(
          and(
            eq(videosTable.id, id),
            eq(videosTable.userId, userId)
          )
        );

      if (!video) throw new TRPCError({ code: "NOT_FOUND" })

      return video;
    }),
  getMany: protectedProcedure
    .input(
      z.object({
        cursor: z.object({
          id: z.string().uuid(),
          updateAt: z.date(),
        }).nullish(),
        limit: z.number().min(1).max(100).default(20)
      })
    )
    .query(async ({ ctx, input }) => {
      const { cursor, limit } = input;
      const { id: userId } = ctx.user;

      const data = await db
        .select({
          ...getTableColumns(videosTable),
          viewCount: db.$count(videosTable, eq(videosTable.userId, usersTable.id)),
          commentCount: db.$count(commentsTable, eq(commentsTable.userId, usersTable.id)),
          likeCount: db.$count(videoReactionsTable, eq(videoReactionsTable.userId, usersTable.id)),
          user: usersTable,
        })
        .from(videosTable)
        .innerJoin(usersTable, eq(videosTable.userId, usersTable.id))
        .where(
          and(
            eq(videosTable.userId, userId),
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