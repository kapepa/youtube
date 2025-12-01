"use client"

import { InfinityScroll } from "@/components/infinity-scroll";
import { DEFAULT_LIMIT } from "@/constants";
import { VideoGridCard, VideoGridCardSkeleton } from "@/modules/videos/components/video-grid-card";
import { VideoRowCard, VideoRowCardSkeleton } from "@/modules/videos/components/video-row-card";
import { trpc } from "@/trpc/client";
import { FC, Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { toast } from "sonner";

interface VideosSectionSkeletonProps {
  playlistId: string
}

const VideosSection: FC<VideosSectionSkeletonProps> = (props) => {
  return (
    <Suspense
      fallback={<VideosSectionSkeleton />}
    >
      <ErrorBoundary
        fallback={<p>Error</p>}
      >
        <VideosSectionSuspense
          {...props}
        />
      </ErrorBoundary>
    </Suspense>
  )
}

const VideosSectionSkeleton: FC = () => {
  return (
    <div>
      <div
        className="flex flex-col gap-4 gap-y-10 md:hidden"
      >
        {
          Array.from({ length: 18 }).map((_, index) => (
            <VideoGridCardSkeleton
              key={index}
            />
          ))
        }
      </div>
      <div
        className="hidden flex-col gap-4 md:flex"
      >
        {
          Array.from({ length: 18 }).map((_, index) => (
            <VideoRowCardSkeleton
              key={index}
              size="compact"
            />
          ))
        }
      </div>
    </div>
  )
}

const VideosSectionSuspense: FC<VideosSectionSkeletonProps> = (props) => {
  const { playlistId } = props;
  const utils = trpc.useUtils();
  const [videos, query] = trpc.playlists.getVideos.useSuspenseInfiniteQuery({
    limit: DEFAULT_LIMIT, playlistId,
  }, {
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })

  const removeVideo = trpc.playlists.removeVideo.useMutation({
    onSuccess: (data) => {
      toast.success("Video removed from playlist");
      utils.playlists.getMany.invalidate();
      utils.playlists.getManyForVideo.invalidate({ videoId: data.videoId });
      utils.playlists.getOne.invalidate({ id: data.playlistId });
      utils.playlists.getVideos.invalidate({ playlistId: data.playlistId })
    },
    onError: () => {
      toast.error("Something went wrong")
    }
  });

  return (
    <>
      <div
        className="flex flex-col gap-4 gap-y-10 md:hidden"
      >
        {
          videos.pages
            .flatMap(page => page.items)
            .map((video) => (
              <VideoGridCard
                key={video.id}
                data={video}
                onRemove={() => removeVideo.mutate({ playlistId, videoId: video.id })}
              />
            ))
        }
      </div>
      <div
        className="hidden flex-col gap-4 gap-y-10 md:flex"
      >
        {
          videos.pages
            .flatMap(page => page.items)
            .map((video) => (
              <VideoRowCard
                key={video.id}
                data={video}
                size="compact"
                onRemove={() => removeVideo.mutate({ playlistId, videoId: video.id })}
              />
            ))
        }
      </div>
      <InfinityScroll
        hasNextPage={query.hasNextPage}
        isFetchingNextPage={query.isFetchingNextPage}
        fetchNextPage={query.fetchNextPage}
      />
    </>
  )
}

export { VideosSection }