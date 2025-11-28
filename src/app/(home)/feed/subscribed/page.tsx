import { DEFAULT_LIMIT } from "@/constants";
import { SubscribedView } from "@/modules/home/ui/views/subscribed-view";
import { HydrateClient, trpc } from "@/trpc/server";
import { NextPage } from "next";

export const dynamic = "force-dynamic"

const SubscribedPage: NextPage = async () => {
  void trpc.videos.getManySubscribed.prefetchInfinite({ limit: DEFAULT_LIMIT })

  return (
    <HydrateClient>
      <SubscribedView />
    </HydrateClient>
  )
}

export default SubscribedPage;