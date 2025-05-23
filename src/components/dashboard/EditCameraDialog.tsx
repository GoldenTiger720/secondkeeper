import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { camerasService } from "@/lib/api/camerasService";

interface EditCameraDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  cameraId: string;
  cameraName: string;
  currentStreamUrl: string;
}

interface CameraData {
  name: string;
  stream_url: string;
  username: string;
  password: string;
}

export function EditCameraDialog({
  isOpen,
  onClose,
  onSuccess,
  cameraId,
  cameraName,
  currentStreamUrl,
}: EditCameraDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CameraData>({
    name: cameraName,
    stream_url: currentStreamUrl,
    username: "",
    password: "",
  });

  const loadCameraData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await camerasService.getCamera(cameraId);
      if (response.success) {
        const camera = response.data;
        setFormData({
          name: camera.name || cameraName,
          stream_url: camera.stream_url || currentStreamUrl,
          username: camera.username || "",
          password: "", // Don't load password for security
        });
      }
    } catch (error) {
      console.error("Error loading camera data:", error);
      toast({
        title: "Error",
        description: "Failed to load camera data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [cameraId, cameraName, currentStreamUrl, toast]);

  useEffect(() => {
    if (isOpen) {
      loadCameraData();
    }
  }, [isOpen, cameraId, loadCameraData]);

  const handleChange = (field: keyof CameraData, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Prepare data - only send password if it's not empty
      const updateData = { ...formData };
      if (!updateData.password) {
        delete updateData.password;
      }

      const response = await camerasService.updateCamera(cameraId, updateData);

      if (response.success) {
        toast({
          title: "Camera Updated",
          description: `${formData.name} has been updated successfully.`,
        });
        onSuccess();
      } else {
        throw new Error(response.message || "Failed to update camera");
      }
    } catch (error) {
      console.error("Error updating camera:", error);
      let errorMessage = "An unexpected error occurred";

      if (error.response?.data) {
        const { message, errors } = error.response.data;
        if (errors && errors.length > 0) {
          errorMessage = errors.join(", ");
        } else if (message) {
          errorMessage = message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Update Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px]">
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
            <span className="ml-2">Loading camera data...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Camera</DialogTitle>
            <DialogDescription>
              Update camera settings and detection configuration.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="basic" className="mt-4">
            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-name">Camera Name</Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="Living Room Camera"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-stream_url">RTSP URL or Host Link</Label>
                  <Input
                    id="edit-stream_url"
                    value={formData.stream_url}
                    onChange={(e) => handleChange("stream_url", e.target.value)}
                    placeholder="rtsp://username:password@192.168.1.10:554/stream"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-username">Username (Optional)</Label>
                    <Input
                      id="edit-username"
                      value={formData.username}
                      onChange={(e) => handleChange("username", e.target.value)}
                      placeholder="admin"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-password">Password (Optional)</Label>
                    <Input
                      id="edit-password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleChange("password", e.target.value)}
                      placeholder="Leave empty to keep current"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-gray-300 border-t-white"></div>
                  Updating...
                </>
              ) : (
                "Update Camera"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
