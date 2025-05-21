import axios from "axios";

// Create an axios instance with base configuration
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "https://secondkeeper.cc/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("secondkeeper_access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle common errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;
    // Handle authentication errors
    if (response && response.status === 401) {
      localStorage.removeItem("secondkeeper_token");
      // Redirect to login page in production
    }
    return Promise.reject(error);
  }
);

export default apiClient;
