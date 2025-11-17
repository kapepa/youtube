"use client"

import { ResponsiveModal } from "@/components/responsive-modal";
import { Button } from "@/components/ui/button";
import { trpc } from "@/trpc/client";
import { Loader2Icon, PlusIcon } from "lucide-react";
import { FC } from "react";
import { toast } from "sonner";
import { StudioUploader } from "./studio-uploader";
import { ROUTERS } from "@/lib/routers";
import { useRouter } from "next/navigation";

const StudioUploadModal: FC = () => {
  const router = useRouter();
  const utils = trpc.useUtils();
  const create = trpc.videos.create.useMutation({
    onSuccess: () => {
      utils.studio.getMany.invalidate();
      toast.success("Video created")
    },
    onError: (error) => {
      toast.error(error.message)
    }
  });

  const onSuccess = () => {
    if (!create.data?.video.id) return;

    create.reset();
    router.push(`${ROUTERS.STUDIO_VIDEOS}/${create.data?.video.id}`)
  }

  return (
    <>
      <ResponsiveModal
        open={!!create.data?.url}
        title="Upload a video"
        onOpenChange={() => create.reset()}
      >
        {
          create.data?.url
            ? (
              <StudioUploader
                endpoint={create.data?.url}
                onSuccess={onSuccess}
              />
            )
            : <Loader2Icon />
        }
      </ResponsiveModal>
      <Button
        variant="secondary"
        onClick={() => create.mutate()}
        className="cursor-pointer"
      >
        {
          create.isPending
            ? <Loader2Icon className="animate-spin" />
            : <PlusIcon />
        }
        Create
      </Button>
    </>
  )
}

export { StudioUploadModal }