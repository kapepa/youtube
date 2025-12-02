import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { VideoReactions as VideoReactionsTable } from '@/db/schema';
import { cn } from "@/lib/utils";
import { trpc } from "@/trpc/client";
import { useClerk } from "@clerk/nextjs";
import { ThumbsDownIcon, ThumbsUpIcon } from "lucide-react";
import { FC } from "react";
import { toast } from "sonner";

type ReactionType = VideoReactionsTable["type"]

interface VideoReactionsProps {
  likes: number,
  dislikes: number,
  videoId: string,
  viewerReaction: ReactionType | null,
}

const VideoReactions: FC<VideoReactionsProps> = (props) => {
  const { likes, dislikes, videoId, viewerReaction } = props;
  const clerk = useClerk();
  const utils = trpc.useUtils();
  const like = trpc.videoReactions.like.useMutation({
    onSuccess: () => {
      utils.videos.getOne.invalidate({ id: videoId });
      utils.playlists.getLiked.invalidate();
    },
    onError: (error) => {
      toast.error("Something went wrong");
      if (error.data?.code === "UNAUTHORIZED") clerk.openSignIn();
    }
  });
  const dislike = trpc.videoReactions.dislike.useMutation({
    onSuccess: () => {
      utils.videos.getOne.invalidate({ id: videoId });
      utils.playlists.getLiked.invalidate();
    },
    onError: (error) => {
      toast.error("Something went wrong");
      if (error.data?.code === "UNAUTHORIZED") clerk.openSignIn();
    }
  });

  return (
    <div
      className="flex items-center flex-none"
    >
      <Button
        variant="secondary"
        onClick={() => like.mutate({ videoId })}
        disabled={like.isPending || dislike.isPending}
        className="rounded-l-full rounded-r-none gap-2 pr-4"
      >
        <ThumbsUpIcon
          className={cn("size-5", viewerReaction === "like" && "fill-black")}
        />
        {likes}
      </Button>
      <Separator
        className="h-7"
        orientation="vertical"
      />
      <Button
        variant="secondary"
        onClick={() => dislike.mutate({ videoId })}
        disabled={like.isPending || dislike.isPending}
        className="rounded-l-none rounded-r-full pl-3"
      >
        <ThumbsDownIcon
          className={cn("size-5", viewerReaction === "dislike" && "fill-black")}
        />
        {dislikes}
      </Button>
    </div>
  )
}

export { VideoReactions }