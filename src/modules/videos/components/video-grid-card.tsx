import { cva, VariantProps } from "class-variance-authority";
import { FC } from "react";
import { VideoGetManyOutput } from "../ui/types";
import Link from "next/link";
import { ROUTERS } from "@/lib/routers";
import { VideoThumbnail, VideoThumbnailSkeleton } from "./video-thumbnail";
import { VideoInfo, VideoInfoSkeleton } from "./video-info";

interface VideoGridCardProps {
  data: VideoGetManyOutput["items"][number],
  onRemove?: () => void,
};

const VideoGridCardSkeleton: FC = () => {
  return (
    <div
      className="flex flex-col gap-2 w-full"
    >
      <VideoThumbnailSkeleton />
      <VideoInfoSkeleton />
    </div>
  )
}

const VideoGridCard: FC<VideoGridCardProps> = (props) => {
  const { data, onRemove } = props;

  return (
    <div
      className="flex flex-col gap-2 w-full group"
    >
      <Link
        href={`${ROUTERS.VIDEOS}/${data.id}`}
      >
        <VideoThumbnail
          title={data.title}
          imageUrl={data.thumbnailUrl}
          duration={data.duration ?? 0}
          previewUrl={data.previewUrl}
        />
      </Link>
      <VideoInfo
        data={data}
        onRemove={onRemove}
      />
    </div>
  )
}

export { VideoGridCard, VideoGridCardSkeleton }