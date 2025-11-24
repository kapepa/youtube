import { db } from "@/db";
import { commentReactionsTable } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { and, eq } from "drizzle-orm";
import z from "zod";

export const commentReactionsRouter = createTRPCRouter({
  like: protectedProcedure
    .input(z.object({ commentId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { commentId } = input;
      const { id: userId } = ctx.user;

      const [existingCommentReactionsLike] = await db
        .select()
        .from(commentReactionsTable)
        .where(
          and(
            eq(commentReactionsTable.commentId, commentId),
            eq(commentReactionsTable.userId, userId),
            eq(commentReactionsTable.type, "like"),
          )
        );

      if (existingCommentReactionsLike) {
        const [deleteVideoVReactions] = await db
          .delete(commentReactionsTable)
          .where(
            and(
              eq(commentReactionsTable.userId, userId),
              eq(commentReactionsTable.commentId, commentId),
            )
          )
          .returning();

        return deleteVideoVReactions
      };

      const [createdCommentReactions] = await db
        .insert(commentReactionsTable)
        .values({ userId, commentId, type: "like" })
        .onConflictDoUpdate({
          target: [commentReactionsTable.userId, commentReactionsTable.commentId],
          set: {
            type: "like"
          }
        })
        .returning();

      return createdCommentReactions;
    }),
  dislike: protectedProcedure
    .input(z.object({ commentId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { commentId } = input;
      const { id: userId } = ctx.user;

      const [existingVideoVReactionsDislike] = await db
        .select()
        .from(commentReactionsTable)
        .where(
          and(
            eq(commentReactionsTable.commentId, commentId),
            eq(commentReactionsTable.userId, userId),
            eq(commentReactionsTable.type, "dislike"),
          )
        );

      if (existingVideoVReactionsDislike) {
        const [deleteVideoVReactions] = await db
          .delete(commentReactionsTable)
          .where(
            and(
              eq(commentReactionsTable.userId, userId),
              eq(commentReactionsTable.commentId, commentId),
            )
          )
          .returning();

        return deleteVideoVReactions
      };

      const [commentReactionsReactions] = await db
        .insert(commentReactionsTable)
        .values({ userId, commentId, type: "dislike" })
        .onConflictDoUpdate({
          target: [commentReactionsTable.userId, commentReactionsTable.commentId],
          set: {
            type: "dislike"
          }
        })
        .returning();

      return commentReactionsReactions;
    })
})