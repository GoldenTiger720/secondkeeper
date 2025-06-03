import apiClient from "./axiosConfig";
import { toast } from "@/lib/notifications";

export interface AuthorizedFace {
  data: AuthorizedFace;
  id: string;
  name: string;
  role: "primary" | "caregiver" | "family" | "other";
  face_image?: string;
  created_at: string;
  updated_at: string;
}

export interface AddFaceData {
  name: string;
  role: "primary" | "caregiver" | "family" | "other";
  face_image?: File;
}

export const facesService = {
  getAllFaces: async (): Promise<AuthorizedFace[]> => {
    try {
      const response = await apiClient.get("/faces/");

      // Handle both response formats
      if (response.data.success && response.data.data) {
        return response.data.data.results;
      } else if (Array.isArray(response.data)) {
        return response.data;
      } else {
        return response.data.data || [];
      }
    } catch (error) {
      console.error("Error fetching faces:", error);
      toast.error("Could not load authorized faces");
      throw error;
    }
  },

  getFacesByRole: async (): Promise<Record<string, AuthorizedFace[]>> => {
    try {
      const response = await apiClient.get("/faces/by_role/");
      return response.data;
    } catch (error) {
      console.error("Error fetching faces by role:", error);
      toast.error("Could not load authorized faces");
      throw error;
    }
  },

  addFace: async (
    faceData: FormData | AddFaceData
  ): Promise<AuthorizedFace> => {
    try {
      let requestData: FormData;

      // Handle both FormData and object input
      if (faceData instanceof FormData) {
        requestData = faceData;
      } else {
        // Convert AddFaceData to FormData
        requestData = new FormData();
        requestData.append("name", faceData.name);
        requestData.append("role", faceData.role);

        if (faceData.face_image) {
          requestData.append("face_image", faceData.face_image);
        }
      }

      const response = await apiClient.post("/faces/", requestData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Handle response format
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        return response.data;
      }
    } catch (error) {
      console.error("Error adding face:", error);

      // Re-throw the error so it can be handled by the component
      throw error;
    }
  },

  removeFace: async (faceId: string): Promise<void> => {
    try {
      await apiClient.delete(`/faces/${faceId}/`);
      toast.success("Face has been removed from authorized faces.");
    } catch (error) {
      console.error("Error removing face:", error);
      toast.error("Could not remove face");
      throw error;
    }
  },

  updateFace: async (
    faceId: string,
    faceData: Partial<AddFaceData>
  ): Promise<AuthorizedFace> => {
    try {
      const formData = new FormData();

      if (faceData.name) {
        formData.append("name", faceData.name);
      }

      if (faceData.role) {
        formData.append("role", faceData.role);
      }

      if (faceData.face_image) {
        formData.append("face_image", faceData.face_image);
      }

      const response = await apiClient.put(`/faces/${faceId}/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        return response.data;
      }
    } catch (error) {
      console.error("Error updating face:", error);
      throw error;
    }
  },

  getFace: async (faceId: string): Promise<AuthorizedFace> => {
    try {
      const response = await apiClient.get(`/faces/${faceId}/`);

      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        return response.data;
      }
    } catch (error) {
      console.error("Error fetching face:", error);
      throw error;
    }
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  verifyFace: async (faceImage: File, cameraId?: string): Promise<any> => {
    try {
      const formData = new FormData();
      formData.append("face_image", faceImage);

      if (cameraId) {
        formData.append("camera_id", cameraId);
      }

      const response = await apiClient.post("/faces/verify/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        return response.data;
      }
    } catch (error) {
      console.error("Error verifying face:", error);
      throw error;
    }
  },
};
