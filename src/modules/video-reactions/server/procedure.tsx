import { db } from "@/db";
import { videoReactionsTable } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { and, eq } from "drizzle-orm";
import z from "zod";

export const videoReactionsRouter = createTRPCRouter({
  like: protectedProcedure
    .input(z.object({ videoId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { videoId } = input;
      const { id: userId } = ctx.user;

      const [existingVideoVReactionsLike] = await db
        .select()
        .from(videoReactionsTable)
        .where(
          and(
            eq(videoReactionsTable.videoId, videoId),
            eq(videoReactionsTable.userId, userId),
            eq(videoReactionsTable.type, "like"),
          )
        );

      if (existingVideoVReactionsLike) {
        const [deleteVideoVReactions] = await db
          .delete(videoReactionsTable)
          .where(
            and(
              eq(videoReactionsTable.userId, userId),
              eq(videoReactionsTable.videoId, videoId),
            )
          )
          .returning();

        return deleteVideoVReactions
      };

      const [createdVideoReactions] = await db
        .insert(videoReactionsTable)
        .values({ userId, videoId, type: "like" })
        .onConflictDoUpdate({
          target: [videoReactionsTable.userId, videoReactionsTable.videoId],
          set: {
            type: "like"
          }
        })
        .returning();

      return createdVideoReactions;
    }),
  dislike: protectedProcedure
    .input(z.object({ videoId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { videoId } = input;
      const { id: userId } = ctx.user;

      const [existingVideoVReactionsDislike] = await db
        .select()
        .from(videoReactionsTable)
        .where(
          and(
            eq(videoReactionsTable.videoId, videoId),
            eq(videoReactionsTable.userId, userId),
            eq(videoReactionsTable.type, "dislike"),
          )
        );

      if (existingVideoVReactionsDislike) {
        const [deleteVideoVReactions] = await db
          .delete(videoReactionsTable)
          .where(
            and(
              eq(videoReactionsTable.userId, userId),
              eq(videoReactionsTable.videoId, videoId),
            )
          )
          .returning();

        return deleteVideoVReactions
      };

      const [createdVideoReactions] = await db
        .insert(videoReactionsTable)
        .values({ userId, videoId, type: "dislike" })
        .onConflictDoUpdate({
          target: [videoReactionsTable.userId, videoReactionsTable.videoId],
          set: {
            type: "dislike"
          }
        })
        .returning();

      return createdVideoReactions;
    })
})