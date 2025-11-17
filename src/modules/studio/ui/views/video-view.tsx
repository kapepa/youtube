import { FC } from "react";
import { FormSection } from "../section/form-section";

interface VideoViewId {
  videoId: string,
}

const VideoView: FC<VideoViewId> = (props) => {
  const { videoId } = props;

  return (
    <div
      className="px-4 pt-2.5 w-full"
    >
      <FormSection
        videoId={videoId}
      />
    </div>
  )
}

export { VideoView }