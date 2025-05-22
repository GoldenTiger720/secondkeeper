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
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  // Detection settings
  detection_enabled: boolean;
  fire_smoke_detection: boolean;
  fall_detection: boolean;
  violence_detection: boolean;
  choking_detection: boolean;
  face_recognition: boolean;
  // Performance settings
  confidence_threshold: number;
  iou_threshold: number;
  image_size: number;
  frame_rate: number;
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
    detection_enabled: true,
    fire_smoke_detection: true,
    fall_detection: true,
    violence_detection: true,
    choking_detection: true,
    face_recognition: false,
    confidence_threshold: 0.6,
    iou_threshold: 0.45,
    image_size: 640,
    frame_rate: 10,
  });

  useEffect(() => {
    if (isOpen) {
      loadCameraData();
    }
  }, [isOpen, cameraId]);

  const loadCameraData = async () => {
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
          detection_enabled: camera.detection_enabled ?? true,
          fire_smoke_detection: camera.fire_smoke_detection ?? true,
          fall_detection: camera.fall_detection ?? true,
          violence_detection: camera.violence_detection ?? true,
          choking_detection: camera.choking_detection ?? true,
          face_recognition: camera.face_recognition ?? false,
          confidence_threshold: camera.confidence_threshold ?? 0.6,
          iou_threshold: camera.iou_threshold ?? 0.45,
          image_size: camera.image_size ?? 640,
          frame_rate: camera.frame_rate ?? 10,
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
  };

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
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="detection">Detection</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
            </TabsList>

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

            <TabsContent value="detection" className="space-y-4 mt-4">
              <div className="grid gap-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Detection</Label>
                    <p className="text-sm text-muted-foreground">
                      Turn on AI-powered detection for this camera
                    </p>
                  </div>
                  <Switch
                    checked={formData.detection_enabled}
                    onCheckedChange={(checked) =>
                      handleChange("detection_enabled", checked)
                    }
                  />
                </div>

                {formData.detection_enabled && (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Fire & Smoke Detection</Label>
                        <p className="text-sm text-muted-foreground">
                          Detect fire and smoke incidents
                        </p>
                      </div>
                      <Switch
                        checked={formData.fire_smoke_detection}
                        onCheckedChange={(checked) =>
                          handleChange("fire_smoke_detection", checked)
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Fall Detection</Label>
                        <p className="text-sm text-muted-foreground">
                          Detect when people fall down
                        </p>
                      </div>
                      <Switch
                        checked={formData.fall_detection}
                        onCheckedChange={(checked) =>
                          handleChange("fall_detection", checked)
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Violence Detection</Label>
                        <p className="text-sm text-muted-foreground">
                          Detect violent behavior and fights
                        </p>
                      </div>
                      <Switch
                        checked={formData.violence_detection}
                        onCheckedChange={(checked) =>
                          handleChange("violence_detection", checked)
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Choking Detection</Label>
                        <p className="text-sm text-muted-foreground">
                          Detect choking incidents
                        </p>
                      </div>
                      <Switch
                        checked={formData.choking_detection}
                        onCheckedChange={(checked) =>
                          handleChange("choking_detection", checked)
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Face Recognition</Label>
                        <p className="text-sm text-muted-foreground">
                          Identify known individuals
                        </p>
                      </div>
                      <Switch
                        checked={formData.face_recognition}
                        onCheckedChange={(checked) =>
                          handleChange("face_recognition", checked)
                        }
                      />
                    </div>
                  </>
                )}
              </div>
            </TabsContent>

            <TabsContent value="performance" className="space-y-6 mt-4">
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <Label>
                    Confidence Threshold: {formData.confidence_threshold}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Minimum confidence level for detections (higher = fewer
                    false positives)
                  </p>
                  <Slider
                    value={[formData.confidence_threshold]}
                    onValueChange={(value) =>
                      handleChange("confidence_threshold", value[0])
                    }
                    max={1}
                    min={0.1}
                    step={0.05}
                    className="w-full"
                  />
                </div>

                <div className="grid gap-3">
                  <Label>IoU Threshold: {formData.iou_threshold}</Label>
                  <p className="text-sm text-muted-foreground">
                    Overlap threshold for object detection (higher = less
                    overlap tolerance)
                  </p>
                  <Slider
                    value={[formData.iou_threshold]}
                    onValueChange={(value) =>
                      handleChange("iou_threshold", value[0])
                    }
                    max={1}
                    min={0.1}
                    step={0.05}
                    className="w-full"
                  />
                </div>

                <div className="grid gap-3">
                  <Label>Image Size: {formData.image_size}px</Label>
                  <p className="text-sm text-muted-foreground">
                    Input image size for AI processing (larger = more accurate
                    but slower)
                  </p>
                  <Slider
                    value={[formData.image_size]}
                    onValueChange={(value) =>
                      handleChange("image_size", value[0])
                    }
                    max={1280}
                    min={320}
                    step={32}
                    className="w-full"
                  />
                </div>

                <div className="grid gap-3">
                  <Label>
                    Frame Rate: Process every {formData.frame_rate} frames
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Process every nth frame (higher = faster processing but less
                    frequent detection)
                  </p>
                  <Slider
                    value={[formData.frame_rate]}
                    onValueChange={(value) =>
                      handleChange("frame_rate", value[0])
                    }
                    max={30}
                    min={1}
                    step={1}
                    className="w-full"
                  />
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
