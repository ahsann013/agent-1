import api from "./api";

interface LLMData {
  name: string;
  provider: string;
  maxTokens: number;
  isPremium: boolean;
}

interface LLMResponse {
  id: number;
  name: string;
  provider: string;
  maxTokens: number;
  isPremium: boolean;
  isActive: boolean;
  apiSettingId: number;
}

const llmService = {
  getAllLLMs: async (): Promise<LLMResponse[]> => {
    try {
      const response = await api.get("/ai-models");
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to fetch LLMs");
    }
  },

  getLLMById: async (id: number): Promise<LLMResponse> => {
    try {
      const response = await api.get(`/ai-models/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to fetch LLM");
    }
  },

  createLLM: async (data: LLMData): Promise<LLMResponse> => {
    try {
      const response = await api.post("/ai-models", data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to create LLM");
    }
  },

  updateLLM: async (id: number, data: Partial<LLMData>): Promise<LLMResponse> => {
    try {
      const response = await api.put(`/ai-models/${id}`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to update LLM");
    }
  },

  deleteLLM: async (id: number): Promise<void> => {
    try {
      await api.delete(`/ai-models/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to delete LLM");
    }
  },

  setDefaultLLM: async (id: number): Promise<LLMResponse> => {
    try {
      const response = await api.put(`/ai-models/${id}/set-default`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to set default LLM");
    }
  },
  toggleModelStatus: async (id: number): Promise<LLMResponse> => {
    try {
      const response = await api.put(`/ai-models/${id}/toggle-status`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to toggle model status");
    }
  }
};

export default llmService; 