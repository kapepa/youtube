"use client"

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTERS } from "@/lib/routers";
import { trpc } from "@/trpc/client";
import { Trash2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { FC, Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { toast } from "sonner";

interface PlaylistHeaderSectionsProps {
  playlistId: string
}

const PlaylistHeaderSections: FC<PlaylistHeaderSectionsProps> = (props) => {
  const { playlistId } = props;

  return (
    <Suspense
      fallback={<PlaylistHeaderSectionsSkeleton />}
    >
      <ErrorBoundary
        fallback={<p>Error</p>}
      >
        <PlaylistHeaderSectionsSuspense
          playlistId={playlistId}
        />
      </ErrorBoundary>
    </Suspense>
  )
}

const PlaylistHeaderSectionsSkeleton: FC = () => {
  return (
    <div
      className="flex flex-col gap-y-2"
    >
      <Skeleton
        className="h-6 w-24"
      />
      <Skeleton
        className="h-4 w-32"
      />
    </div>
  )
}

const PlaylistHeaderSectionsSuspense: FC<PlaylistHeaderSectionsProps> = (props) => {
  const { playlistId } = props;
  const router = useRouter();
  const utils = trpc.useUtils();
  const [playlist] = trpc.playlists.getOne.useSuspenseQuery({ id: playlistId });
  const remove = trpc.playlists.remove.useMutation({
    onSuccess: () => {
      toast.success("Playlist removed");
      utils.playlists.getMany.invalidate();
      router.push(ROUTERS.PLAYLISTS)
    },
    onError: () => {
      toast.error("Something went wrong")
    }
  });

  return (
    <div
      className="flex justify-between items-center"
    >
      <div>
        <h1
          className="text-2xl font-bold"
        >
          {playlist.name}
        </h1>
        <p
          className="text-xs text-muted-foreground"
        >

        </p>
      </div>
      <Button
        size="icon"
        variant="outline"
        onClick={() => remove.mutate({ id: playlistId })}
        disabled={remove.isPending}
        className="rounded-full"
      >
        <Trash2Icon />
      </Button>
    </div>
  )
}

export { PlaylistHeaderSections }