"use client"

import { trpc } from "@/trpc/client";
import { FC, Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { UserPageBanner, UserPageBannerSkeleton } from "../../components/user-page-banner";
import { UserPageInfo, UserPageInfoSkeleton } from "../../components/user-page-info";
import { Separator } from "@/components/ui/separator";


interface UserSectionProps {
  userId: string,
}

const UserSection: FC<UserSectionProps> = (props) => {
  return (
    <Suspense
      fallback={<UserSectionSkeleton />}
    >
      <ErrorBoundary
        fallback={<p>Error</p>}
      >
        <UserSectionSuspense
          {...props}
        />
      </ErrorBoundary>
    </Suspense>
  )
}

const UserSectionSkeleton: FC = () => {
  return (
    <div
      className=" flex flex-col"
    >
      <UserPageBannerSkeleton />
      <UserPageInfoSkeleton />
      <Separator />
    </div>
  )
}

const UserSectionSuspense: FC<UserSectionProps> = (props) => {
  const { userId } = props;
  const [user] = trpc.users.getOne.useSuspenseQuery({ id: userId });

  return (
    <div
      className="flex flex-col"
    >
      <UserPageBanner
        user={user}
      />
      <UserPageInfo
        user={user}
      />
      <Separator />
    </div>
  )
}

export { UserSection }