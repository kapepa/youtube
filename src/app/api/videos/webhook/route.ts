import { db } from "@/db";
import { videosTable } from "@/db/schema";
import { mux } from "@/lib/mux";
import { VideoAssetCreatedWebhookEvent, VideoAssetErroredWebhookEvent, VideoAssetReadyWebhookEvent, VideoAssetTrackReadyWebhookEvent, VideoAssetDeletedWebhookEvent } from "@mux/mux-node/resources/webhooks.mjs";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";

type WebhookEvent = VideoAssetCreatedWebhookEvent | VideoAssetReadyWebhookEvent | VideoAssetErroredWebhookEvent | VideoAssetTrackReadyWebhookEvent | VideoAssetDeletedWebhookEvent

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
      case "video.asset.ready": {
        const data = payload.data as VideoAssetReadyWebhookEvent["data"];
        const playbackId = data.playback_ids?.[0].id;

        if (!data.upload_id) return new Response("Missing upload ID", { status: 400 });
        if (!playbackId) return new Response("Missing playback ID", { status: 400 });

        const thumbnailUrl = `http://image.mux.com/${playbackId}/thumbnail.jpg`;
        const previewUrl = `http://image.mux.com/${playbackId}/animated.gif`;
        const duration = data.duration ? Math.round(data.duration * 1000) : 0;

        await db
          .update(videosTable)
          .set({
            muxStatus: data.status,
            muxPaybackId: playbackId,
            muxAssetId: data.id,
            thumbnailUrl,
            previewUrl,
            duration,
          })
          .where(eq(videosTable.muxUploadId, data.upload_id))
        break;
      }
      case "video.asset.errored": {
        const data = payload.data as VideoAssetErroredWebhookEvent["data"];
        if (!data.upload_id) return new Response("Missing upload ID", { status: 400 });

        await db
          .update(videosTable)
          .set({
            muxStatus: data.status,
          })
          .where(eq(videosTable.muxUploadId, data.upload_id))
        break;
      }
      case "video.asset.deleted": {
        const data = payload.data as VideoAssetDeletedWebhookEvent["data"];
        if (!data.upload_id) return new Response("Missing upload ID", { status: 400 });

        await db
          .delete(videosTable)
          .where(eq(videosTable.muxUploadId, data.upload_id))

        break;
      }
      case "video.asset.track.ready": {
        const data = payload.data as VideoAssetTrackReadyWebhookEvent["data"] & { asset_id: string };
        const assetId = data.asset_id;
        const trackId = data.id;
        const status = data.status;

        if (!assetId) return new Response("Missing asset ID", { status: 400 });

        await db
          .update(videosTable)
          .set({
            muxTrackId: trackId,
            muxTrackStatus: status,
          })
          .where(eq(videosTable.muxAssetId, assetId))
        break;
      }
    }

    return new Response("Webhook received", { status: 200 });
  } catch (error) {

  }
}