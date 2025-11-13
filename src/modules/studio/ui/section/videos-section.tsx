"use client"

import { InfinityScroll } from "@/components/infinity-scroll";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DEFAULT_LIMIT } from "@/constants";
import { ROUTERS } from "@/lib/routers";
import { trpc } from "@/trpc/client";
import { useRouter } from "next/navigation";
import { FC, Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

const VideosSection: FC = () => {
  return (
    <Suspense
      fallback={<p>Loading</p>}
    >
      <ErrorBoundary
        fallback={<p>Error</p>}
      >
        <VideosSectionSuspense />
      </ErrorBoundary>
    </Suspense>
  )
}

const VideosSectionSuspense: FC = () => {
  const router = useRouter();
  const [videos, query] = trpc.studio.getMany.useSuspenseInfiniteQuery(
    { limit: DEFAULT_LIMIT },
    { getNextPageParam: (lastPage) => lastPage.nextCursor }
  )

  return (
    <div>
      <div
        className="border-y"
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="pl-6 w-[510px]"
              >
                Video
              </TableHead>
              <TableHead>
                Visibility
              </TableHead>
              <TableHead>
                Status
              </TableHead>
              <TableHead>
                Date
              </TableHead>
              <TableHead>
                Views
              </TableHead>
              <TableHead>
                Coments
              </TableHead>
              <TableHead
                className=" pr-6"
              >
                Likes
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {
              videos.pages.flatMap((page) => page.items).map((video) => (
                <TableRow
                  key={video.id}
                  className="cursor-pointer"
                  onClick={() => { router.push(`${ROUTERS.STUDIO_VIDEOS}/${video.id}`) }}
                >
                  <TableCell>
                    {video.title}
                  </TableCell>
                  <TableCell>
                    visibility
                  </TableCell>
                  <TableCell>
                    status
                  </TableCell>
                  <TableCell>
                    date
                  </TableCell>
                  <TableCell>
                    views
                  </TableCell>
                  <TableCell>
                    coments
                  </TableCell>
                  <TableCell>
                    likes
                  </TableCell>
                </TableRow>
              ))
            }
          </TableBody>
        </Table>
      </div>
      <InfinityScroll
        isManual
        hasNextPage={query.hasNextPage}
        fetchNextPage={query.fetchNextPage}
        isFetchingNextPage={query.isFetchingNextPage}
      />
    </div>
  )
}

export { VideosSection, VideosSectionSuspense }