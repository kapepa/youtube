import { Button } from "@/components/ui/button";
import { DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DropdownMenu, DropdownMenuContent } from "@radix-ui/react-dropdown-menu";
import { ListPlusIcon, MoreVerticalIcon, ShareIcon, Trash2Icon } from "lucide-react";
import { FC } from "react";
import { toast } from "sonner";

interface VideoMenuProps {
  videoId: string,
  variant?: "ghost" | "secondary",
  onRemove?: () => void,
}

const VideoMenu: FC<VideoMenuProps> = (props) => {
  const { videoId, variant = "ghost", onRemove } = props;

  const onShare = () => {
    const fullUrl = `${process.env.VERCEL_URL || "http://localhost:3000"}/videos/${videoId}`
    navigator.clipboard.writeText(fullUrl);
    toast.success("Link copied to the clipboard")
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        asChild
      >
        <Button
          size="icon"
          variant={variant}
          className="rounded-full"
        >
          <MoreVerticalIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        onClick={(e) => e.stopPropagation()}
      >
        <DropdownMenuItem
          onClick={onShare}
        >
          <ShareIcon
            className="mr-2 size-4"
          />
          Share
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => { }}
        >
          <ListPlusIcon
            className="mr-2 size-4"
          />
          Add to playlist
        </DropdownMenuItem>
        {
          onRemove && (
            <DropdownMenuItem
              onClick={() => { }}
            >
              <Trash2Icon
                className="mr-2 size-4"
              />
              Remove
            </DropdownMenuItem>
          )
        }
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export { VideoMenu }