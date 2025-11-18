import { ResponsiveModal } from "@/components/responsive-modal";
import { UploadDropzone } from "@/lib/uploadthing";
import { trpc } from "@/trpc/client";
import { FC } from "react";

interface ThumbnailUploadModalProps {
  open: boolean,
  videoId: string,
  onOpenChange: (open: boolean) => void,
}

const ThumbnailUploadModal: FC<ThumbnailUploadModalProps> = (props) => {
  const { open, videoId, onOpenChange } = props;
  const utils = trpc.useUtils();

  const onUploadComplete = () => {
    utils.studio.getMany.invalidate()
    utils.studio.getOne.invalidate({ id: videoId })
    onOpenChange(false)
  };

  return (
    <ResponsiveModal
      open={open}
      title="Upload a thumbnail"
      onOpenChange={onOpenChange}
    >
      <UploadDropzone
        input={{ videoId }}
        endpoint="thumbnailUploader"
        onClientUploadComplete={onUploadComplete}
      />
    </ResponsiveModal>
  )
}

export { ThumbnailUploadModal }