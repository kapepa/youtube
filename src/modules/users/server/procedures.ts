import { db } from "@/db";
import { subscriptionsTable, usersTable, videosTable } from "@/db/schema";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { eq, getTableColumns, inArray, isNotNull } from "drizzle-orm";
import z from "zod";

export const usersRouter = createTRPCRouter({
  getOne: baseProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      let userId;
      const { clerkUserId } = ctx;

      const [user] = await db
        .select()
        .from(usersTable)
        .where(inArray(usersTable.clerkId, clerkUserId ? [clerkUserId] : []))

      if (user) userId = user.id;

      const viewerSubscriptions = db.$with("viewer_subscriptions").as(
        db
          .select()
          .from(subscriptionsTable)
          .where(inArray(subscriptionsTable.viewerId, userId ? [userId] : []))
      )

      const [existingUser] = await db
        .with(viewerSubscriptions)
        .select({
          ...getTableColumns(usersTable),
          viewerSubscribed: isNotNull(viewerSubscriptions.viewerId).mapWith(Boolean),
          videoCount: db.$count(videosTable, eq(videosTable.userId, usersTable.id)),
        })
        .from(usersTable)
        .leftJoin(viewerSubscriptions, eq(viewerSubscriptions.creatorId, usersTable.id))
        .where(
          eq(usersTable.id, input.id)
        )

      if (!existingUser) throw new TRPCError({ code: "NOT_FOUND" });
      return existingUser;
    }),
})