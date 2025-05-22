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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

export function AddCameraDialog({
  onCameraAdded,
  trigger,
}: AddCameraDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "idle" | "testing" | "success" | "error"
  >("idle");
  const [testMessage, setTestMessage] = useState("");

  const [formData, setFormData] = useState<CameraFormData>({
    name: "",
    stream_url: "",
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

  const handleChange = (field: keyof CameraFormData, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Reset connection status when URL changes
    if (
      field === "stream_url" ||
      field === "username" ||
      field === "password"
    ) {
      setConnectionStatus("idle");
      setTestMessage("");
    }
  };

  const handleTestConnection = async () => {
    if (!formData.stream_url.trim()) {
      toast({
        title: "Missing Stream URL",
        description: "Please enter a stream URL before testing.",
        variant: "destructive",
      });
      return;
    }

    setIsTesting(true);
    setConnectionStatus("testing");
    setTestMessage("Testing connection...");

    try {
      const response = await camerasService.testCameraConnection(
        formData.stream_url,
        formData.username || undefined,
        formData.password || undefined
      );

      if (response.success) {
        setConnectionStatus("success");
        setTestMessage("Connection successful! Camera is accessible.");
        toast({
          title: "Connection Successful",
          description: "Camera connection test passed.",
        });
      } else {
        setConnectionStatus("error");
        setTestMessage(response.message || "Connection failed");
        toast({
          title: "Connection Failed",
          description: response.message || "Unable to connect to camera.",
          variant: "destructive",
        });
      }
    } catch (error) {
      setConnectionStatus("error");
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Connection test failed";
      setTestMessage(errorMessage);
      toast({
        title: "Connection Test Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Basic validation
      if (!formData.name.trim()) {
        throw new Error("Camera name is required");
      }
      if (!formData.stream_url.trim()) {
        throw new Error("Stream URL is required");
      }

      const response = await camerasService.addCamera({
        name: formData.name.trim(),
        stream_url: formData.stream_url.trim(),
        username: formData.username.trim() || undefined,
        password: formData.password || undefined,
        ...formData, // Include all detection and performance settings
      });

      toast({
        title: "Camera Added Successfully",
        description: `${formData.name} has been added to your cameras.`,
      });

      // Reset form
      setFormData({
        name: "",
        stream_url: "",
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

      setConnectionStatus("idle");
      setTestMessage("");
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

  const getConnectionStatusIcon = () => {
    switch (connectionStatus) {
      case "testing":
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <TestTube className="h-4 w-4 text-gray-500" />;
    }
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case "testing":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "success":
        return "text-green-600 bg-green-50 border-green-200";
      case "error":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const streamUrlExamples = [
    {
      type: "RTSP Camera",
      url: "rtsp://username:password@192.168.1.100:554/stream",
      description: "Standard RTSP stream with authentication",
    },
    {
      type: "HTTP Camera",
      url: "http://192.168.1.100:8080/video",
      description: "HTTP video stream",
    },
    {
      type: "ONVIF Camera",
      url: "rtsp://192.168.1.100:554/onvif1",
      description: "ONVIF compatible camera",
    },
  ];

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
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Setup</TabsTrigger>
              <TabsTrigger value="detection">AI Detection</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

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
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-sm">
                          <div className="space-y-2">
                            <p className="font-medium">Supported formats:</p>
                            {streamUrlExamples.map((example, index) => (
                              <div key={index} className="text-xs">
                                <p className="font-medium">{example.type}:</p>
                                <code className="text-xs bg-muted px-1 rounded">
                                  {example.url}
                                </code>
                                <p className="text-muted-foreground">
                                  {example.description}
                                </p>
                              </div>
                            ))}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="space-y-2">
                    <Input
                      id="stream_url"
                      name="stream_url"
                      value={formData.stream_url}
                      onChange={(e) =>
                        handleChange("stream_url", e.target.value)
                      }
                      placeholder="rtsp://username:password@192.168.1.100:554/stream"
                      required
                    />

                    {/* Connection Test */}
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleTestConnection}
                        disabled={isTesting || !formData.stream_url.trim()}
                      >
                        {getConnectionStatusIcon()}
                        <span className="ml-2">Test Connection</span>
                      </Button>

                      {testMessage && (
                        <div
                          className={`px-3 py-1 rounded-md border text-sm ${getConnectionStatusColor()}`}
                        >
                          {testMessage}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="username">Username (Optional)</Label>
                    <Input
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={(e) => handleChange("username", e.target.value)}
                      placeholder="admin"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">Password (Optional)</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleChange("password", e.target.value)}
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="detection" className="space-y-4 mt-4">
              <div className="grid gap-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base font-medium">
                      Enable AI Detection
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Turn on AI-powered threat detection for this camera
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
                  <div className="pl-4 border-l-2 border-muted space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>🔥 Fire & Smoke Detection</Label>
                        <p className="text-sm text-muted-foreground">
                          Detect fire outbreaks and smoke incidents
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
                        <Label>🤕 Fall Detection</Label>
                        <p className="text-sm text-muted-foreground">
                          Detect when people fall down (elderly care)
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
                        <Label>⚔️ Violence Detection</Label>
                        <p className="text-sm text-muted-foreground">
                          Detect violent behavior and physical altercations
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
                        <Label>😵 Choking Detection</Label>
                        <p className="text-sm text-muted-foreground">
                          Detect choking incidents for emergency response
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
                        <Label>👤 Face Recognition</Label>
                        <p className="text-sm text-muted-foreground">
                          Identify known and unknown individuals
                        </p>
                      </div>
                      <Switch
                        checked={formData.face_recognition}
                        onCheckedChange={(checked) =>
                          handleChange("face_recognition", checked)
                        }
                      />
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-6 mt-4">
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <Label>
                    Confidence Threshold:{" "}
                    {formData.confidence_threshold.toFixed(2)}
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
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>More sensitive</span>
                    <span>Less sensitive</span>
                  </div>
                </div>

                <div className="grid gap-3">
                  <Label>
                    IoU Threshold: {formData.iou_threshold.toFixed(2)}
                  </Label>
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
                  <Select
                    value={formData.image_size.toString()}
                    onValueChange={(value) =>
                      handleChange("image_size", parseInt(value))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="320">320px (Fastest)</SelectItem>
                      <SelectItem value="416">416px (Fast)</SelectItem>
                      <SelectItem value="512">512px (Balanced)</SelectItem>
                      <SelectItem value="640">640px (Good)</SelectItem>
                      <SelectItem value="832">832px (Better)</SelectItem>
                      <SelectItem value="1024">1024px (Best)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-3">
                  <Label>
                    Processing Rate: Every {formData.frame_rate} frames
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Process every nth frame (higher = faster but less frequent
                    detection)
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
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Every frame (slowest)</span>
                    <span>Every 30th frame (fastest)</span>
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
            <Button type="submit" disabled={isSubmitting || isTesting}>
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
