import api from "./api";

interface OpenAIModel {
  id: string;
  name: string;
}
interface ApiKeys {
  apiKey: string;
  webhookSecret?: string;
  systemPrompt?: string;
  status?: boolean;
  service?: string;
  model?: OpenAIModel[] | string;
}

// API Key Service
const apiKeyService = {
  getApiKeys: async (): Promise<ApiKeys> => {
    try {
      const response = await api.get("/api-settings");
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to fetch API keys");
    }
  },

  getFalAISettings: async (): Promise<ApiKeys> => {
    try {
      const response = await api.get("/api-settings/fal-ai");
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to fetch Fal AI settings");
    }
  },

  getOpenAISettings: async (): Promise<ApiKeys> => {
    try {
      const response = await api.get("/api-settings/open-ai");
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to fetch OpenAI settings");
    }
  },

  updateFalAISettings: async (data: ApiKeys): Promise<void> => {
    try {
      const response = await api.put("/api-settings/fal-ai", data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to update API keys");
    }
  },

  updateOpenAISettings: async (data: ApiKeys): Promise<void> => {
    try {
      const response = await api.put("/api-settings/open-ai", data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to update API keys");
    }
  },

  getReplicateSettings: async (): Promise<ApiKeys> => {
    try {
      const response = await api.get("/api-settings/replicate");
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to fetch Fal AI settings");
    }
  },

  updateReplicateSettings: async (data: ApiKeys): Promise<void> => {
    try {
      const response = await api.put("/api-settings/replicate", data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to update API keys");
    }
  },

  getAnthropicSettings: async (): Promise<ApiKeys> => {
    try {
      const response = await api.get("/api-settings/anthropic");
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to fetch Anthropic settings");
    }
  },

  updateAnthropicSettings: async (data: ApiKeys): Promise<void> => {
    try {
      const response = await api.put("/api-settings/anthropic", data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to update Anthropic settings");
    }
  },

  getGeminiSettings: async (): Promise<ApiKeys> => {
    try {
      const response = await api.get("/api-settings/gemini");
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to fetch Gemini settings");
    }
  },

  updateGeminiSettings: async (data: ApiKeys): Promise<void> => {
    try {
      const response = await api.put("/api-settings/gemini", data);
      return response.data; 
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to update Gemini settings");
    }
  },
  
  getStripeSettings: async (): Promise<ApiKeys> => {
    try {
      const response = await api.get("/api-settings/stripe");
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to fetch Stripe settings");
    }
  },

  updateStripeSettings: async (data: ApiKeys): Promise<void> => {
    try {
      const response = await api.put("/api-settings/stripe", data);
      return response.data; 
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to update Stripe settings");
    }
  }


};

export default apiKeyService; 