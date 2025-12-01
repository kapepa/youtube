import { DEFAULT_LIMIT } from "@/constants";
import { VideosView } from "@/modules/playlists/ui/views/videos-view";
import { HydrateClient, trpc } from "@/trpc/server";
import { NextPage } from "next";

export const dynamic = "force-dynamic"

interface PlaylistIdPageProps {
  params: Promise<{
    playlistId: string
  }>
}

const PlaylistIdPage: NextPage<PlaylistIdPageProps> = async (props) => {
  const { playlistId } = await props.params;
  void trpc.playlists.getOne.prefetch({ id: playlistId });
  void trpc.playlists.getVideos.prefetchInfinite({ playlistId, limit: DEFAULT_LIMIT });

  return (
    <HydrateClient>
      <VideosView
        playlistId={playlistId}
      />
    </HydrateClient>
  )
}

export default PlaylistIdPage