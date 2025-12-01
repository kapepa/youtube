"use client"

import { Button } from "@/components/ui/button";
import { DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { APP_URL } from "@/constants";
import { PlaylistAddModal } from "@/modules/playlists/components/playlist-add-modal";
import { DropdownMenu, DropdownMenuContent } from "@radix-ui/react-dropdown-menu";
import { ListPlusIcon, MoreVerticalIcon, ShareIcon, Trash2Icon } from "lucide-react";
import { FC, useState } from "react";
import { toast } from "sonner";

interface VideoMenuProps {
  videoId: string,
  variant?: "ghost" | "secondary",
  onRemove?: () => void,
}

const VideoMenu: FC<VideoMenuProps> = (props) => {
  const { videoId, variant = "ghost", onRemove } = props;
  const [isOpenPlatlistAddModal, setIsOpenPlatlistAddModal] = useState<boolean>(false);

  const onShare = () => {
    const fullUrl = `${APP_URL}/videos/${videoId}`
    navigator.clipboard.writeText(fullUrl);
    toast.success("Link copied to the clipboard")
  }

  return (
    <>
      <PlaylistAddModal
        open={isOpenPlatlistAddModal}
        videoId={videoId}
        onOpenChange={setIsOpenPlatlistAddModal}
      />
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
            onClick={() => setIsOpenPlatlistAddModal(true)}
          >
            <ListPlusIcon
              className="mr-2 size-4"
            />
            Add to playlist
          </DropdownMenuItem>
          {
            onRemove && (
              <DropdownMenuItem
                onClick={onRemove}
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
    </>
  )
}

export { VideoMenu }