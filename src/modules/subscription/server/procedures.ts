import { DEFAULT_LIMIT } from "@/constants";
import { db } from "@/db";
import { subscriptionsTable, usersTable } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, getTableColumns, lt, or } from "drizzle-orm";
import z from "zod";

export const subscriptionsRouter = createTRPCRouter({
  getMany: protectedProcedure
    .input(
      z.object({
        cursor: z.object({
          creatorId: z.string(),
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
          ...getTableColumns(subscriptionsTable),
          user: {
            ...getTableColumns(usersTable),
            subscriberCount: db.$count(subscriptionsTable, eq(subscriptionsTable.creatorId, usersTable.id)),
          }
        })
        .from(subscriptionsTable)
        .innerJoin(usersTable, eq(subscriptionsTable.creatorId, usersTable.id))
        .where(
          and(
            eq(subscriptionsTable.viewerId, userId),
            cursor
              ? or(
                lt(subscriptionsTable.updateAt, cursor.updateAt),
                and(
                  eq(subscriptionsTable.updateAt, cursor.updateAt),
                  lt(subscriptionsTable.creatorId, cursor.creatorId),
                )
              )
              : undefined
          )
        )
        .orderBy(desc(subscriptionsTable.updateAt), desc(subscriptionsTable.creatorId))
        .limit(limit + 1);

      const hasMore = data.length > limit;
      const items = hasMore ? data.slice(0, -1) : data;
      const lastItem = items[items.length - 1];
      const nextCursor = hasMore && lastItem
        ? {
          creatorId: lastItem.creatorId,
          updateAt: lastItem.updateAt,
        }
        : null;

      return {
        items,
        nextCursor,
      };
    }),
  create: protectedProcedure
    .input(z.object({ userId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const { userId } = input;
      if (userId === ctx.user.id) throw new TRPCError({ code: "BAD_REQUEST" });

      const [createrSubscriptions] = await db
        .insert(subscriptionsTable)
        .values({
          viewerId: ctx.user.id,
          creatorId: userId,
        })
        .returning();

      return createrSubscriptions;
    }),
  remove: protectedProcedure
    .input(z.object({ userId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const { userId } = input;
      if (userId === ctx.user.id) throw new TRPCError({ code: "BAD_REQUEST" });

      const [deletedSubscriptions] = await db
        .delete(subscriptionsTable)
        .where(
          and(
            eq(subscriptionsTable.viewerId, ctx.user.id),
            eq(subscriptionsTable.creatorId, userId),
          )
        )
        .returning();

      return deletedSubscriptions;
    }),
})