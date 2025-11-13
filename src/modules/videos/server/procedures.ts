import { db } from "@/db";
import { videosTable } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";

export const videosRouter = createTRPCRouter({
  create: protectedProcedure.mutation(async ({ ctx }) => {
    const { id: userId } = ctx.user;
    // throw new TRPCError({ code: "BAD_REQUEST", message: "My error message!" })

    const [video] = await db
      .insert(videosTable)
      .values({ userId, title: "Untitled" })
      .returning();

    return { video };
  })
})