import { db } from "@/db";
import { commentsTable, usersTable } from "@/db/schema";
import { baseProcedure, createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { and, count, desc, eq, getTableColumns, lt, or } from "drizzle-orm";
import z from "zod";

export const commentsRouter = createTRPCRouter({
  remove: protectedProcedure
    .input(z.object({
      id: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id } = input;
      const { id: userId } = ctx.user;

      const [deletedComment] = await db
        .delete(commentsTable)
        .where(
          and(
            eq(commentsTable.id, id),
            eq(commentsTable.userId, userId)
          )
        )
        .returning();

      if (!deletedComment) throw new TRPCError({ code: "NOT_FOUND" });

      return deletedComment;
    }),
  create: protectedProcedure
    .input(z.object({
      videoId: z.string(),
      value: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { videoId, value } = input;
      const { id: userId } = ctx.user;

      const [createdComment] = await db
        .insert(commentsTable)
        .values({ userId, videoId, value })
        .returning();

      return createdComment;
    }),
  getMany: baseProcedure
    .input(
      z.object({
        videoId: z.string().uuid(),
        cursor: z.object({
          id: z.string().uuid(),
          updateAt: z.date(),
        }).nullish(),
        limit: z.number().min(1).max(100).default(1),
      })
    )
    .query(async ({ input }) => {
      const { videoId, cursor, limit } = input;

      const [totalData] = await db
        .select({
          count: count(),
        })
        .from(commentsTable)
        .where(eq(commentsTable.videoId, videoId));

      const data = await db
        .select({
          ...getTableColumns(commentsTable),
          user: usersTable,
        })
        .from(commentsTable)
        .where(
          and(
            eq(commentsTable.videoId, videoId),
            cursor
              ? or(
                lt(commentsTable.updateAt, cursor.updateAt),
                and(
                  eq(commentsTable.updateAt, cursor.updateAt),
                  lt(commentsTable.id, cursor.id),
                )
              )
              : undefined
          )
        )
        .innerJoin(usersTable, eq(commentsTable.userId, usersTable.id))
        .orderBy(desc(commentsTable.updateAt), desc(commentsTable.id))
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
        totalCount: totalData.count,
        nextCursor,
      };
    })
});