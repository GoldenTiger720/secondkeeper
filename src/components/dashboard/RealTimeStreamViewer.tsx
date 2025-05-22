import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  X,
  Settings,
  Maximize2,
  Minimize2,
  AlertTriangle,
  Activity,
  Clock,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import apiClient from "@/lib/api/axiosConfig";

interface RealTimeStreamViewerProps {
  cameraId: number;
  cameraName: string;
  onClose: () => void;
  onStreamingStatusChange?: (isStreaming: boolean) => void;
}

interface StreamResponse {
  success: boolean;
  data?: {
    session_id: string;
    group_name: string;
    stream_type: string;
    websocket_url: string;
    camera_info: {
      id: number;
      name: string;
      location?: string;
      detection_enabled: boolean;
    };
  };
  message: string;
  errors: string[];
}

interface StreamMetrics {
  fps: number;
  frame_count: number;
  detection_count: number;
  uptime: number;
}

interface Detection {
  type: string;
  confidence: number;
  timestamp: number;
  camera_id: number;
}

export function RealTimeStreamViewer({
  cameraId,
  cameraName,
  onClose,
  onStreamingStatusChange,
}: RealTimeStreamViewerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [streamInfo, setStreamInfo] = useState<StreamResponse["data"] | null>(
    null
  );
  const [metrics, setMetrics] = useState<StreamMetrics | null>(null);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<
    "disconnected" | "connecting" | "connected"
  >("disconnected");
  const [isFullscreen, setIsFullscreen] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const metricsIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const { toast } = useToast();

  const drawFrame = useCallback((frameData: string, metadata?: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      if (metadata) {
        drawOverlay(ctx, canvas, metadata);
      }
    };
    img.src = `data:image/jpeg;base64,${frameData}`;
  }, []);

  const drawOverlay = (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    metadata
  ) => {
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(10, 10, 300, 80);
    ctx.fillStyle = "white";
    ctx.font = "14px monospace";

    const frameCount = metadata.frame_count || 0;
    const detectionCount = metadata.detection_count || 0;
    const timestamp = new Date(metadata.timestamp * 1000).toLocaleTimeString();

    ctx.fillText(`Frame: ${frameCount}`, 15, 30);
    ctx.fillText(`Detections: ${detectionCount}`, 15, 50);
    ctx.fillText(`Time: ${timestamp}`, 15, 70);

    if (metadata.detections && metadata.detections.length > 0) {
      ctx.fillStyle = "rgba(255, 0, 0, 0.8)";
      ctx.fillRect(canvas.width - 150, 10, 140, 30);
      ctx.fillStyle = "white";
      ctx.font = "bold 16px monospace";
      ctx.fillText("DETECTION!", canvas.width - 140, 30);

      const detection = metadata.detections[0];
      ctx.fillStyle = "rgba(255, 165, 0, 0.8)";
      ctx.fillRect(canvas.width - 150, 45, 140, 25);
      ctx.fillStyle = "white";
      ctx.font = "12px monospace";
      ctx.fillText(`${detection.type.toUpperCase()}`, canvas.width - 140, 62);
      ctx.fillText(
        `${(detection.confidence * 100).toFixed(1)}%`,
        canvas.width - 80,
        62
      );
    }
  };

  const connectWebSocket = useCallback(
    (websocketUrl: string, groupName: string) => {
      setConnectionStatus("connecting");

      const baseUrl =
        import.meta.env.VITE_API_BASE_URL || "https://secondkeeper.cc/api";
      const wsUrl =
        baseUrl.replace("http", "ws").replace("/api", "") + websocketUrl;

      console.log("Connecting to WebSocket:", wsUrl);

      try {
        wsRef.current = new WebSocket(wsUrl);

        wsRef.current.onopen = () => {
          console.log("WebSocket connected:", wsUrl);
          setIsConnected(true);
          setConnectionStatus("connected");
          setError(null);
          reconnectAttempts.current = 0;

          if (onStreamingStatusChange) {
            onStreamingStatusChange(true);
          }
        };

        wsRef.current.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);

            switch (data.type) {
              case "video_frame":
                if (data.frame) {
                  drawFrame(data.frame, data.metadata);
                }
                break;

              case "detection_result":
                if (data.detection) {
                  setDetections((prev) => [
                    data.detection,
                    ...prev.slice(0, 9),
                  ]);

                  toast({
                    title: `${data.detection.type.toUpperCase()} Detected!`,
                    description: `Confidence: ${(
                      data.detection.confidence * 100
                    ).toFixed(1)}%`,
                    variant: "destructive",
                  });
                }
                break;

              case "alert":
                console.log("Alert received:", data.alert);
                toast({
                  title: "Security Alert",
                  description:
                    data.alert.message || "New security alert detected",
                  variant: "destructive",
                });
                break;

              case "connection_established":
                console.log("Connection established:", data.message);
                break;

              case "error":
                setError(data.error);
                break;

              default:
                console.log("Unknown message type:", data.type);
            }
          } catch (err) {
            console.error("WebSocket message parsing error:", err);
          }
        };

        wsRef.current.onclose = (event) => {
          console.log("WebSocket connection closed:", event.code, event.reason);
          setIsConnected(false);
          setConnectionStatus("disconnected");

          if (onStreamingStatusChange) {
            onStreamingStatusChange(false);
          }

          if (reconnectAttempts.current < maxReconnectAttempts) {
            reconnectAttempts.current++;
            const delay = Math.min(
              1000 * Math.pow(2, reconnectAttempts.current),
              30000
            );

            reconnectTimeoutRef.current = setTimeout(() => {
              console.log(
                `Reconnection attempt ${reconnectAttempts.current}/${maxReconnectAttempts}`
              );
              connectWebSocket(websocketUrl, groupName);
            }, delay);
          } else {
            setError("Connection lost. Please refresh to reconnect.");
          }
        };

        wsRef.current.onerror = (error) => {
          console.error("WebSocket error:", error);
          setError("WebSocket connection error occurred.");
        };
      } catch (err) {
        console.error("WebSocket connection failed:", err);
        setError("Failed to establish WebSocket connection.");
        setConnectionStatus("disconnected");
      }
    },
    [drawFrame, toast, onStreamingStatusChange]
  );

  const startStream = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.get(`/cameras/${cameraId}/stream/`);
      const data: StreamResponse = response.data;

      if (data.success && data.data) {
        setStreamInfo(data.data);
        connectWebSocket(data.data.websocket_url, data.data.group_name);
        startMetricsUpdates();
      } else {
        setError(data.errors?.join(", ") || "Failed to start stream.");
      }
    } catch (err) {
      console.error("Stream start error:", err);
      setError(err.response?.data?.message || "Server connection failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const stopStream = async () => {
    try {
      if (wsRef.current) {
        wsRef.current.close();
      }

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      stopMetricsUpdates();

      if (streamInfo) {
        await apiClient.post(`/cameras/${cameraId}/stop_stream/`);
      }

      setIsConnected(false);
      setConnectionStatus("disconnected");
      setStreamInfo(null);
      setMetrics(null);
      setDetections([]);

      if (onStreamingStatusChange) {
        onStreamingStatusChange(false);
      }
    } catch (err) {
      console.error("Stream stop error:", err);
    }
  };

  const startMetricsUpdates = () => {
    if (metricsIntervalRef.current) {
      clearInterval(metricsIntervalRef.current);
    }

    metricsIntervalRef.current = setInterval(async () => {
      if (streamInfo) {
        try {
          const response = await apiClient.get(
            `/cameras/${cameraId}/stream_status/`
          );
          const data = response.data;
          if (data.success && data.data.metrics) {
            setMetrics(data.data.metrics);
          }
        } catch (err) {
          console.error("Metrics update error:", err);
        }
      }
    }, 3000);
  };

  const stopMetricsUpdates = () => {
    if (metricsIntervalRef.current) {
      clearInterval(metricsIntervalRef.current);
      metricsIntervalRef.current = null;
    }
  };

  const handleClose = () => {
    stopStream();
    onClose();
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  useEffect(() => {
    startStream();
    return () => {
      stopStream();
    };
  }, [cameraId]);

  return (
    <Dialog open={true} onOpenChange={handleClose}>
      <DialogContent
        className={`${
          isFullscreen ? "max-w-[55vw] max-h-[55vh]" : "max-w-3xl h-full"
        } overflow-scroll`}
      >
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Live Stream - {cameraName}</DialogTitle>
            <div className="flex items-center gap-2">
              {streamInfo && (
                <Badge
                  variant={
                    streamInfo.stream_type === "gstreamer"
                      ? "default"
                      : "secondary"
                  }
                >
                  {streamInfo.stream_type.toUpperCase()}
                </Badge>
              )}
              <Badge
                variant={
                  connectionStatus === "connected" ? "default" : "destructive"
                }
              >
                {connectionStatus === "connected"
                  ? "Connected"
                  : connectionStatus === "connecting"
                  ? "Connecting..."
                  : "Disconnected"}
              </Badge>
              <Button variant="ghost" size="icon" onClick={toggleFullscreen}>
                {isFullscreen ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>
              <Button variant="ghost" size="icon" onClick={handleClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {isLoading && (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p>Starting camera stream...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center h-64">
              <div className="text-center text-red-600">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                <p>Error: {error}</p>
                <Button onClick={startStream} className="mt-2">
                  Retry
                </Button>
              </div>
            </div>
          )}

          {/* Video Container */}
          <div
            className="relative bg-black rounded-lg overflow-hidden"
            style={{ minHeight: "400px" }}
          >
            <canvas
              ref={canvasRef}
              className="w-full h-full object-contain"
              style={{ display: isConnected ? "block" : "none" }}
            />

            {!isConnected && !isLoading && !error && (
              <div className="absolute inset-0 flex items-center justify-center text-white">
                <div className="text-center">
                  <Activity className="h-8 w-8 mx-auto mb-2 animate-pulse" />
                  <p>Waiting for stream...</p>
                </div>
              </div>
            )}
          </div>

          {/* Controls and Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Stream Metrics */}
            {metrics && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Stream Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>FPS:</span>
                    <span className="font-mono">{metrics.fps.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Frames:</span>
                    <span className="font-mono">{metrics.frame_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Detections:</span>
                    <span className="font-mono">{metrics.detection_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Uptime:</span>
                    <span className="font-mono">
                      {Math.floor(metrics.uptime)}s
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Detections */}
            <Card className="md:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Recent Detections
                </CardTitle>
              </CardHeader>
              <CardContent>
                {detections.length > 0 ? (
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {detections.map((detection, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between text-sm bg-red-50 p-2 rounded"
                      >
                        <div className="flex items-center gap-2">
                          <Badge variant="destructive" className="text-xs">
                            {detection.type.toUpperCase()}
                          </Badge>
                          <span>
                            {(detection.confidence * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>
                            {new Date(
                              detection.timestamp * 1000
                            ).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No detections yet
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Stream Controls */}
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              {streamInfo && `Session: ${streamInfo.session_id}`}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={stopStream}
                disabled={!isConnected}
              >
                Stop Stream
              </Button>
              <Button onClick={startStream} disabled={isConnected || isLoading}>
                {isLoading ? "Starting..." : "Start Stream"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
