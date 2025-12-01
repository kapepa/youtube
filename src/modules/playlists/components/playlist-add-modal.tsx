"use client"

import { InfinityScroll } from "@/components/infinity-scroll";
import { ResponsiveModal } from "@/components/responsive-modal";
import { Button } from "@/components/ui/button";
import { DEFAULT_LIMIT } from "@/constants";
import { trpc } from "@/trpc/client";
import { Loader2Icon, SquareCheckIcon, SquareIcon } from "lucide-react";
import { FC } from "react";
import { toast } from "sonner";

interface PlaylistAddModalProps {
  open: boolean,
  videoId: string,
  onOpenChange: (open: boolean) => void,
}

const PlaylistAddModal: FC<PlaylistAddModalProps> = (props) => {
  const { open, videoId, onOpenChange } = props;
  const utils = trpc.useUtils();
  const { data: playlists, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = trpc.playlists.getManyForVideo.useInfiniteQuery({
    limit: DEFAULT_LIMIT,
    videoId,
  }, {
    enabled: !!videoId && open,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })

  const addVideo = trpc.playlists.addVideo.useMutation({
    onSuccess: (data) => {
      toast.success("Video added to playlist");
      utils.playlists.getMany.invalidate();
      utils.playlists.getManyForVideo.invalidate({ videoId });
      utils.playlists.getOne.invalidate({ id: data.playlistId });
      utils.playlists.getVideos.invalidate({ playlistId: data.playlistId })
    },
    onError: () => {
      toast.error("Something went wrong")
    }
  });

  const removeVideo = trpc.playlists.removeVideo.useMutation({
    onSuccess: (data) => {
      toast.success("Video removed from playlist");
      utils.playlists.getMany.invalidate();
      utils.playlists.getManyForVideo.invalidate({ videoId });
      utils.playlists.getOne.invalidate({ id: data.playlistId });
      utils.playlists.getVideos.invalidate({ playlistId: data.playlistId })
    },
    onError: () => {
      toast.error("Something went wrong")
    }
  });

  return (
    <ResponsiveModal
      open={open}
      title="Add to playlist"
      onOpenChange={onOpenChange}
    >
      <div
        className="flex flex-col gap-2"
      >
        {
          isLoading
          && (
            <div
              className="flex justify-center"
            >
              <Loader2Icon
                className="size-5 animate-spin text-muted-foreground"
              />
            </div>
          )
        }
        {
          !isLoading
          && (
            playlists?.pages
              .flatMap(page => page.items)
              .map(playlist => (
                <Button
                  key={playlist.id}
                  size="lg"
                  disabled={removeVideo.isPending || addVideo.isPending}
                  variant="ghost"
                  onClick={() => {
                    if (playlist.containsVideo) {
                      removeVideo.mutate({ playlistId: playlist.id, videoId });
                    } else {
                      addVideo.mutate({ playlistId: playlist.id, videoId });
                    }
                  }}
                  className="w-full justify-start px-2 [&_svg]:size-5"
                >
                  {
                    playlist.containsVideo
                      ? (
                        <SquareCheckIcon className="mr-2" />
                      ) : (
                        <SquareIcon className="mr-2" />
                      )
                  }
                  {playlist.name}
                </Button>
              ))
          )
        }
        {
          !isLoading
          && (
            <InfinityScroll
              isManual
              hasNextPage={hasNextPage}
              fetchNextPage={fetchNextPage}
              isFetchingNextPage={isFetchingNextPage}
            />
          )
        }
      </div>
    </ResponsiveModal>
  )
}

export { PlaylistAddModal }