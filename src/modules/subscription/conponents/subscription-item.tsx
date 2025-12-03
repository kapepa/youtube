import { UserAvatar } from "@/components/user-avatar";
import { FC } from "react";
import { SubscriptionButton } from "./subscription-button";
import { Skeleton } from "@/components/ui/skeleton";

interface SubscriptionItemProps {
  name: string
  disabled: boolean
  imageUrl: string
  onUnsubscribe: () => void
  subscriberCount: number
}

const SubscriptionItemSkeleton: FC = () => {
  return (
    <div
      className="flex items-start gap-4"
    >
      <Skeleton
        className="size-10 rounded-full"
      />
      <div
        className="flex-1"
      >
        <div
          className="flex items-center justify-between"
        >
          <div>
            <Skeleton
              className="h-4 w-24"
            />
            <Skeleton
              className="mt-1 h-3 w-20"
            />
          </div>
          <Skeleton
            className="h-8 w-20"
          />
        </div>
      </div>
    </div>
  )
}

const SubscriptionItem: FC<SubscriptionItemProps> = (props) => {
  const { name, disabled, imageUrl, onUnsubscribe, subscriberCount } = props;

  return (
    <div
      className="flex items-start gap-4"
    >
      <UserAvatar
        size="lg"
        name={name}
        imageUrl={imageUrl}
      />

      <div
        className="flex-1"
      >
        <div
          className="flex items-center justify-between"
        >
          <div>
            <h3
              className="text-sm"
            >
              {name}
            </h3>
            <p
              className="text-xs text-muted-foreground"
            >
              {subscriberCount.toLocaleString()} subscribers
            </p>
          </div>
          <SubscriptionButton
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              onUnsubscribe();
            }}
            disabled={disabled}
            isSubscribed
          />
        </div>
      </div>
    </div>
  )
}

export { SubscriptionItem, SubscriptionItemSkeleton }