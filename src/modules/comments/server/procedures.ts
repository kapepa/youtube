import { db } from "@/db";
import { commentReactionsTable, commentsTable, usersTable } from "@/db/schema";
import { baseProcedure, createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { and, count, desc, eq, getTableColumns, inArray, isNotNull, isNull, lt, or } from "drizzle-orm";
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
      value: z.string(),
      videoId: z.string(),
      parentId: z.string().nullish(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { value, videoId, parentId } = input;
      const { id: userId } = ctx.user;

      const [existingComment] = await db
        .select()
        .from(commentsTable)
        .where(inArray(commentsTable.id, parentId ? [parentId] : []));

      if (!existingComment && parentId) throw new TRPCError({ code: "NOT_FOUND" });
      if (existingComment?.parentId && parentId) throw new TRPCError({ code: "BAD_REQUEST" });

      const [createdComment] = await db
        .insert(commentsTable)
        .values({ userId, videoId, parentId, value })
        .returning();

      return createdComment;
    }),
  getMany: baseProcedure
    .input(
      z.object({
        videoId: z.string().uuid(),
        parentId: z.string().nullish(),
        cursor: z.object({
          id: z.string().uuid(),
          updateAt: z.date(),
        }).nullish(),
        limit: z.number().min(1).max(100),
      })
    )
    .query(async ({ ctx, input }) => {
      let userId;
      const { videoId, parentId, cursor, limit } = input;
      const { clerkUserId } = ctx;

      const [user] = await db
        .select()
        .from(usersTable)
        .where(inArray(usersTable.clerkId, clerkUserId ? [clerkUserId] : []));

      if (user) userId = user.id;

      const viewerReactions = db.$with("viewer_reactions").as(
        db
          .select({
            commentId: commentReactionsTable.commentId,
            type: commentReactionsTable.type
          })
          .from(commentReactionsTable)
          .where(inArray(commentReactionsTable.userId, userId ? [userId] : []))
      )

      const replies = db.$with("replies").as(
        db
          .select({
            parentId: commentsTable.parentId,
            count: count(commentsTable.id).as("count")
          })
          .from(commentsTable)
          .where(isNotNull(commentsTable.parentId))
          .groupBy(commentsTable.parentId)
      )

      const [totalData] = await db
        .select({
          count: count(),
        })
        .from(commentsTable)
        .where(and(
          eq(commentsTable.videoId, videoId),
          isNull(commentsTable.parentId),
        ));

      const data = await db
        .with(
          viewerReactions, replies,
        )
        .select({
          ...getTableColumns(commentsTable),
          user: usersTable,
          viewerReaction: viewerReactions.type,
          replyCount: replies.count,
          likeCount: db.$count(
            commentReactionsTable,
            and(
              eq(commentReactionsTable.type, "like"),
              eq(commentReactionsTable.commentId, commentsTable.id)
            )
          ),
          dislikeCount: db.$count(
            commentReactionsTable,
            and(
              eq(commentReactionsTable.type, "dislike"),
              eq(commentReactionsTable.commentId, commentsTable.id)
            )
          )
        })
        .from(commentsTable)
        .where(
          and(
            eq(commentsTable.videoId, videoId),
            parentId
              ? eq(commentsTable.parentId, parentId)
              : isNull(commentsTable.parentId),
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
        .leftJoin(viewerReactions, eq(commentsTable.id, viewerReactions.commentId))
        .leftJoin(replies, eq(commentsTable.id, replies.parentId))
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