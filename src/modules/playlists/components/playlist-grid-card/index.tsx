import { FC } from "react";
import { PlaylistGetManyOutput } from "../../types";
import Link from "next/link";
import { ROUTERS } from "@/lib/routers";
import { THUMBNAIL_FALLBACK } from "@/modules/videos/constants";
import { PlaylistThumbnail, PlaylistThumbnailSkeleton } from "./playlist-thumbnail";
import { PlaylistInfo, PlaylistInfoSkeleton } from "./playlist-info";

interface PlaylistGridCardProps {
  data: PlaylistGetManyOutput["items"][number],
}

const PlaylistGridCardSkeleton: FC = () => {
  return (
    <div
      className="flex flex-col gap-2 w-full group"
    >
      <PlaylistThumbnailSkeleton />
      <PlaylistInfoSkeleton />
    </div>
  )
}

const PlaylistGridCard: FC<PlaylistGridCardProps> = (props) => {
  const { data } = props;

  return (
    <Link
      href={`${ROUTERS.PLAYLISTS}/${data.id}`}
    >
      <div
        className="flex flex-col gap-2 w-full group"
      >
        <PlaylistThumbnail
          title={data.name}
          imageUrl={THUMBNAIL_FALLBACK}
          videoCount={data.videoCount}
        />
        <PlaylistInfo
          data={data}
        />
      </div>
    </Link>
  )
}

export { PlaylistGridCard, PlaylistGridCardSkeleton }