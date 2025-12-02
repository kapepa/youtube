import { db } from "@/db";
import { usersTable, videosTable } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError, UTApi } from "uploadthing/server";
import z from "zod";

const f = createUploadthing();

export const ourFileRouter = {
  bannerUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .middleware(async ({ input }) => {
      const { userId: clerkUserId } = await auth();
      if (!clerkUserId) throw new UploadThingError("Unauthorized");

      const [existingUser] = await db
        .select()
        .from(usersTable)
        .where(
          eq(usersTable.clerkId, clerkUserId)
        )

      if (!existingUser) throw new UploadThingError("Unauthorized");

      if (existingUser.bannerKey) {
        const utapi = new UTApi();

        await utapi.deleteFiles(existingUser.bannerKey);
        await db
          .update(usersTable)
          .set({
            bannerKey: null,
            bannerUrl: null,
          })
          .where(
            eq(usersTable.id, existingUser.id),
          )
      }

      return { userId: existingUser.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      await db
        .update(usersTable)
        .set({
          bannerUrl: file.ufsUrl,
          bannerKey: file.key,
        })
        .where(
          eq(usersTable.id, metadata.userId),
        )

      return { uploadedBy: metadata.userId };
    }),
  thumbnailUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .input(
      z.object({
        videoId: z.string().uuid()
      }
      ))
    .middleware(async ({ input }) => {
      const { userId: clerkUserId } = await auth();
      if (!clerkUserId) throw new UploadThingError("Unauthorized");

      const [user] = await db
        .select()
        .from(usersTable)
        .where(
          eq(usersTable.clerkId, clerkUserId)
        )

      if (!user) throw new UploadThingError("Unauthorized");

      const [existingVideo] = await db
        .select({
          thumbnailKey: videosTable.thumbnailKey,
        })
        .from(videosTable)
        .where(
          and(
            eq(videosTable.id, input.videoId),
            eq(videosTable.userId, user.id),
          )
        )

      if (!existingVideo) throw new UploadThingError("Not fround");

      if (existingVideo.thumbnailKey) {
        const utapi = new UTApi();

        await utapi.deleteFiles(existingVideo.thumbnailKey);
        await db
          .update(videosTable)
          .set({
            thumbnailKey: null,
            thumbnailUrl: null,
          })
          .where(
            and(
              eq(videosTable.id, input.videoId),
              eq(videosTable.userId, user.id),
            )
          )
      }

      return { user, ...input };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      await db
        .update(videosTable)
        .set({
          thumbnailUrl: file.ufsUrl,
          thumbnailKey: file.key,
        })
        .where(
          and(
            eq(videosTable.id, metadata.videoId),
            eq(videosTable.userId, metadata.user.id),
          )
        )

      return { uploadedBy: metadata.user.id };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
