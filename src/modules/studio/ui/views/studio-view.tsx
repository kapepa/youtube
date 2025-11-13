import { FC } from "react";
import { VideosSection } from "../section/videos-section";

const StudioView: FC = () => {
  return (
    <div
      className="flex flex-col gap-y-6 pt-2.5"
    >
      <div
        className="px-4"
      >
        <h1
          className="text-2xl font-bold"
        >
          Cannel content
        </h1>
        <p
          className="text-xs text-muted-foreground"
        >
          Manage your channel content and videos
        </p>
      </div>
      <VideosSection />
    </div>
  )
}

export { StudioView }