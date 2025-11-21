import { db } from "@/db";
import { videoViewsTable } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { and, eq } from "drizzle-orm";
import z from "zod";

export const videoViewsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ videoId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { videoId } = input;
      const { id: userId } = ctx.user;

      const [existingVideoView] = await db
        .select()
        .from(videoViewsTable)
        .where(
          and(
            eq(videoViewsTable.videoId, videoId),
            eq(videoViewsTable.userId, userId),
          )
        );

      if (existingVideoView) return existingVideoView;

      const [createdVideoView] = await db
        .insert(videoViewsTable)
        .values({ userId, videoId })
        .returning();

      return createdVideoView;
    })
})