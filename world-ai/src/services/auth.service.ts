import { User } from "@/types/types";
import api from "./api";
import useUserStore from '@/store/useUserStore';

interface LoginData {
  username: string;
  password: string;
}

interface SignupData {
  name: string;
  email: string;
  username: string;
  password: string;
}

interface AuthResponse {
  message: string;
  user: User
  token: string;
  refreshToken: string;
  isFirstLogin: boolean;
}

// Authentication Service
const authService = {
  login: async (data: LoginData): Promise<AuthResponse> => {
    try {
      const response = await api.post("/auth/login", data);
      if (response.data.token) {
        useUserStore.getState().setToken(response.data.token);
        useUserStore.getState().setUser(response.data.user);
      }
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Login failed");
    }
  },

  signup: async (data: SignupData): Promise<AuthResponse> => {
    try {
      const response = await api.post("/auth/signup", data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Signup failed");
    }
  },

  changePassword: async (data: { currentPassword: string; newPassword: string }): Promise<void> => {
    try {
      const response = await api.post("/auth/change-password", data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Password change failed");
    }
  },

  updateProfile: async (data: { name: string; email: string; username: string; profileImage: string | File | undefined }): Promise<void> => {
    try {
      const response = await api.put("/auth/profile", data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Profile update failed");
    }
  },

  logout: async (): Promise<void> => {
    useUserStore.getState().clearUser();
  },

  forgotPassword: async (email: string): Promise<void> => {
    try {
      const response = await api.post("/auth/forgot-password", { email });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Forgot password failed");
    }
  },

  getProfile: async () => {
    const response = await api.get("/auth/profile");
    return response.data;
  },

  resetPassword: async (data: { token: string; email: string; newPassword: string }) => {
    try {
      const response = await api.post('/auth/reset-password', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Reset password failed");
    }
  },

  verify2FA: async (otp: string): Promise<void> => {
    try {
      const response = await api.post("/auth/verify-2fa", { otp });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "2FA verification failed");
    }
  },

  resend2FA: async (): Promise<void> => {
    try {
      const response = await api.post("/auth/resend-2fa");
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "2FA resend failed");
    }
  },

  async googleAuth(token: string) {
    try {
      // Verify with your backend and get user data
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const response = await api.post("/auth/google-auth");
      return response.data;
    } catch (error: any) {
      throw new Error(error.message);
    }
  },
  
  createUser: async (data: SignupData): Promise<AuthResponse> => {
    try {
      const response = await api.post("/users", data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "User creation failed");
    }
  },


};

export default authService;
