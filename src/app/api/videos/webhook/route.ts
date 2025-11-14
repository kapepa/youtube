import { db } from "@/db";
import { videosTable } from "@/db/schema";
import { mux } from "@/lib/mux";
import { VideoAssetCreatedWebhookEvent, VideoAssetErroredWebhookEvent, VideoAssetReadyWebhookEvent, VideoAssetTrackReadyWebhookEvent } from "@mux/mux-node/resources/webhooks.mjs";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";

type WebhookEvent = VideoAssetCreatedWebhookEvent | VideoAssetReadyWebhookEvent | VideoAssetErroredWebhookEvent | VideoAssetTrackReadyWebhookEvent

const SIGNING_SECRET = process.env.MUX_WEBHOOK_SECRET;

export const POST = async (req: Request) => {
  try {
    if (!SIGNING_SECRET) throw new Error("MUX_WEBHOOK_SECRET is not set");
    const headersPayload = await headers();
    const muxSIgnature = headersPayload.get("mux-signature");

    if (!muxSIgnature) return new Response("No signature found", { status: 401 });

    const payload = await req.json();
    const body = JSON.stringify(payload);

    mux.webhooks.verifySignature(
      body,
      { "mux-signature": muxSIgnature }
    )

    switch (payload.type as WebhookEvent["type"]) {
      case "video.asset.created": {
        const data = payload.data as VideoAssetCreatedWebhookEvent["data"];
        if (!data.upload_id) return new Response("No upload ID found", { status: 400 });

        await db
          .update(videosTable)
          .set({
            muxAssetId: data.id,
            muxStatus: data.status,
          })
          .where(eq(videosTable.muxUploadId, data.upload_id));
        break;
      }
    }

    return new Response("Webhook received", { status: 200 });
  } catch (error) {

  }
}