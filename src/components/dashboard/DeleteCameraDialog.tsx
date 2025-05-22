import React, { useState } from "react";
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
import { AlertTriangle, Trash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { camerasService } from "@/lib/api/camerasService";

interface DeleteCameraDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  cameraId: string;
  cameraName: string;
}

export function DeleteCameraDialog({
  isOpen,
  onClose,
  onSuccess,
  cameraId,
  cameraName,
}: DeleteCameraDialogProps) {
  const { toast } = useToast();
  const [confirmationText, setConfirmationText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const isConfirmationValid = confirmationText === cameraName;

  const handleDelete = async () => {
    if (!isConfirmationValid) {
      toast({
        title: "Invalid Confirmation",
        description: "Please type the camera name exactly as shown.",
        variant: "destructive",
      });
      return;
    }

    setIsDeleting(true);

    try {
      const response = await camerasService.deleteCamera(cameraId);

      if (response.success) {
        toast({
          title: "Camera Deleted",
          description: `${cameraName} has been permanently deleted.`,
        });
        onSuccess();
      } else {
        throw new Error(response.message || "Failed to delete camera");
      }
    } catch (error) {
      console.error("Error deleting camera:", error);

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
        title: "Delete Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (!isDeleting) {
      setConfirmationText("");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold text-red-900">
                Delete Camera
              </DialogTitle>
              <DialogDescription className="text-red-700">
                This action cannot be undone.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <p className="text-sm text-gray-700">
              You are about to permanently delete <strong>{cameraName}</strong>.
              This will remove:
            </p>
            <ul className="text-sm text-gray-600 ml-4 space-y-1">
              <li>• Camera configuration and settings</li>
              <li>• All recorded video footage</li>
              <li>• Detection history and alerts</li>
              <li>• Any scheduled recordings</li>
            </ul>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-red-800">
                <strong>Warning:</strong> Any active streams for this camera
                will be immediately terminated and cannot be recovered.
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmation" className="text-sm font-medium">
              Type{" "}
              <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">
                {cameraName}
              </code>{" "}
              to confirm deletion:
            </Label>
            <Input
              id="confirmation"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              placeholder={cameraName}
              className="font-mono"
              disabled={isDeleting}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={!isConfirmationValid || isDeleting}
          >
            {isDeleting ? (
              <>
                <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-red-300 border-t-white"></div>
                Deleting...
              </>
            ) : (
              <>
                <Trash className="w-4 h-4 mr-2" />
                Delete Camera
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
