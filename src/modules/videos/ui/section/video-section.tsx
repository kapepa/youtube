"use client"

import { cn } from "@/lib/utils";
import { trpc } from "@/trpc/client";
import { FC, Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { VideoPlayer, VideoPlayerSkeleton } from "../../components/video-player";
import { VideoBanner } from "../../components/video-banner";
import { VideoTopRow, VideoTopRowSkeleton } from "../../components/video-top-row";
import { useAuth } from "@clerk/nextjs";

interface VideoSectionProps {
  videoId: string
}

const VideoSection: FC<VideoSectionProps> = (props) => {
  const { videoId } = props;

  return (
    <Suspense
      fallback={<VideoSectionSuspenseSkeleton />}
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

const VideoSectionSuspenseSkeleton: FC = () => {
  return (
    <>
      <VideoPlayerSkeleton />
      <VideoTopRowSkeleton />
    </>
  )
}

const VideoSectionSuspense: FC<VideoSectionProps> = (props) => {
  const { videoId } = props;
  const { isSignedIn } = useAuth();
  const utils = trpc.useUtils();
  const [video] = trpc.videos.getOne.useSuspenseQuery({ id: videoId });
  const createView = trpc.videoViews.create.useMutation({
    onSuccess: () => {
      utils.videos.getOne.invalidate({ id: videoId });
    }
  })

  const handlerPlay = () => {
    if (!isSignedIn) return;
    createView.mutate({ videoId })
  }

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
          onPlay={handlerPlay}
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