import { cva, VariantProps } from "class-variance-authority";
import { FC, useMemo } from "react";
import { VideoGetManyOutput } from "../ui/types";
import Link from "next/link";
import { ROUTERS } from "@/lib/routers";
import { VideoThumbnail } from "./video-thumbnail";
import { cn } from "@/lib/utils";
import { UserAvatar } from "@/components/user-avatar";
import { UserInfo } from "@/modules/users/components/user-info";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { VideoMenu } from "./video-menu";
import { Skeleton } from "@/components/ui/skeleton";

const videoRowCardVariants = cva("group flex min-w-0", {
  variants: {
    size: {
      default: "gap-4",
      compact: "gap-2",
    }
  },
  defaultVariants: {
    size: "default",
  }
});

const thumbnailVariants = cva("relative flex-none", {
  variants: {
    size: {
      default: "w-[38%]",
      compact: "w-[168px]",
    }
  },
  defaultVariants: {
    size: "default",
  }
});

interface VideoRowCardProps extends VariantProps<typeof videoRowCardVariants> {
  data: VideoGetManyOutput["items"][number],
  onRemove?: () => void,
};

const VideoRowCardSkeleton: FC = () => {
  return (
    <div>
      <Skeleton />
    </div>
  )
}

const VideoRowCard: FC<VideoRowCardProps> = (props) => {
  const { data, size, onRemove } = props;

  const compactViews = useMemo(() => {
    return Intl.NumberFormat("en", {
      notation: "compact",
    }).format(data.viewCount)
  }, [data.viewCount]);

  const compactLikes = useMemo(() => {
    return Intl.NumberFormat("en", {
      notation: "compact",
    }).format(data.likeCount)
  }, [data.likeCount]);

  return (
    <div
      className={videoRowCardVariants({ size })}
    >
      <Link
        href={`${ROUTERS.VIDEOS}/${data.id}`}
        className={thumbnailVariants({ size })}
      >
        <VideoThumbnail
          title={data.title}
          imageUrl={data.thumbnailUrl}
          duration={data.duration ?? 0}
          previewUrl={data.previewUrl}
        />
      </Link>

      <div
        className="flex-1 min-w-0"
      >
        <div
          className="flex justify-between gap-x-2"
        >
          <Link
            href={`${ROUTERS.VIDEOS}/${data.id}`}
            className="flex-1 min-w-0"
          >
            <h3
              className={cn(
                "font-medium line-clamp-2",
                size === "compact" ? "text-sm" : "text-base"
              )}
            >
              {data.title}
            </h3>
            {
              size === "default" && (
                <p
                  className="text-xs text-muted-foreground mt-1"
                >
                  {compactViews} views • {compactLikes} likes
                </p>
              )
            }
            {
              size === "default"
              && (
                <>
                  <div
                    className="flex items-center gap-2 my-3"
                  >
                    <UserAvatar
                      size="sm"
                      name={data.user.name}
                      imageUrl={data.user.imageUrl}
                    />
                    <UserInfo
                      size="sm"
                      name={data.user.name}
                    />
                  </div>
                  <Tooltip>
                    <TooltipTrigger
                      asChild
                    >
                      <p
                        className="text-xs text-muted-foreground w-fit line-clamp-2"
                      >

                      </p>
                    </TooltipTrigger>
                    <TooltipContent
                      side="bottom"
                      align="center"
                      className="bg-black/70"
                    >
                      <p>
                        Form
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </>
              )
            }
            {
              size === "compact" && (
                <p
                  className="text-xs text-muted-foreground mt-1"
                >
                  {compactViews} views • {compactLikes} likes
                </p>
              )
            }
            <div
              className="flex-none"
            >
              <VideoMenu
                videoId={data.id}
                onRemove={onRemove}
              />
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}

export { VideoRowCard, VideoRowCardSkeleton }