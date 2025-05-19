import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Download, Play, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

export interface AlertProps {
  id: string;
  type: "fall" | "smoke" | "fire" | "violence" | "choking" | "unauthorized";
  status: "new" | "confirmed" | "dismissed";
  timestamp: Date;
  camera: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  className?: string;
}

const alertColorMap = {
  fall: "bg-amber-500",
  smoke: "bg-blue-500",
  fire: "bg-red-500",
  violence: "bg-purple-500",
  choking: "bg-pink-500",
  unauthorized: "bg-orange-500",
};

const alertIconMap = {
  fall: "🚨",
  smoke: "💨",
  fire: "🔥",
  violence: "⚠️",
  choking: "😱",
  unauthorized: "🔒",
};

export function AlertCard({
  id,
  type,
  status,
  timestamp,
  camera,
  videoUrl,
  thumbnailUrl,
  className,
}: AlertProps) {
  const isNew = status === "new";
  const formattedTime = formatDistanceToNow(timestamp, { addSuffix: true });
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const { toast } = useToast();

  // Generate a video URL based on alert ID if not provided
  const actualVideoUrl = videoUrl;

  const handleDownload = () => {
    // Create a link element to trigger the download
    const link = document.createElement("a");
    link.href = actualVideoUrl;
    link.download = `alert-${id}-${type}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Download Started",
      description: `Downloading video clip for ${type} alert.`,
    });
  };

  return (
    <>
      <Card className={cn("overflow-hidden transition-all", className)}>
        <div className="flex flex-col sm:flex-row">
          <div className="relative flex-shrink-0 h-40 sm:h-auto sm:w-40 md:w-60">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${
                  thumbnailUrl ||
                  "https://via.placeholder.com/300x200?text=No+Preview"
                })`,
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div
              className={cn(
                "absolute top-2 left-2 h-6 w-6 rounded-full flex items-center justify-center text-white text-xs",
                alertColorMap[type]
              )}
            >
              {alertIconMap[type]}
            </div>
            <Button
              variant="secondary"
              size="icon"
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              onClick={() => setVideoModalOpen(true)}
            >
              <Play className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex flex-col flex-grow p-4">
            <CardHeader className="p-0 pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">
                  {type.charAt(0).toUpperCase() + type.slice(1)} Detected
                </CardTitle>
                {status === "new" && (
                  <Badge
                    variant="destructive"
                    className={cn(
                      "uppercase text-xs",
                      isNew && "alert-badge-pulse"
                    )}
                  >
                    New
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0 space-y-2">
              <div className="flex items-center text-sm text-muted-foreground gap-1">
                <Clock className="h-4 w-4" />
                <span>{formattedTime}</span>
              </div>
              <p className="text-sm">
                Detected on <strong>{camera}</strong>
              </p>
            </CardContent>
            <CardFooter className="p-0 pt-4 flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="default"
                onClick={() => setDetailsModalOpen(true)}
              >
                View Details
              </Button>
              <Button size="sm" variant="outline" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-1" />
                Download Clip
              </Button>
              <Button size="sm" variant="ghost" className="ml-auto">
                <X className="h-4 w-4" />
                <span className="sr-only">Dismiss</span>
              </Button>
            </CardFooter>
          </div>
        </div>
      </Card>

      {/* Video Playback Modal */}
      <Dialog open={videoModalOpen} onOpenChange={setVideoModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {type.charAt(0).toUpperCase() + type.slice(1)} Alert Video
            </DialogTitle>
          </DialogHeader>
          <div className="aspect-video w-full bg-black rounded-md overflow-hidden">
            <video
              src={actualVideoUrl}
              className="w-full h-full"
              controls
              autoPlay
              onError={(e) => {
                console.error("Video error:", e);
                toast({
                  variant: "destructive",
                  title: "Video Error",
                  description:
                    "Could not play the video. The video file may not exist.",
                });
              }}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Details Modal */}
      <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alert Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div className="text-muted-foreground">Type:</div>
              <div className="font-medium">
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </div>

              <div className="text-muted-foreground">Camera:</div>
              <div className="font-medium">{camera}</div>

              <div className="text-muted-foreground">Time:</div>
              <div className="font-medium">{formattedTime}</div>

              <div className="text-muted-foreground">Status:</div>
              <div className="font-medium capitalize">{status}</div>

              <div className="text-muted-foreground">Alert ID:</div>
              <div className="font-medium">{id}</div>
            </div>

            <div className="border rounded-md p-3 bg-muted/30">
              <h4 className="text-sm font-medium mb-2">AI Analysis</h4>
              <p className="text-sm">
                {type === "fall" &&
                  "Person detected on floor with limited movement for over 20 seconds."}
                {type === "smoke" &&
                  "Visible smoke particles detected with density above threshold."}
                {type === "fire" &&
                  "Thermal anomaly and visible flames detected."}
                {type === "violence" &&
                  "Aggressive motion patterns and postures detected."}
                {type === "choking" &&
                  "Person exhibiting universal choking sign and distress."}
                {type === "unauthorized" &&
                  "Person not matching any authorized facial profiles detected."}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
