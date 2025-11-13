"use client"

import { Button } from "@/components/ui/button";
import { trpc } from "@/trpc/client";
import { Loader2Icon, PlusIcon } from "lucide-react";
import { FC } from "react";
import { toast } from "sonner";

const StudioUploadModal: FC = () => {
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

  return (
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
  )
}

export { StudioUploadModal }