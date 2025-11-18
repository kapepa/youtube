"use client"

import { FC } from "react";
import MuxPlayer from '@mux/mux-player-react';
import { THUMBNAIL_FALLBACK } from "../constants";

interface VideoPlayerProps {
  onPlay?: () => void,
  autoPlay?: boolean,
  playbackId?: string | null,
  thumbnailUrl?: string | null,
}

const VideoPlayer: FC<VideoPlayerProps> = (props) => {
  const { onPlay, autoPlay, playbackId, thumbnailUrl } = props;

  if (!playbackId) return null;

  return (
    <MuxPlayer
      playbackId={playbackId || ""}
      poster={thumbnailUrl || THUMBNAIL_FALLBACK}
      playerInitTime={0}
      autoPlay={autoPlay}
      thumbnailTime={0}
      className="w-full h-full object-contain"
      accentColor="#FF2056"
      onPlay={onPlay}
    />
  )
}

export { VideoPlayer }