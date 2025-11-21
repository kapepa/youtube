import { db } from "@/db";
import { usersTable, videoReactionsTable, videosTable, videoUpdateSchema, videoViewsTable } from "@/db/schema";
import { mux } from "@/lib/mux";
import { workflow } from "@/lib/qstash";
import { baseProcedure, createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { and, eq, getTableColumns, inArray } from "drizzle-orm";
import { UTApi } from "uploadthing/server";
import z from "zod";

export const videosRouter = createTRPCRouter({
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

      const viewerReactions = db.$with("viewer_reactions").as(
        db
          .select({
            videoId: videoReactionsTable.videoId,
            type: videoReactionsTable.type,
          })
          .from(videoReactionsTable)
          .where(inArray(videoReactionsTable.userId, userId ? [userId] : [])),
      );

      const [existingVideo] = await db
        .with(viewerReactions)
        .select({
          ...getTableColumns(videosTable),
          user: {
            ...getTableColumns(usersTable),
          },
          videoCount: db.$count(videoViewsTable, eq(videoViewsTable.videoId, videosTable.id)),
          likeCount: db.$count(videoReactionsTable,
            and(
              eq(videoReactionsTable.videoId, videosTable.id),
              eq(videoReactionsTable.type, "like"),
            )
          ),
          dislikeCount: db.$count(videoReactionsTable,
            and(
              eq(videoReactionsTable.videoId, videosTable.id),
              eq(videoReactionsTable.type, "dislike"),
            )
          ),
          viewerReactions: viewerReactions.type,
        })
        .from(videosTable)
        .innerJoin(usersTable, eq(videosTable.userId, usersTable.id))
        .leftJoin(viewerReactions, eq(viewerReactions.videoId, videosTable.id))
        .where(
          eq(videosTable.id, input.id)
        )
      // .groupBy(
      //   videosTable.id,
      //   usersTable.id,
      //   viewerReactions.type,
      // )

      if (!existingVideo) throw new TRPCError({ code: "NOT_FOUND" });
      return existingVideo;
    }),
  generateDescription: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;
      const { workflowRunId } = await workflow.trigger({
        url: `${process.env.QSTASH_URL}/api/videos/workflow/description`,
        body: { userId, videoId: input.id },
        retries: 3,
      })

      return workflowRunId
    }),
  generateTitle: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;
      const { workflowRunId } = await workflow.trigger({
        url: `${process.env.QSTASH_URL}/api/videos/workflow/title`,
        body: { userId, videoId: input.id },
        retries: 3,
      })

      return workflowRunId
    }),
  generateThumbnail: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;
      const { workflowRunId } = await workflow.trigger({
        url: `${process.env.QSTASH_URL}/api/videos/workflow/title`,
        body: { userId, videoId: input.id },
        retries: 3,
      })

      return workflowRunId
    }),
  restoreThumbnail: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;

      const [existingVideo] = await db
        .select()
        .from(videosTable)
        .where(
          and(
            eq(videosTable.id, input.id),
            eq(videosTable.userId, userId)
          )
        );

      if (!existingVideo) throw new TRPCError({ code: "NOT_FOUND" });

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
              eq(videosTable.id, input.id),
              eq(videosTable.userId, userId),
            )
          )
      }

      if (!existingVideo.muxPaybackId) throw new TRPCError({ code: "BAD_REQUEST" });

      const utapi = new UTApi();
      const tempThumbnailUrl = `http://image.mux.com/${existingVideo.muxPaybackId}/thumbnail.jpg`;
      const uploadedThumbnailUrl = await utapi.uploadFilesFromUrl(tempThumbnailUrl);
      if (!uploadedThumbnailUrl.data) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const { key: thumbnailKey, url: thumbnailUrl } = uploadedThumbnailUrl.data;

      const [updateVideo] = await db
        .update(videosTable)
        .set({ thumbnailUrl, thumbnailKey })
        .where(
          and(
            eq(videosTable.id, input.id),
            eq(videosTable.userId, userId)
          )
        )
        .returning();

      return updateVideo;
    }),
  remove: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;

      const [video] = await db
        .delete(videosTable)
        .where(
          and(
            eq(videosTable.id, input.id),
            eq(videosTable.userId, userId)
          )
        )
        .returning();


      if (!video) throw new TRPCError({ code: "NOT_FOUND" });

      return video;
    }),
  update: protectedProcedure
    .input(videoUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;

      if (!input.id) throw new Error("Video ID is required");

      const [video] = await db
        .update(videosTable)
        .set({
          title: input.title,
          description: input.description,
          categoryId: input.categoryId,
          visbility: input.visbility,
          updateAt: new Date(),
        })
        .where(and(
          eq(videosTable.id, input.id),
          eq(videosTable.userId, userId),
        ))
        .returning();

      if (!video) throw new TRPCError({ code: "NOT_FOUND" });

      return video
    }),
  create: protectedProcedure.mutation(async ({ ctx }) => {
    const { id: userId } = ctx.user;
    const upload = await mux.video.uploads.create({
      new_asset_settings: {
        passthrough: userId,
        playback_policies: ["public"],
        inputs: [
          {
            generated_subtitles: [
              {
                language_code: "en",
                name: "English",
              }
            ]
          }
        ]
      },
      cors_origin: "*"
    })

    const [video] = await db
      .insert(videosTable)
      .values({
        userId,
        title: "Untitled",
        muxStatus: "waiting",
        muxUploadId: upload.id
      })
      .returning();

    return {
      url: upload.url,
      video,
    };
  })
})