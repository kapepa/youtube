import { DEFAULT_LIMIT } from "@/constants";
import { VideoView } from "@/modules/videos/ui/views/video-view";
import { HydrateClient, trpc } from "@/trpc/server";
import { NextPage } from "next";

export const dynamic = "force-dynamic";

interface HomePageVideoIdProps {
  params: Promise<{ videoId: string }>
}

const HomePageVideoId: NextPage<HomePageVideoIdProps> = async (props) => {
  const { videoId } = await props.params;
  void trpc.videos.getOne.prefetch({ id: videoId });
  void trpc.comments.getMany.prefetchInfinite({ videoId, limit: DEFAULT_LIMIT });
  void trpc.suggestions.getMany.prefetchInfinite({ videoId, limit: DEFAULT_LIMIT });

  return (
    <HydrateClient>
      <VideoView
        videoId={videoId}
      />
    </HydrateClient>
  )
}

export default HomePageVideoId;