import { FC } from "react";
import { UserGetOneOutput } from "../ui/types";
import { useClerk, useAuth } from "@clerk/nextjs";
import { UserAvatar } from "@/components/user-avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ROUTERS } from "@/lib/routers";
import { SubscriptionButton } from "@/modules/subscription/conponents/subscription-button";
import { useSubscription } from "@/modules/subscription/hooks/use-subscription";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface UserPageInfoProps {
  user: UserGetOneOutput,
}

const UserPageInfoSkeleton: FC = () => {
  return (
    <div
      className="py-6"
    >
      <div
        className="flex flex-col md:hidden"
      >
        <div
          className="flex items-center gap-3"
        >
          <Skeleton
            className="h-[60px] w-[60px] rounded-full"
          />
          <div
            className="flex-1 min-w-0"
          >
            <Skeleton
              className="h-6 w-32"
            />
            <Skeleton
              className="h-4 w-48 mt-1"
            />
          </div>
        </div>
        <Skeleton
          className="h-10 w-full mt-3 rounded-full"
        />
      </div>
      <div
        className="hidden md:flex items-start gap-4"
      >
        <Skeleton
          className="h-40 w-40 rounded-full"
        />
        <div
          className="flex-1 min-w-0"
        >
          <Skeleton
            className="h-8 w-64"
          />
          <Skeleton
            className="h-5 w-48 mt-4"
          />
          <Skeleton
            className="h-10 w-32 mt-3 rounded-full"
          />
        </div>
      </div>
    </div>
  )
}


const UserPageInfo: FC<UserPageInfoProps> = (props) => {
  const { user } = props;
  const { userId, isLoaded } = useAuth();
  const clerk = useClerk();
  const { onClick, isPending } = useSubscription({
    userId: user.id,
    isSubscribed: user.viewerSubscribed,
  })

  return (
    <div
      className="py-6"
    >
      <div
        className="flex flex-col md:hidden"
      >
        <div
          className="flex items-center gap-3"
        >
          <UserAvatar
            size="lg"
            name={user.name}
            imageUrl={user.imageUrl}
            onClick={() => {
              if (user.clerkId === userId) clerk.openUserProfile();

            }}
            className="h-[60px] w-[60px]"
          />
          <div
            className="flex-1 min-w-0"
          >
            <h1
              className="text-xl font-bold"
            >
              {user.name}
            </h1>
            <div
              className="flex items-center gap-1 text-xs text-muted-foreground mt-1"
            >
              <span>
                {user.viewerSubscribed} subscribers
              </span>
              <span>&bull;</span>
              <span>
                {user.videoCount} subscribers
              </span>
            </div>
          </div>
        </div>
        {
          userId === user.clerkId ? (
            <Button
              asChild
              variant="secondary"
              className="w-full mt-3 rounded-full"
            >
              <Link
                href={ROUTERS.STUDIO}
              >
                Go to studio
              </Link>
            </Button>
          ) : (
            <SubscriptionButton
              onClick={onClick}
              disabled={isPending || !isLoaded}
              className="w-full mt-3"
              isSubscribed={user.viewerSubscribed}
            />
          )
        }
      </div>
      <div
        className="hidden flex-col md:flex items-start gap-4"
      >
        <UserAvatar
          size="xl"
          name={user.name}
          imageUrl={user.imageUrl}
          onClick={() => {
            if (user.clerkId === userId) clerk.openUserProfile();
          }}
          className={cn(
            userId === user.clerkId && "cursor-pointer hover:opacity-80 transition-opacity duration-300"
          )}
        />
        <div
          className="flex-1 min-w-0"
        >
          <h1
            className="text-4xl font-bold"
          >
            {user.name}
          </h1>
          <div
            className="flex items-center gap-1 text-sm text-muted-foreground mt-3"
          >
            <span>
              {user.viewerSubscribed} subscribers
            </span>
            <span>&bull;</span>
            <span>
              {user.videoCount} subscribers
            </span>
          </div>
          {
            userId === user.clerkId ? (
              <Button
                asChild
                variant="secondary"
                className="mt-3 rounded-full"
              >
                <Link
                  href={ROUTERS.STUDIO}
                >
                  Go to studio
                </Link>
              </Button>
            ) : (
              <SubscriptionButton
                onClick={onClick}
                disabled={isPending || !isLoaded}
                className="mt-3"
                isSubscribed={user.viewerSubscribed}
              />
            )
          }
        </div>
      </div>
    </div>
  )
}

export { UserPageInfo, UserPageInfoSkeleton }