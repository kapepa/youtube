"use client"

import { DEFAULT_LIMIT } from "@/constants";
import { trpc } from "@/trpc/client";
import { FC } from "react";

const VideosSection: FC = () => {
  const [data] = trpc.studio.getMany.useSuspenseInfiniteQuery(
    { limit: DEFAULT_LIMIT },
    { getNextPageParam: (lastPage) => lastPage.nextCursor }
  )

  return (
    <div>
      {JSON.stringify(data)}
    </div>
  )
}

export { VideosSection }