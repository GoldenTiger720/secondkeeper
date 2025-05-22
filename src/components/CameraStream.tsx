import React, { useState, useEffect, useRef } from "react";
import Hls from "hls.js";
import { camerasService } from "@/lib/api/camerasService";
import { Loader } from "lucide-react";

interface CameraStreamProps {
  cameraId: string;
  className?: string;
}

interface StreamUrlType {
  camera_name: string;
  camera_status: string;
  last_online: string;
  stream_url: string;
}

export const CameraStream: React.FC<CameraStreamProps> = ({
  cameraId,
  className = "",
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [streamUrl, setStreamUrl] = useState<StreamUrlType>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStreamUrl = async () => {
      try {
        const url = await camerasService.getStreamUrl(cameraId);
        setStreamUrl(url);
      } catch (err) {
        setError("Failed to retrieve stream URL");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStreamUrl();
  }, [cameraId]);

  useEffect(() => {
    if (!streamUrl || !videoRef.current) return;

    const video = videoRef.current;

    if (Hls.isSupported()) {
      const hls = new Hls();

      hls.loadSource(streamUrl.stream_url);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play();
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error("HLS error:", data);
        setError("Streaming error occurred");
      });

      return () => {
        hls.destroy();
      };
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl.stream_url;
      video.addEventListener("loadedmetadata", () => {
        video.play();
      });
    }
  }, [streamUrl]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-destructive">
        {error}
      </div>
    );
  }

  return (
    <div className={`camera-stream ${className}`}>
      <video
        ref={videoRef}
        controls
        width="100%"
        height="auto"
        className="rounded-lg"
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
};
