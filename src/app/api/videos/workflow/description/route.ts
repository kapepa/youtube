import { db } from "@/db";
import { videosTable } from "@/db/schema";
import { serve } from "@upstash/workflow/nextjs"
import { and, eq } from "drizzle-orm";

interface InputType {
  userId: string,
  videoId: string,
}

export const { POST } = serve(async (context) => {
  const input = context.requestPayload as InputType;
  const { userId, videoId } = input;

  const video = await context.run("get-video", async () => {
    const [existingVideo] = await db
      .select()
      .from(videosTable)
      .where(
        and(
          eq(videosTable.id, videoId),
          eq(videosTable.userId, userId),
        )
      );

    if (!existingVideo) throw new Error("Not found");

    return existingVideo;
  });

  const transcript = await context.run("get-transcript", async () => {
    const tracnkUrl = `https://strem.mux.com/${video.muxPaybackId}/text/${video.muxTrackId}.txt`;
    const response = await fetch(tracnkUrl);
    const text = response.text;

    if (!text) throw new Error("Bad request")

    return text;
  })

  const { body } = await context.api.openai.call(
    "generate-description",
    {
      token: process.env.OPENAI_API_KEY!,
      operation: "chat.completions.create",
      body: {
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "Assistant says 'hello!'",
          },
          {
            role: "user",
            content: transcript
          }
        ],
      },
    }
  );

  // await context.run("update-video", async () => {
  //   const description = body.choices[0]?.message.content;
  //   if (!title) throw new Error("Bad request")

  //   await db
  //     .update(videosTable)
  //     .set({
  //       description: description || video.description
  //     })
  //     .where(
  //       and(
  //         eq(videosTable.id, video.id),
  //         eq(videosTable.userId, video.userId),
  //       )
  //     )
  // });

});