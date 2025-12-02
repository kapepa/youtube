import { ResponsiveModal } from "@/components/responsive-modal";
import { UploadDropzone } from "@/lib/uploadthing";
import { trpc } from "@/trpc/client";
import { FC } from "react";

interface BannerUploadModalProps {
  open: boolean,
  userId: string,
  onOpenChange: (open: boolean) => void,
}

const BannerUploadModal: FC<BannerUploadModalProps> = (props) => {
  const { open, userId, onOpenChange } = props;
  const utils = trpc.useUtils();

  const onUploadComplete = () => {
    utils.users.getOne.invalidate({ id: userId })
    onOpenChange(false)
  };

  return (
    <ResponsiveModal
      open={open}
      title="Upload a banner"
      onOpenChange={onOpenChange}
    >
      <UploadDropzone
        endpoint="bannerUploader"
        onClientUploadComplete={onUploadComplete}
      />
    </ResponsiveModal>
  )
}

export { BannerUploadModal }