import axios from "axios";

// Create axios instance with base configuration
const axiosInstance = axios.create({
  baseURL: "/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor — attach session ID and log
axiosInstance.interceptors.request.use(
  (config) => {
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
    // Attach visitor session ID so the server can track events inline
    let sessionId = sessionStorage.getItem("bdc_session_id");
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem("bdc_session_id", sessionId);
    }
    config.headers["X-Session-ID"] = sessionId;
    return config;
  },
  (error) => {
    console.error("[API Request Error]", error);
    return Promise.reject(error);
  },
);

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error(
      "[API Response Error]",
      error.response?.data || error.message,
    );
    return Promise.reject(error);
  },
);

export default axiosInstance;
