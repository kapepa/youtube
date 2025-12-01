import { FC } from "react";
import { PlaylistHeaderSections } from "../sections/playlist-header-sections";
import { VideosSection } from "../sections/videos-section";


interface VideosViewProps {
  playlistId: string
}

const VideosView: FC<VideosViewProps> = (props) => {
  const { playlistId } = props;

  return (
    <div
      className="max-w-svw mx-auto mb-10 px-4 pt-2.5 flex flex-col gap-y-6"
    >
      <PlaylistHeaderSections
        playlistId={playlistId}
      />
      <VideosSection
        playlistId={playlistId}
      />
    </div>
  )
}

export { VideosView }