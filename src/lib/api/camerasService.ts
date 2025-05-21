import apiClient from "./axiosConfig";
import { toast } from "@/hooks/use-toast";

export interface Camera {
  id: string;
  name: string;
  ipAddress: string;
  url: string;
  location?: string;
  isConnected: boolean;
}

export interface AddCameraData {
  name: string;
  stream_url: string;
  username: string;
  password: string;
}
export const camerasService = {
  getAllCameras: async (): Promise<Camera[]> => {
    try {
      const response = await apiClient.get("/cameras/");
      return response.data;
    } catch (error) {
      console.error("Error fetching cameras:", error);
      toast({
        title: "Error",
        description: "Could not load cameras",
        variant: "destructive",
      });
      throw error;
    }
  },

  addCamera: async (cameraData: AddCameraData): Promise<Camera> => {
    try {
      const response = await apiClient.post("/cameras/", cameraData);

      toast({
        title: "Camera Added",
        description: `${cameraData.name} has been added successfully.`,
      });

      return response.data;
    } catch (error) {
      console.error("Error adding camera:", error);
      toast({
        title: "Error",
        description: "Could not add camera",
        variant: "destructive",
      });
      throw error;
    }
  },

  updateCamera: async (
    cameraId: string,
    cameraData: Partial<AddCameraData>
  ): Promise<Camera> => {
    try {
      const response = await apiClient.patch(
        `/cameras/${cameraId}/`,
        cameraData
      );

      toast({
        title: "Camera Updated",
        description: "Camera details have been updated successfully.",
      });

      return response.data;
    } catch (error) {
      console.error("Error updating camera:", error);
      toast({
        title: "Error",
        description: "Could not update camera",
        variant: "destructive",
      });
      throw error;
    }
  },

  deleteCamera: async (cameraId: string): Promise<void> => {
    try {
      await apiClient.delete(`/cameras/${cameraId}/`);

      toast({
        title: "Camera Deleted",
        description: "Camera has been removed successfully.",
      });
    } catch (error) {
      console.error("Error deleting camera:", error);
      toast({
        title: "Error",
        description: "Could not delete camera",
        variant: "destructive",
      });
      throw error;
    }
  },
};
