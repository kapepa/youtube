// "use client"

import { FC } from "react";
import MuxUploader, { MuxUploaderDrop, MuxUploaderFileSelect, MuxUploaderProgress, MuxUploaderStatus } from '@mux/mux-uploader-react';
import { UploadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

const UPLOADER_ID = "video-uploader";

interface StudioUploader {
  endpoint?: string | null,
  onSuccess: () => void,
}

const StudioUploader: FC<StudioUploader> = (props) => {
  const { endpoint, onSuccess } = props;

  return (
    <div>
      <MuxUploader
        id={UPLOADER_ID}
        endpoint={endpoint}
        className="hidden group/uploader"
      />
      <MuxUploaderDrop
        muxUploader={UPLOADER_ID}
      >
        <div
          slot="heading"
          className="group flex-col items-center gap-6"
        >
          <div
            className="flex items-center justify-center gap-2 rounded-full bg-muted h-32 w-32"
          >
            <UploadIcon
              className="size-10 text-muted-foreground group/drop-[&[active]]:animate-bounce transition-all duration-300"
            />
          </div>
          <div
            className="flex flex-col gap-2 text-center"
          >
            <p
              className="flex flex-col gap-2 text-center"
            >
              Drag and drop video files to upload
            </p>
            <p
              className="text-sm"
            >
              Drag and drop video files to upload
            </p>
            <p
              className="text-xs text-muted-foreground"
            >
              Your videos will be private until you publish them
            </p>
          </div>
          <MuxUploaderFileSelect
            muxUploader={UPLOADER_ID}
          >
            <Button
              type="button"
              className="rounded-full"
            >
              Select files
            </Button>
          </MuxUploaderFileSelect>
        </div>
        <span
          slot="separator"
          className="hidden"
        />
        <MuxUploaderStatus
          className="text-sm"
          muxUploader={UPLOADER_ID}
        />
        <MuxUploaderProgress
          type="percentage"
          className="text-sm"
          muxUploader={UPLOADER_ID}
        />
        <MuxUploaderProgress
          type="bar"
          muxUploader={UPLOADER_ID}
        />
      </MuxUploaderDrop>
    </div>
  )
}

export { StudioUploader }