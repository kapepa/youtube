"use client"

import { InfinityScroll } from "@/components/infinity-scroll";
import { DEFAULT_LIMIT } from "@/constants";
import { useIsMobile } from "@/hooks/use-mobile";
import { VideoGridCard } from "@/modules/videos/components/video-grid-card";
import { VideoRowCard } from "@/modules/videos/components/video-row-card";
import { trpc } from "@/trpc/client";
import { FC } from "react";

interface ResultsSectionProps {
  query: string | undefined,
  categoryId: string | undefined,
}

const ResultsSection: FC<ResultsSectionProps> = (props) => {
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