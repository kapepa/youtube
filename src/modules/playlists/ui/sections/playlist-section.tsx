"use client"

import { InfinityScroll } from "@/components/infinity-scroll";
import { DEFAULT_LIMIT } from "@/constants";
import { VideoGridCardSkeleton } from "@/modules/videos/components/video-grid-card";
import { VideoRowCardSkeleton } from "@/modules/videos/components/video-row-card";
import { trpc } from "@/trpc/client";
import { FC, Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { PlaylistGridCard, PlaylistGridCardSkeleton } from "../../components/playlist-grid-card";

const PlaylistSection: FC = () => {
  return (
    <Suspense
      fallback={<PlaylistSectionSkeleton />}
    >
      <ErrorBoundary
        fallback={<p>Error</p>}
      >
        <PlaylistSectionSuspense />
      </ErrorBoundary>
    </Suspense>
  )
}

const PlaylistSectionSkeleton: FC = () => {
  return (
    <div
      className="gap-4 gap-y-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 [@media(min-width:1920px)]:grid-cols-5 [@media(min-width:2200px)]:grid-cols-6"
    >
      {
        Array.from({ length: 18 }).map((_, index) => (
          <PlaylistGridCardSkeleton
            key={index}
          />
        ))
      }
    </div>
  )
}

const PlaylistSectionSuspense: FC = () => {
  const [playlists, query] = trpc.playlists.getMany.useSuspenseInfiniteQuery({
    limit: DEFAULT_LIMIT
  }, {
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })

  return (
    <>
      <div
        className="fgap-4 gap-y-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 [@media(min-width:1920px)]:grid-cols-5 [@media(min-width:2200px)]:grid-cols-6"
      >
        {
          playlists.pages
            .flatMap((page) => page.items)
            .map((palylist) => (
              <PlaylistGridCard
                key={palylist.id}
                data={palylist}
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

export { PlaylistSection }