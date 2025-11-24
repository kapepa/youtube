"use client"

import { InfinityScroll } from "@/components/infinity-scroll";
import { Skeleton } from "@/components/ui/skeleton";
import { DEFAULT_LIMIT } from "@/constants";
import { CommentForm } from "@/modules/comments/components/comment-form";
import { CommentItem } from "@/modules/comments/components/comment-item";
import { trpc } from "@/trpc/client";
import { Loader2Icon } from "lucide-react";
import { FC, Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface CommentsSectionProps {
  videoId: string
}

const CommentsSection: FC<CommentsSectionProps> = (props) => {
  const { videoId } = props;

  return (
    <Suspense
      fallback={<CommentsSectionSkeleton />}
    >
      <ErrorBoundary
        fallback={<p>Error</p>}
      >
        <CommentsSectionSuspense
          videoId={videoId}
        />
      </ErrorBoundary>
    </Suspense>
  )
}

const CommentsSectionSkeleton: FC = () => {
  return (
    <div
      className="mt-6 flex justify-center items-center"
    >
      <Loader2Icon
        className="text-muted-foreground size-7 animate-spin"
      />
    </div>
  )
}

const CommentsSectionSuspense: FC<CommentsSectionProps> = (props) => {
  const { videoId } = props;
  const [comments, query] = trpc.comments.getMany.useSuspenseInfiniteQuery(
    { videoId, limit: DEFAULT_LIMIT },
    { getNextPageParam: (lastPage) => lastPage.nextCursor },
  );

  return (
    <div
      className="mt-6"
    >
      <div
        className="flex flex-col gap-6"
      >
        <h1>
          {comments.pages[0].totalCount} Comments
        </h1>
        <CommentForm
          videoId={videoId}
        />
      </div>
      <div
        className="flex flex-col gap-4 mt-2"
      >
        {
          comments.pages.flatMap((page) => page.items).map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
            />
          ))
        }
        <InfinityScroll
          isManual
          hasNextPage={query.hasNextPage}
          isFetchingNextPage={query.isFetchingNextPage}
          fetchNextPage={query.fetchNextPage}
        />
      </div>
    </div>
  )
}

export { CommentsSection, CommentsSectionSuspense }