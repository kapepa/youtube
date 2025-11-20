import { FC } from "react";
import { VideoGetOneOutput } from "../ui/types";
import { UserAvatar } from "@/components/user-avatar";
import Link from "next/link";
import { ROUTERS } from "@/lib/routers";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { SubscriptionButton } from "@/modules/subscription/conponents/subscription-button";
import { UserInfo } from "@/modules/users/components/user-info";

interface VideoOwnerProps {
  user: VideoGetOneOutput["user"],
  videoId: string,
}

const VideoOwner: FC<VideoOwnerProps> = (props) => {
  const { user, videoId } = props;
  const { userId: clerkUserId } = useAuth();

  return (
    <div
      className="flex items-center sm:items-start justify-between sm:justify-start gap-3 min-w-0"
    >
      <Link
        href={`${ROUTERS.USER}/${user.id}`}
      >
        <div
          className="flex items-center gap-3 min-w-0"
        >
          <UserAvatar
            size="lg"
            name={user.name}
            imageUrl={user.imageUrl}
          />
          <div
            className="flex flex-col gap-1 min-w-0"
          >
            <UserInfo
              size="lg"
              name={user.name}
            />
            <span
              className="text-sm text-muted-foreground line-clamp-1"
            >
              {0} subsribers
            </span>
          </div>
        </div>
      </Link>
      {
        clerkUserId === user.clerkId
          ? (
            <Button
              asChild
              variant="secondary"
              className="rounded-full"
            >
              <Link
                href={`${ROUTERS.STUDIO_VIDEOS}/${videoId}`}
              >
                Edit video
              </Link>
            </Button>
          )
          : (
            <SubscriptionButton
              disabled={false}
              onClick={() => { }}
              className="flex-none"
              isSubscribed={false}
            />
          )
      }
    </div>
  )
}

export { VideoOwner }