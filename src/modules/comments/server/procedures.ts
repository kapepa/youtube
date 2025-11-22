import { db } from "@/db";
import { commentsTable, usersTable } from "@/db/schema";
import { baseProcedure, createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { and, eq, getTableColumns } from "drizzle-orm";
import z from "zod";

export const commentsRouter = createTRPCRouter({
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
      })
    )
    .query(async ({ input }) => {
      const { videoId } = input;

      const data = await db
        .select({
          ...getTableColumns(commentsTable),
          user: usersTable,
        })
        .from(commentsTable)
        .where(
          eq(commentsTable.videoId, videoId)
        )
        .innerJoin(usersTable, eq(commentsTable.userId, usersTable.id));

      return data
    })
})