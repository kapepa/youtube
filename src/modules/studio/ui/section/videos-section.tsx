"use client"

import { InfinityScroll } from "@/components/infinity-scroll";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DEFAULT_LIMIT } from "@/constants";
import { ROUTERS } from "@/lib/routers";
import { snakeCaseToTitle } from "@/lib/utils";
import { VideoThumbnail } from "@/modules/videos/components/video-thumbnail";
import { trpc } from "@/trpc/client";
import { useRouter } from "next/navigation";
import { FC, Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { format } from "date-fns";
import { Globe2Icon, LockIcon } from "lucide-react";

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
                    <div
                      className="flex items-center gap-4"
                    >
                      <div
                        className="relative aspect-video w-36 shrink-0"
                      >
                        <VideoThumbnail
                          title={video.title}
                          duration={video.duration || 0}
                          imageUrl={video.thumbnailUrl}
                          previewUrl={video.previewUrl}
                        />
                      </div>
                      <div
                        className="flex flex-col overflow-hidden gap-y-1"
                      >
                        <span
                          className="text-sm line-clamp-1"
                        >
                          {video.title}
                        </span>
                        <span
                          className="text-xs text-muted-foreground line-clamp-1"
                        >
                          {video.description || "No description"}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div
                      className="flex items-center"
                    >
                      {
                        video.visbility === "private"
                          ? (
                            <LockIcon
                              className="size-4 mr-2"
                            />
                          )
                          : (
                            <Globe2Icon
                              className="size-4 mr-2"
                            />
                          )
                      }
                      {snakeCaseToTitle(video.visbility)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div
                      className="flex items-center"
                    >
                      {snakeCaseToTitle(video.muxStatus || "error")}
                    </div>
                  </TableCell>
                  <TableCell
                    className="text-sm truncate"
                  >
                    {format(new Date(video.createdAt), "d MMM yyyy")}
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