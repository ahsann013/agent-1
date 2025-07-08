import api from "./api";

interface PromptData {
  name: string;
  prompt: string;
  status: boolean;
  isDefault?: boolean;
  category: string;
}

interface PromptResponse {
  id: number;
  name: string;
  prompt: string;
  status: boolean;
  isDefault?: boolean;
  category: string;

}

const promptService = {
  getAllPrompts: async (): Promise<PromptResponse[]> => {
    try {
      const response = await api.get("/prompts");
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to fetch prompts");
    }
  },

  getPromptById: async (id: number): Promise<PromptResponse> => {
    try {
      const response = await api.get(`/prompts/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to fetch prompt");
    }
  },

  createPrompt: async (data: PromptData): Promise<PromptResponse> => {
    try {
      const response = await api.post("/prompts", data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to create prompt");
    }
  },

  updatePrompt: async (id: number, data: Partial<PromptData>): Promise<PromptResponse> => {
    try {
      const response = await api.put(`/prompts/${id}`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to update prompt");
    }
  },

  deletePrompt: async (id: number): Promise<void> => {
    try {
      await api.delete(`/prompts/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to delete prompt");
    }
  },

  togglePromptStatus: async (id: number): Promise<PromptResponse> => {
    try {
      const response = await api.put(`/prompts/${id}/toggle-status`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to toggle prompt status");
    }
  }
};

export default promptService; 