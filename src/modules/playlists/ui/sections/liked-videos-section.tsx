"use client"

import { InfinityScroll } from "@/components/infinity-scroll";
import { DEFAULT_LIMIT } from "@/constants";
import { VideoGridCard, VideoGridCardSkeleton } from "@/modules/videos/components/video-grid-card";
import { VideoRowCard, VideoRowCardSkeleton } from "@/modules/videos/components/video-row-card";
import { trpc } from "@/trpc/client";
import { FC, Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

const LikedVideosSection: FC = () => {
  return (
    <Suspense
      fallback={<LikedVideosSectionSkeleton />}
    >
      <ErrorBoundary
        fallback={<p>Error</p>}
      >
        <LikedVideosSectionSuspense />
      </ErrorBoundary>
    </Suspense>
  )
}

const LikedVideosSectionSkeleton: FC = (props) => {
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

const LikedVideosSectionSuspense: FC = (props) => {
  const [videos, query] = trpc.playLists.getHistory.useSuspenseInfiniteQuery({
    limit: DEFAULT_LIMIT
  }, {
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })

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

export { LikedVideosSection }