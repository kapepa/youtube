import { FC, useMemo } from "react";
import { VideoGetManyOutput } from "../ui/types";
import { formatDistanceToNow } from "date-fns";
import { ROUTERS } from "@/lib/routers";
import { UserAvatar } from "@/components/user-avatar";
import Link from "next/link";
import { UserInfo } from "@/modules/users/components/user-info";
import { VideoMenu } from "./video-menu";
import { Skeleton } from "@/components/ui/skeleton";

interface VideoInfoProps {
  data: VideoGetManyOutput["items"][number],
  onRemove?: () => void,
}

const VideoInfoSkeleton: FC = () => {
  return (
    <div
      className="flex gap-3"
    >
      <Skeleton
        className="size-10 shrink-0 rounded-full"
      />
      <div
        className="min-w-0 flex-1 space-y-2"
      >
        <Skeleton
          className="h-5 w-[90%]"
        />
        <Skeleton
          className="h-5 w-[70%]"
        />
      </div>
    </div>
  )
}

const VideoInfo: FC<VideoInfoProps> = (props) => {
  const { data, onRemove } = props;


  const compactViews = useMemo(() => {
    return Intl.NumberFormat("en", {
      notation: "compact",
    }).format(data.viewCount)
  }, [data.viewCount]);

  const compactDate = useMemo(() => {
    return formatDistanceToNow(data.createdAt, { addSuffix: true })
  }, [data.likeCount]);


  return (
    <div
      className="flex gap-3"
    >
      <Link
        href={`${ROUTERS.VIDEOS}/${data.user.id}`}
      >
        <UserAvatar />
      </Link>
      <div
        className="min-w-0 flex-1"
      >
        <Link
          href={`${ROUTERS.VIDEOS}/${data.id}`}
        >
          <h3
            className="font-medium line-clamp-1 lg:line-clamp-2 text-base wrap-break-word"
          >
            {data.title}
          </h3>
        </Link>
        <Link
          href={`${ROUTERS.VIDEOS}/${data.user.id}`}
        >
          <UserInfo
            name={data.user.name}
          />
        </Link>
        <Link
          href={`${ROUTERS.VIDEOS}/${data.id}`}
        >
          <p
            className="text-sm text-gray-600 line-clamp-1"
          >
            {compactViews} views • {compactDate}
          </p>
        </Link>
      </div>
      <div
        className="shrink-0"
      >
        <VideoMenu
          videoId={data.id}
          onRemove={onRemove}
        />
      </div>
    </div>
  )
}

export { VideoInfo, VideoInfoSkeleton }