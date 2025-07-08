import Helpers from "@/config/helpers";
import axios from "axios";

// Define Base API URL
const BASE_URL = Helpers.apiUrl || "https://api.example.com";

// Create an Axios instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },

});

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const state: any = JSON.parse(localStorage.getItem("user-storage") || "{}");
    const token = state?.state?.token;
   
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth data
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Instead of using navigate, we'll redirect using window.location
  //    window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

interface ContactFormData {
  name: string;
  subject: string;
  email: string;
  phone: string;
  message: string;
}

export const sendContactEmail = async (formData: ContactFormData) => {
  try {
    const response = await api.post('/contact', formData);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to send contact email');
  }
};

export default api;
