import { FC, useMemo } from "react";
import { VideoGetOneOutput } from "../ui/types";
import { VideoOwner } from "./video-owner";
import { VideoReactions } from "./video-reactions";
import { VideoMenu } from "./video-menu";
import { VideoDescription } from "./video-description";
import { format, formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

interface VideoTopRowProps {
  video: VideoGetOneOutput
}

const VideoTopRowSkeleton: FC = () => {
  return (
    <div
      className="flex flex-col gap-4 mt-4"
    >
      <div
        className="flex flex-col gap-2"
      >
        <Skeleton
          className="h-6 w-4/5 md:w-2/5"
        />
      </div>
      <div
        className="flex items-center justify-between w-full"
      >
        <div
          className="flex items-center gap-3 w-[70%]"
        >
          <Skeleton
            className="w-10 h-10 rounded-full shrink-0"
          />
          <div
            className="flex flex-col gap-2 w-full"
          >
            <Skeleton
              className="h-5 w-4/5 md:w-2/6"
            />
            <Skeleton
              className="h-5 w-3/5 md:w-1/5"
            />
          </div>
          <Skeleton
            className="h-9 w-2/6 md:w-1/6 rounded-full"
          />
        </div>
        <div
          className="h-[120px] w-full"
        />
      </div>
    </div>
  )
}

const VideoTopRow: FC<VideoTopRowProps> = (props) => {
  const { video } = props;

  const compactViews = useMemo(() => {
    return Intl.NumberFormat("en", {
      notation: "compact"
    }).format(video.videoCount);
  }, [video.videoCount])

  const expandedViews = useMemo(() => {
    return Intl.NumberFormat("en", {
      notation: "standard"
    }).format(video.videoCount);
  }, [video.videoCount])

  const compactDate = useMemo(() => {
    return formatDistanceToNow(video.createdAt, { addSuffix: true });
  }, [video.createdAt])

  const expandedDate = useMemo(() => {
    return format(video.createdAt, "d MM yyyy");
  }, [video.createdAt])

  return (
    <div
      className="flex flex-col gap-4 mt-4"
    >
      <h1
        className="text-xl font-semibold"
      >
        {video.title}
      </h1>
      <div
        className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4"
      >
        <VideoOwner
          user={video.user}
          videoId={video.id}
        />
        <div
          className="flex overflow-x-auto sm:min-w-[calc(50%-6px)] sm:justify-end sm:overflow-visible pb-2 -mb-2 sm:pb-0 gap-2"
        >
          <VideoReactions
            likes={video.likeCount}
            dislikes={video.dislikeCount}
            videoId={video.id}
            viewerReaction={video.viewerReactions}
          />
          <VideoMenu
            videoId={video.id}
            variant="secondary"
          />
        </div>
      </div>
      <VideoDescription
        compactViews={compactViews}
        compactDate={compactDate}
        expandedViews={expandedViews}
        expandedDate={expandedDate}
        description={video.description}
      />
    </div>
  )
}

export { VideoTopRow, VideoTopRowSkeleton }