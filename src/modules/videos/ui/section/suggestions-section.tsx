"use client"

import { DEFAULT_LIMIT } from "@/constants";
import { trpc } from "@/trpc/client";
import { FC, Suspense } from "react";
import { VideoRowCard, VideoRowCardSkeleton } from "../../components/video-row-card";
import { VideoGridCard, VideoGridCardSkeleton } from "../../components/video-grid-card";
import { InfinityScroll } from "@/components/infinity-scroll";
import { ErrorBoundary } from "react-error-boundary";

interface SuggestionsSectionProps {
  videoId: string,
  isManual?: boolean,
}

const SuggestionsSection: FC<SuggestionsSectionProps> = (props) => {
  const { videoId, isManual } = props;

  return (
    <Suspense
      fallback={<SuggestionsSectionSkeleton />}
    >
      <ErrorBoundary
        fallback={<p>Error</p>}
      >
        <SuggestionsSectionSuspense
          videoId={videoId}
          isManual={isManual}
        />
      </ErrorBoundary>
    </Suspense>
  )
}

const SuggestionsSectionSkeleton: FC = () => {
  return (
    <>
      <div
        className="hidden md:block space-y-3"
      >
        {
          Array.from({ length: 6 }).map((_, inddex) => (
            <VideoRowCardSkeleton
              key={inddex}
              size="compact"
            />
          ))
        }
      </div>
      <div
        className="block md:hidden space-y-10"
      >
        {
          Array.from({ length: 6 }).map((_, index) => (
            <VideoGridCardSkeleton
              key={index}
            />
          ))
        }
      </div>
    </>
  )
}

const SuggestionsSectionSuspense: FC<SuggestionsSectionProps> = (props) => {
  const { videoId, isManual } = props;
  const [suggestions, query] = trpc.suggestions.getMany.useSuspenseInfiniteQuery({
    limit: DEFAULT_LIMIT,
    videoId,
  }, {
    getNextPageParam: (lastPage) => lastPage.nextCursor
  })

  return (
    <>
      <div
        className="hidden md:block space-y-3"
      >
        {
          suggestions.pages.flatMap((page) => page.items.map((video) => (
            <VideoRowCard
              key={video.id}
              data={video}
              size="compact"
            />
          )))
        }
      </div>
      <div
        className="block md:hidden space-y-10"
      >
        {
          suggestions.pages.flatMap((page) => page.items.map((video) => (
            <VideoGridCard
              key={video.id}
              data={video}
            />
          )))
        }
      </div>
      <InfinityScroll
        isManual={isManual}
        hasNextPage={query.hasNextPage}
        isFetchingNextPage={query.isFetchingNextPage}
        fetchNextPage={query.fetchNextPage}
      />
    </>
  )
}

export { SuggestionsSection, SuggestionsSectionSuspense, SuggestionsSectionSkeleton }