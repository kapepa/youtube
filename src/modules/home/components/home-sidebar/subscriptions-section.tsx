"use client"

import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import Link from "next/link";
import { FC } from "react";
import { usePathname } from "next/navigation";
import { trpc } from "@/trpc/client";
import { DEFAULT_LIMIT } from "@/constants";
import { ROUTERS } from "@/lib/routers";
import { UserAvatar } from "@/components/user-avatar";
import { LinkIcon } from "lucide-react";
import { SubscriptionItemSkeleton } from "@/modules/subscription/conponents/subscription-item";

const SubscriptionsSectionSkeleton: FC = () => {
  return (
    <div
      className="flex flex-col gap-4"
    >
      {
        Array.from({ length: 8 }).map((_, index) => (
          <SubscriptionItemSkeleton
            key={index}
          />
        ))
      }
    </div>
  )
}

const SubscriptionsSection: FC = () => {
  const pathname = usePathname();
  const { data, isLoading } = trpc.subscriptions.getMany.useInfiniteQuery({
    limit: DEFAULT_LIMIT,
  }, {
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })

  return (
    <SidebarGroup>
      <SidebarGroupLabel>
        Subscriptions
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {
            isLoading
            && <SubscriptionsSectionSkeleton />
          }
          {
            !isLoading && data?.pages
              .flatMap((page) => page.items)
              .map((subscription) => (
                <SidebarMenuItem
                  key={`${subscription.creatorId}-${subscription.viewerId}`}
                >
                  <SidebarMenuButton
                    tooltip={subscription.user.name}
                    asChild
                    isActive={pathname === `${ROUTERS.USERS}/${subscription.user.id}`}
                  >
                    <Link
                      href={`${ROUTERS.USERS}/${subscription.user.id}`}
                      className="flex items-center gap-4"
                    >
                      <UserAvatar
                        size="xs"
                        name={subscription.user.name}
                        imageUrl={subscription.user.imageUrl}
                      />
                      <span
                        className="text-sm"
                      >
                        {subscription.user.name}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))
          }
          {
            !isLoading && (
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === ROUTERS.SUBSCRIPTIONS}
                >
                  <Link
                    href={ROUTERS.SUBSCRIPTIONS}
                    className="flex items-center gap-4 cursor-pointer"
                  >
                    <LinkIcon
                      className="size-4"
                    />
                    <span
                      className="text-sm"
                    >
                      All subscriptions
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          }
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

export { SubscriptionsSection }