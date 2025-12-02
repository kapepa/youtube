"use client"

import { InfinityScroll } from "@/components/infinity-scroll";
import { DEFAULT_LIMIT } from "@/constants";
import { VideoGridCard, VideoGridCardSkeleton } from "@/modules/videos/components/video-grid-card";
import { trpc } from "@/trpc/client";
import { FC, Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface VideosSectionProps {
  userId: string,
}

const VideosSection: FC<VideosSectionProps> = (props) => {
  return (
    <Suspense
      key={props.userId}
      fallback={<VideosSectionSkeleton />}
    >
      <ErrorBoundary
        fallback={<p>Error</p>}
      >
        <HomeVideosSectionSuspense
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
        className="gap-4 gap-y-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4"
      >
        {
          Array.from({ length: 18 }).map((_, index) => (
            <VideoGridCardSkeleton
              key={index}
            />
          ))
        }
      </div>
    </div>
  )
}

const HomeVideosSectionSuspense: FC<VideosSectionProps> = (props) => {
  const { userId } = props;
  const [videos, query] = trpc.videos.getMany.useSuspenseInfiniteQuery({
    userId, limit: DEFAULT_LIMIT
  }, {
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })

  return (
    <div>
      <div
        className="gap-4 gap-y-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4"
      >
        {
          videos.pages
            .flatMap(page => page.items)
            .map((video) => (
              <VideoGridCard
                key={video.id}
                data={video}
              />
            ))
        }
      </div>
      <InfinityScroll
        hasNextPage={query.hasNextPage}
        isFetchingNextPage={query.isFetchingNextPage}
        fetchNextPage={query.fetchNextPage}
      />
    </div>
  )
}

export { VideosSection }