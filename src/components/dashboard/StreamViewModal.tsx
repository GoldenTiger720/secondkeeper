import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  Pause,
  Square,
  Settings,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  Activity,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { camerasService } from "@/lib/api/camerasService";

interface StreamViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  cameraId: string;
  cameraName: string;
  cameraURL: string;
}

interface StreamStats {
  fps: number;
  bitrate: number;
  resolution: string;
  latency: number;
  droppedFrames: number;
  totalFrames: number;
}

export function StreamViewModal({
  isOpen,
  onClose,
  cameraId,
  cameraName,
  cameraURL,
}: StreamViewModalProps) {
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const statsIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [isStreaming, setIsStreaming] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "disconnected" | "connecting" | "connected" | "error"
  >("disconnected");
  const [quality, setQuality] = useState<"low" | "medium" | "high">("medium");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [stats, setStats] = useState<StreamStats>({
    fps: 0,
    bitrate: 0,
    resolution: "",
    latency: 0,
    droppedFrames: 0,
    totalFrames: 0,
  });

  const connectWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    setIsConnecting(true);
    setConnectionStatus("connecting");

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws/camera/${cameraId}/stream/`;
    console.log("Connecting to WebSocket:", wsUrl);

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket connected");
      setConnectionStatus("connected");
      setIsConnecting(false);

      // Send start stream message
      ws.send(
        JSON.stringify({
          type: "start_stream",
          quality: quality,
        })
      );
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setConnectionStatus("error");
      setIsConnecting(false);
      setIsStreaming(false);

      toast({
        title: "Connection Error",
        description: "Failed to connect to camera stream.",
        variant: "destructive",
      });
    };

    ws.onclose = (event) => {
      console.log("WebSocket closed:", event.code, event.reason);
      setConnectionStatus("disconnected");
      setIsConnecting(false);
      setIsStreaming(false);

      // Attempt to reconnect if the modal is still open and it wasn't a manual close
      if (isOpen && event.code !== 1000) {
        setTimeout(() => {
          if (isOpen) {
            connectWebSocket();
          }
        }, 3000);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraId, quality, isOpen, toast]);

  const handleWebSocketMessage = useCallback(
    (data) => {
      switch (data.type) {
        case "connection_established":
          setSessionId(data.session_id);
          break;

        case "stream_started":
          setIsStreaming(true);
          setSessionId(data.session_id);
          toast({
            title: "Stream Started",
            description: `Live stream from ${cameraName} is now active.`,
          });
          break;

        case "stream_stopped":
          setIsStreaming(false);
          break;

        case "frame":
          if (canvasRef.current) {
            drawFrame(data.frame);
            updateStats(data);
          }
          break;

        case "quality_changed":
          setQuality(data.quality);
          toast({
            title: "Quality Changed",
            description: `Stream quality changed to ${data.quality}.`,
          });
          break;

        case "error":
          toast({
            title: "Stream Error",
            description: data.message,
            variant: "destructive",
          });
          break;

        case "pong":
          // Handle ping/pong for keepalive
          break;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cameraName]
  );

  const drawFrame = useCallback((frameData: string) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      // Set canvas size to match image
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw the frame
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };

    img.src = `data:image/jpeg;base64,${frameData}`;
  }, []);

  const updateStats = useCallback((frameData) => {
    setStats((prevStats) => ({
      ...prevStats,
      totalFrames: frameData.frame_number || prevStats.totalFrames + 1,
      latency: Date.now() - frameData.timestamp * 1000,
      resolution: canvasRef.current
        ? `${canvasRef.current.width}x${canvasRef.current.height}`
        : prevStats.resolution,
    }));
  }, []);

  const handleQualityChange = useCallback(
    (newQuality: "low" | "medium" | "high") => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: "change_quality",
            quality: newQuality,
          })
        );
      }
      setQuality(newQuality);
    },
    []
  );

  const handleStop = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "stop_stream",
        })
      );
    }
    setIsStreaming(false);
  }, []);

  const handleStart = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "start_stream",
          quality: quality,
        })
      );
    }
  }, [quality]);

  const toggleFullscreen = useCallback(() => {
    const modal = document.querySelector("[data-stream-modal]");
    if (!modal) return;

    if (!isFullscreen) {
      modal.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  }, [isFullscreen]);

  // Start connection when modal opens
  useEffect(() => {
    if (isOpen && !wsRef.current) {
      connectWebSocket();
    }
  }, [isOpen, connectWebSocket]);

  // Clean up when modal closes
  useEffect(() => {
    if (!isOpen) {
      if (wsRef.current) {
        wsRef.current.close(1000, "Modal closed");
        wsRef.current = null;
      }
      if (statsIntervalRef.current) {
        clearInterval(statsIntervalRef.current);
        statsIntervalRef.current = null;
      }
      setIsStreaming(false);
      setConnectionStatus("disconnected");
      setSessionId(null);
    }
  }, [isOpen]);

  // Handle fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Ping WebSocket to keep connection alive
  useEffect(() => {
    if (connectionStatus === "connected" && wsRef.current) {
      const pingInterval = setInterval(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ type: "ping" }));
        }
      }, 30000); // Ping every 30 seconds

      return () => clearInterval(pingInterval);
    }
  }, [connectionStatus]);

  const getStatusColor = () => {
    switch (connectionStatus) {
      case "connected":
        return "bg-green-100 text-green-800 border-green-200";
      case "connecting":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "error":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case "connected":
        return <Wifi className="h-3 w-3" />;
      case "connecting":
        return (
          <div className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
        );
      case "error":
        return <WifiOff className="h-3 w-3" />;
      default:
        return <WifiOff className="h-3 w-3" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-6xl w-full h-[90vh] p-0"
        data-stream-modal
      >
        <DialogHeader className="p-4 pb-2">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold">
              {cameraName} - Live Stream
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Badge className={`${getStatusColor()} flex items-center gap-1`}>
                {getStatusIcon()}
                {connectionStatus}
              </Badge>
              {isStreaming && (
                <Badge className="bg-red-100 text-red-800 border-red-200 flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  LIVE
                </Badge>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 flex flex-col p-4 pt-2">
          {/* Video Display */}
          <div className="flex-1 bg-black rounded-lg overflow-hidden relative">
            <canvas
              ref={canvasRef}
              className="w-full h-full object-contain"
              style={{
                display: connectionStatus === "connected" ? "block" : "none",
              }}
            />

            {connectionStatus !== "connected" && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-white">
                <div className="text-center">
                  {connectionStatus === "connecting" && (
                    <>
                      <div className="w-8 h-8 mx-auto mb-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <p>Connecting to camera...</p>
                    </>
                  )}
                  {connectionStatus === "error" && (
                    <>
                      <WifiOff className="w-8 h-8 mx-auto mb-2" />
                      <p>Connection failed</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={connectWebSocket}
                      >
                        Retry Connection
                      </Button>
                    </>
                  )}
                  {connectionStatus === "disconnected" && (
                    <>
                      <WifiOff className="w-8 h-8 mx-auto mb-2" />
                      <p>Camera disconnected</p>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Stats Overlay */}
            {showStats && isStreaming && (
              <div className="absolute top-4 left-4 bg-black bg-opacity-75 text-white p-3 rounded text-sm font-mono">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-4 h-4" />
                  <span>Stream Statistics</span>
                </div>
                <div className="space-y-1">
                  <div>Resolution: {stats.resolution}</div>
                  <div>Frames: {stats.totalFrames}</div>
                  <div>Latency: {stats.latency}ms</div>
                  <div>Quality: {quality}</div>
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Button
                variant={isStreaming ? "destructive" : "default"}
                size="sm"
                onClick={isStreaming ? handleStop : handleStart}
                disabled={connectionStatus !== "connected"}
              >
                {isStreaming ? (
                  <>
                    <Square className="w-4 h-4 mr-2" />
                    Stop
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Start
                  </>
                )}
              </Button>

              <Select value={quality} onValueChange={handleQualityChange}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowStats(!showStats)}
              >
                <Activity className="w-4 h-4 mr-2" />
                Stats
              </Button>

              <Button variant="outline" size="sm" onClick={toggleFullscreen}>
                {isFullscreen ? (
                  <Minimize2 className="w-4 h-4" />
                ) : (
                  <Maximize2 className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
