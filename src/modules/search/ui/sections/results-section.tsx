"use client"

import { InfinityScroll } from "@/components/infinity-scroll";
import { DEFAULT_LIMIT } from "@/constants";
import { useIsMobile } from "@/hooks/use-mobile";
import { VideoGridCard, VideoGridCardSkeleton } from "@/modules/videos/components/video-grid-card";
import { VideoRowCard, VideoRowCardSkeleton } from "@/modules/videos/components/video-row-card";
import { trpc } from "@/trpc/client";
import { FC, Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface ResultsSectionProps {
  query: string | undefined,
  categoryId: string | undefined,
}

const ResultsSection: FC<ResultsSectionProps> = (props) => {
  const { query, categoryId } = props;

  return (
    <Suspense
      key={`${query}-${categoryId}`}
      fallback={<ResultsSectionSkeleton />}
    >
      <ErrorBoundary
        fallback={<p>Error</p>}
      >
        <ResultsSectionSuspense
          query={query}
          categoryId={categoryId}
        />
      </ErrorBoundary>
    </Suspense>
  )
}

const ResultsSectionSkeleton: FC = () => {
  return (
    <div>
      <div
        className="hidden flex-col gap-4 md:flex"
      >
        {
          Array.from({ length: 5 }).map((_, index) => (
            <VideoRowCardSkeleton
              key={index}
            />
          ))
        }
      </div>
      <div
        className="flex flex-col gap-4 gap-y-10 pt-6 md:hidden"
      >
        {
          Array.from({ length: 5 }).map((_, index) => (
            <VideoGridCardSkeleton
              key={index}
            />
          ))
        }
      </div>
    </div>
  )
}

const ResultsSectionSuspense: FC<ResultsSectionProps> = (props) => {
  const { query, categoryId } = props;
  const isMobile = useIsMobile();
  const [results, resultsQuery] = trpc.search.getMany.useSuspenseInfiniteQuery({
    query, limit: DEFAULT_LIMIT, categoryId
  }, {
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  return (
    <>
      {
        isMobile ? (
          <div
            className="flex flex-col gap-4 gap-y-10"
          >
            {
              results.pages
                .flatMap((page) => page.items)
                .map((video) => (
                  <VideoGridCard
                    key={video.id}
                    data={video}
                  />
                ))
            }
          </div>
        ) : (
          <div
            className="flex flex-col gap-4"
          >
            {
              results.pages
                .flatMap((page) => page.items)
                .map((video) => (
                  <VideoRowCard
                    key={video.id}
                    data={video}
                  />
                ))
            }
          </div>
        )
      }
      <InfinityScroll
        hasNextPage={resultsQuery.hasNextPage}
        isFetchingNextPage={resultsQuery.isFetchNextPageError}
        fetchNextPage={resultsQuery.fetchNextPage}
      />
    </>
  )
}

export { ResultsSection }