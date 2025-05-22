import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash, Video, Eye, EyeOff } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { camerasService } from "@/lib/api/camerasService";
import { StreamViewModal } from "@/components/dashboard/StreamViewModal";
import { EditCameraDialog } from "@/components/dashboard/EditCameraDialog";
import { DeleteCameraDialog } from "@/components/dashboard/DeleteCameraDialog";

export interface CameraStatusProps {
  id: string;
  name: string;
  stream_url: string;
  isConnected: boolean;
  onCameraUpdated?: () => void;
  onCameraDeleted?: () => void;
}

export function CameraStatusCard({
  id,
  name,
  stream_url,
  isConnected,
  onCameraUpdated,
  onCameraDeleted,
}: CameraStatusProps) {
  const { toast } = useToast();
  const [isStreamModalOpen, setIsStreamModalOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleViewStream = async () => {
    if (!isConnected) {
      toast({
        title: "Camera Offline",
        description: "Cannot view stream. Camera is currently offline.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Start streaming session
      const response = await camerasService.startStream(id);

      if (response.success) {
        setIsStreamModalOpen(true);
        toast({
          title: "Stream Started",
          description: `Live stream from ${name} is now active.`,
        });
      } else {
        toast({
          title: "Stream Error",
          description: response.message || "Failed to start camera stream.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error starting stream:", error);
      toast({
        title: "Stream Error",
        description: "Failed to connect to camera stream.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStreamModalClose = async () => {
    setIsStreamModalOpen(false);
    // Stream will be automatically stopped when the modal closes
  };

  const handleEditCamera = () => {
    setIsEditDialogOpen(true);
  };

  const handleDeleteCamera = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleCameraUpdated = () => {
    setIsEditDialogOpen(false);
    if (onCameraUpdated) {
      onCameraUpdated();
    }
    toast({
      title: "Camera Updated",
      description: `${name} has been updated successfully.`,
    });
  };

  const handleCameraDeleted = () => {
    setIsDeleteDialogOpen(false);
    if (onCameraDeleted) {
      onCameraDeleted();
    }
    toast({
      title: "Camera Deleted",
      description: `${name} has been removed successfully.`,
    });
  };

  return (
    <>
      <Card className="h-full">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium truncate" title={name}>
              {name}
            </CardTitle>
            <div className="flex items-center gap-2">
              {isConnected ? (
                <Badge
                  variant="outline"
                  className="status-connected bg-green-50 text-green-700 border-green-200"
                >
                  <div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div>
                  Online
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="status-disconnected bg-red-50 text-red-700 border-red-200"
                >
                  <div className="w-2 h-2 rounded-full bg-red-500 mr-1"></div>
                  Offline
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Stream URL</div>
            <div
              className="font-mono text-xs truncate p-2 bg-muted rounded border"
              title={stream_url}
            >
              {stream_url}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="flex-1"
                    onClick={handleViewStream}
                    disabled={!isConnected || isLoading}
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
                        Connecting...
                      </>
                    ) : (
                      <>
                        {isConnected ? (
                          <Eye className="h-4 w-4 mr-2" />
                        ) : (
                          <EyeOff className="h-4 w-4 mr-2" />
                        )}
                        View Stream
                      </>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isConnected
                    ? "Open live camera stream"
                    : "Camera is currently offline"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleEditCamera}
                  >
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Edit camera</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Edit camera settings</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 hover:bg-red-50 hover:border-red-200"
                    onClick={handleDeleteCamera}
                  >
                    <Trash className="h-4 w-4 text-red-600" />
                    <span className="sr-only">Delete camera</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Delete camera</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardContent>
      </Card>

      {/* Stream View Modal */}
      <StreamViewModal
        isOpen={isStreamModalOpen}
        onClose={handleStreamModalClose}
        cameraId={id}
        cameraName={name}
      />

      {/* Edit Camera Dialog */}
      <EditCameraDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onSuccess={handleCameraUpdated}
        cameraId={id}
        cameraName={name}
        currentStreamUrl={stream_url}
      />

      {/* Delete Camera Dialog */}
      <DeleteCameraDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onSuccess={handleCameraDeleted}
        cameraId={id}
        cameraName={name}
      />
    </>
  );
}
