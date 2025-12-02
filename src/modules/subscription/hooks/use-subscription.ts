import { trpc } from "@/trpc/client";
import { useClerk } from "@clerk/nextjs";
import { error } from "console";
import { toast } from "sonner";

interface useSubscriptionProps {
  userId: string,
  fromVideoId?: string,
  isSubscribed: boolean,
}

const useSubscription = (props: useSubscriptionProps) => {
  const { userId, fromVideoId, isSubscribed } = props;
  const clerk = useClerk();
  const utils = trpc.useUtils();

  const subscribe = trpc.subscriptions.create.useMutation({
    onSuccess: () => {
      toast.success("Subscribed");
      utils.videos.getManySubscribed.invalidate();
      utils.users.getOne.invalidate({ id: userId });

      if (fromVideoId) utils.videos.getOne.invalidate({ id: fromVideoId })
    },
    onError: (error) => {
      toast.error("Something went wrong")
      if (error.data?.code === "UNAUTHORIZED") clerk.openSignIn()
    }
  });
  const unsubscribe = trpc.subscriptions.remove.useMutation({
    onSuccess: () => {
      toast.success("Unsubscribed");
      utils.videos.getManySubscribed.invalidate();
      utils.users.getOne.invalidate({ id: userId });

      if (fromVideoId) utils.videos.getOne.invalidate({ id: fromVideoId })
    },
    onError: (error) => {
      toast.error("Something went wrong")
      if (error.data?.code === "UNAUTHORIZED") clerk.openSignIn()
    }
  });
  const isPending = subscribe.isPending || unsubscribe.isPending;

  const onClick = () => {
    if (isSubscribed) {
      unsubscribe.mutate({ userId })
    } else {
      subscribe.mutate({ userId })
    }
  }

  return { onClick, isPending }
}

export { useSubscription }