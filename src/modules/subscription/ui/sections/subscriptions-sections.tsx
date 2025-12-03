"use client"

import { InfinityScroll } from "@/components/infinity-scroll";
import { DEFAULT_LIMIT } from "@/constants";
import { ROUTERS } from "@/lib/routers";
import { VideoGridCard, VideoGridCardSkeleton } from "@/modules/videos/components/video-grid-card";
import { VideoRowCard, VideoRowCardSkeleton } from "@/modules/videos/components/video-row-card";
import { trpc } from "@/trpc/client";
import Link from "next/link";
import { FC, Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { toast } from "sonner";
import { SubscriptionItem } from "../../conponents/subscription-item";

const SubscriptionsSection: FC = () => {
  return (
    <Suspense
      fallback={<SubscriptionsSkeleton />}
    >
      <ErrorBoundary
        fallback={<p>Error</p>}
      >
        <SubscriptionsSectionSuspense />
      </ErrorBoundary>
    </Suspense>
  )
}

const SubscriptionsSkeleton: FC = () => {
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

const SubscriptionsSectionSuspense: FC = () => {
  const utils = trpc.useUtils();
  const [subscriptions, query] = trpc.subscriptions.getMany.useSuspenseInfiniteQuery({
    limit: DEFAULT_LIMIT
  }, {
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })

  const unsubscribe = trpc.subscriptions.remove.useMutation({
    onSuccess: (data) => {
      toast.success("Unsubscribed");
      utils.subscriptions.getMany.invalidate();
      utils.users.getOne.invalidate({ id: data.creatorId });
      utils.videos.getManySubscribed.invalidate()
    },
    onError: () => {
      toast.error("Something went wrong")
    }
  });

  return (
    <>
      <div
        className="flex flex-col gap-4"
      >
        {
          subscriptions.pages
            .flatMap(page => page.items)
            .map((subscription) => (
              <Link
                key={subscription.creatorId}
                href={`${ROUTERS.USERS}/${subscription.user.id}`}
              >
                <SubscriptionItem
                  name={subscription.user.name}
                  disabled={unsubscribe.isPending}
                  imageUrl={subscription.user.imageUrl}
                  onUnsubscribe={() => {
                    unsubscribe.mutate({ userId: subscription.creatorId });
                  }}
                  subscriberCount={subscription.user.subscriberCount}
                />
              </Link>
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

export { SubscriptionsSection }