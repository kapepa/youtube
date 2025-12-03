import { DEFAULT_LIMIT } from "@/constants";
import { SubscriptionsView } from "@/modules/subscription/ui/views/subscriptions-view";
import { HydrateClient, trpc } from "@/trpc/server";
import { NextPage } from "next";

const SubscriptionsPage: NextPage = async () => {
  void trpc.subscriptions.getMany.prefetchInfinite({
    limit: DEFAULT_LIMIT,
  })

  return (
    <HydrateClient>
      <SubscriptionsView />
    </HydrateClient>
  )
}

export default SubscriptionsPage;