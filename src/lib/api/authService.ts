import apiClient from "./axiosConfig";
import { toast } from "@/hooks/use-toast";
interface LoginCredentials {
  email: string;
  password: string;
}
interface RegisterData {
  username: string;
  email: string;
  password: string;
  full_name: string;
  phone_number: string;
}

interface LoginResponse {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
    full_name: string;
    phone_number: string;
  };
}

export const authService = {
  login: async (credentials: LoginCredentials) => {
    try {
      const response = await apiClient.post("/auth/login/", credentials);
      localStorage.setItem(
        "secondkeeper_token",
        response.data.data.tokens.refresh
      );
      localStorage.setItem(
        "secondkeeper_access_token",
        response.data.data.tokens.access
      );
      localStorage.setItem(
        "safeguard_user",
        JSON.stringify(response.data.data.user)
      );

      return response.data;
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login Failed",
        description: "Please check your credentials and try again",
        variant: "destructive",
      });
      throw error;
    }
  },

  register: async (userData: RegisterData) => {
    try {
      const response = await apiClient.post("/auth/register/", userData);
      return response.data;
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Registration Failed",
        description:
          "Your password must contain a mix of letters, numbers, and uppercase letters.",
        variant: "destructive",
      });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem("secondkeeper_token");
    localStorage.removeItem("safeguard_user");
    localStorage.removeItem("secondkeeper_access_token");
  },

  clearExpiredTokens: () => {
    const refreshToken = localStorage.getItem("secondkeeper_token");
    const accessToken = localStorage.getItem("secondkeeper_access_token");
    
    if (!refreshToken || !accessToken) {
      authService.logout();
      return;
    }
    
    try {
      // Check if refresh token is expired
      const refreshTokenParts = refreshToken.split('.');
      if (refreshTokenParts.length === 3) {
        const refreshPayload = JSON.parse(atob(refreshTokenParts[1]));
        const currentTime = Math.floor(Date.now() / 1000);
        
        if (refreshPayload.exp < currentTime) {
          // Refresh token is expired, clear everything
          authService.logout();
        }
      }
    } catch (error) {
      // If we can't parse the token, clear everything
      authService.logout();
    }
  },

  getCurrentUser: () => {
    const userJson = localStorage.getItem("safeguard_user");
    return userJson ? JSON.parse(userJson) : null;
  },

  isAuthenticated: () => {
    const refreshToken = localStorage.getItem("secondkeeper_token");
    const accessToken = localStorage.getItem("secondkeeper_access_token");
    
    if (!refreshToken || !accessToken) {
      return false;
    }
    
    // Check if access token is expired
    try {
      const tokenParts = accessToken.split('.');
      if (tokenParts.length !== 3) {
        return false;
      }
      
      const payload = JSON.parse(atob(tokenParts[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      
      // If access token is expired, we need to verify refresh token too
      if (payload.exp < currentTime) {
        // Check refresh token expiry
        const refreshTokenParts = refreshToken.split('.');
        if (refreshTokenParts.length !== 3) {
          return false;
        }
        
        const refreshPayload = JSON.parse(atob(refreshTokenParts[1]));
        // If refresh token is also expired, user needs to login again
        if (refreshPayload.exp < currentTime) {
          return false;
        }
      }
      
      return true;
    } catch (error) {
      // If we can't parse the token, consider it invalid
      return false;
    }
  },

  updateProfile: async (
    userData: Partial<{
      full_name: string;
      email: string;
      phone_number: string;
      address: string;
    }>
  ) => {
    try {
      const response = await apiClient.patch("/users/me/", userData);
      const updatedUser = response.data;
      localStorage.setItem("safeguard_user", JSON.stringify(updatedUser));
      return updatedUser;
    } catch (error) {
      console.error("Profile update error:", error);
      toast({
        title: "Update Failed",
        description: "Could not update your profile",
        variant: "destructive",
      });
      throw error;
    }
  },
};
