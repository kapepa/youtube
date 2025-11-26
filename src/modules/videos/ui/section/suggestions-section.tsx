"use client"

import { DEFAULT_LIMIT } from "@/constants";
import { trpc } from "@/trpc/client";
import { FC } from "react";
import { VideoRowCard } from "../../components/video-row-card";
import { VideoGridCard } from "../../components/video-grid-card";
import { InfinityScroll } from "@/components/infinity-scroll";

interface SuggestionsSectionProps {
  videoId: string,
  isManual?: boolean,
}

const SuggestionsSection: FC<SuggestionsSectionProps> = (props) => {
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

export { SuggestionsSection }