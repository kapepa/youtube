import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { ThumbsDownIcon, ThumbsUpIcon } from "lucide-react";
import { FC } from "react";

type Reaction = "like" | "dislike"

const VideoReactions: FC = () => {
  const viewReaction: Reaction = "like";

  return (
    <div
      className="flex items-center flex-none"
    >
      <Button
        variant="secondary"
        className="rounded-l-full rounded-r-none gap-2 pr-4"
      >
        <ThumbsUpIcon
          className={cn("size-5", viewReaction === "like" && "fill-black")}
        />
        {1}
      </Button>
      <Separator
        className="h-7"
        orientation="vertical"
      />
      <Button
        variant="secondary"
        className="rounded-l-none rounded-r-full pl-3"
      >
        <ThumbsDownIcon
          className={cn("size-5", viewReaction !== "like" && "fill-black")}
        />
        {1}
      </Button>
    </div>
  )
}

export { VideoReactions }