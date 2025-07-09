import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Plus,
  TestTube,
  CheckCircle,
  XCircle,
  Loader2,
  Info,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { camerasService } from "@/lib/api/camerasService";

interface AddCameraDialogProps {
  onCameraAdded?: () => void;
  trigger?: React.ReactNode;
}

interface CameraFormData {
  name: string;
  stream_url: string;
}

export function AddCameraDialog({
  onCameraAdded,
  trigger,
}: AddCameraDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<CameraFormData>({
    name: "",
    stream_url: "",
  });

  const handleChange = (field: keyof CameraFormData, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!formData.name.trim()) {
        throw new Error("Camera name is required");
      }
      if (!formData.stream_url.trim()) {
        throw new Error("Stream URL is required");
      }

      const response = await camerasService.addCamera({
        name: formData.name.trim(),
        stream_url: formData.stream_url.trim(),
      });

      toast({
        title: "Camera Added Successfully",
        description: `${formData.name} has been added to your cameras.`,
      });

      // Reset form
      setFormData({
        name: "",
        stream_url: "",
      });
      setOpen(false);

      // Notify parent component
      if (onCameraAdded) {
        onCameraAdded();
      }
    } catch (error) {
      console.error("Error adding camera:", error);
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
        title: "Camera Addition Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Camera
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Camera</DialogTitle>
            <DialogDescription>
              Configure your security camera and detection settings.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="basic" className="mt-4">
            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Camera Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="Living Room Camera"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="stream_url">Stream URL *</Label>
                  </div>
                  <div className="space-y-2">
                    <Input
                      id="stream_url"
                      name="stream_url"
                      value={formData.stream_url}
                      onChange={(e) =>
                        handleChange("stream_url", e.target.value)
                      }
                      placeholder="rtsp://192.168.1.100:554/stream"
                      required
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
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding Camera...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Camera
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
