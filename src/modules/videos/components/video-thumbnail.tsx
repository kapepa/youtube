import { formatDuration } from "@/lib/utils";
import Image from "next/image";
import { FC } from "react";
import { THUMBNAIL_FALLBACK } from "../constants";
import { Skeleton } from "@/components/ui/skeleton";

interface VideoThumbnailProps {
  title: string,
  duration: number,
  imageUrl?: string | null,
  previewUrl: string | null,
}

const VideoThumbnailSkeleton: FC = (props) => {

  return (
    <div
      className="relative w-full overflow-hidden rounded-xl aspect-video"
    >
      <Skeleton
        className="size-full"
      />
    </div>
  )
}

const VideoThumbnail: FC<VideoThumbnailProps> = (props) => {
  const { title, duration, imageUrl, previewUrl } = props;

  return (
    <div
      className="relative group"
    >
      <div
        className="relative w-full overflow-hidden rounded-xl aspect-video"
      >
        <Image
          src={imageUrl ?? THUMBNAIL_FALLBACK}
          alt={title}
          fill
          className="h-full w-full object-cover group-hover:opacity-0"
        />
        <Image
          src={previewUrl ?? THUMBNAIL_FALLBACK}
          alt={title}
          fill
          className="h-full w-full object-cover opacity-0 group-hover:opacity-100"
          unoptimized={!!previewUrl}
        />
      </div>

      <div
        className="absolute bottom-2 right-2 px-1 py-0.5 rounded bg-black/80 text-white text-xs font-medium"
      >
        {formatDuration(duration)}
      </div>
    </div>
  )
}

export { VideoThumbnail, VideoThumbnailSkeleton }