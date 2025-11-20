"use client"

import { cn } from "@/lib/utils";
import { trpc } from "@/trpc/client";
import { FC, Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { VideoPlayer } from "../../components/video-player";
import { VideoBanner } from "../../components/video-banner";
import { VideoTopRow } from "../../components/video-top-row";

interface VideoSectionProps {
  videoId: string
}

const VideoSection: FC<VideoSectionProps> = (props) => {
  const { videoId } = props;

  return (
    <Suspense
      fallback={<p>Loading...</p>}
    >
      <ErrorBoundary
        fallback={<p>Error</p>}
      >
        <VideoSectionSuspense
          videoId={videoId}
        />
      </ErrorBoundary>
    </Suspense>
  )
}

const VideoSectionSuspense: FC<VideoSectionProps> = (props) => {
  const { videoId } = props;
  const [video] = trpc.videos.getOne.useSuspenseQuery({ id: videoId })

  return (
    <>
      <div
        className={cn(
          "aspect-video bg-black rounded-xl overflow-hidden relative",
          video.muxStatus !== "ready" && "rounded-b-none",
        )}
      >
        <VideoPlayer
          autoPlay
          onPlay={() => { }}
          playbackId={video.muxPaybackId}
          thumbnailUrl={video.thumbnailUrl}
        />
      </div>
      <VideoBanner
        status={video.muxStatus}
      />
      <VideoTopRow
        video={video}
      />
    </>
  )
}

export { VideoSection }