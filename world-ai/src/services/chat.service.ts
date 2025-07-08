import api from "./api";

export interface Chat {
  id: number;
  title: string;
  userId: number;
  archived: boolean;
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id?: number;
  chatId: number;
  content: string ;
  role: 'user' | 'assistant' | 'tool' | 'error';
  timestamp: string;
  isUser?: boolean;
  name?: string;
  status?: 'started' | 'completed';
}

export interface StreamResponse {
  type?: 'token' | 'tool_start' | 'tool_end' | 'error';
  role?: string;
  content?: string;
  name?: string;
  input?: any;
  output?: any;
  status?: string;
  tools?: string[];
  timestamp?: string;
  isPartial?: boolean;
  isComplete?: boolean;
  error?: boolean;
  message?: string;
}

const chatService = {
  // Get all chats for the current user
  getAllChats: async (): Promise<Chat[]> => {
    const response = await api.get('/chat');
    return response.data;
  },

  // Get a specific chat with its messages
  getChat: async (chatId: number): Promise<{ chat: Chat; messages: Message[] }> => {
    const response = await api.get(`/chat/${chatId}`);
    return response.data;
  },

  // Get chat title from first message
  getChatTitle: async (message: string): Promise<{ title: string }> => {
    try {
      const response = await api.post('/openai/get-chat-title', { message });
      return response.data;
    } catch (error) {
      console.error('Error getting chat title:', error);
      return { title: 'New Chat' }; // Fallback title
    }
  },

  // Create a new chat
  createChat: async ( initialTitle?: string): Promise<Chat> => {
    try {
      // Create the chat with the initial title first
      const response = await api.post('/chat', { title: initialTitle || 'New Chat' });
      return response.data;
    } catch (error) {
      console.error('Error creating chat:', error);
      throw error;
    }
  },

  // Update chat title
  updateChatTitle: async (chatId: number, title: string): Promise<Chat> => {
    const response = await api.put(`/chat/${chatId}`, { title });
    return response.data;
  },

  // Archive a chat
  archiveChat: async (chatId: number): Promise<void> => {
    await api.put(`/chat/${chatId}/archive`);
  },

  // Delete a chat
  deleteChat: async (chatId: number): Promise<void> => {
    await api.delete(`/chat/${chatId}`);
  },

  // Add a message to a chat
  addMessage: async (chatId: number, message: { content: string, role: string, timestamp: string, file?: File, fileUrl?: string, fileType?: string }) => {
    const state: any = JSON.parse(localStorage.getItem("user-storage") || "{}");
    const token = state?.state?.token;
    
    if (!token) {
      throw new Error('Authentication token not found');
    }

    const formData = new FormData();
    formData.append('content', message.content);
    formData.append('role', message.role);
    formData.append('timestamp', message.timestamp);
    
    if (message.file) {
      formData.append('file', message.file);
    }
    if (message.fileUrl) {
      formData.append('fileUrl', message.fileUrl);
    }
    if (message.fileType) {
      formData.append('fileType', message.fileType);
    }

    try {
      const response = await fetch(`${api.defaults.baseURL}/chat/${chatId}/messages`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add message');
      }

      return await response.json();
    } catch (error: any) {
      console.error('Add message error:', error);
      throw error;
    }
  },

  // Get all messages for a chat
  getChatMessages: async (chatId: number): Promise<Message[]> => {
    const response = await api.get(`/chat/${chatId}/messages`);
    return response.data;
  },

  updateMessage: async (chatId: number, messageId: number, update: { content: string }): Promise<Message> => {
    const response = await api.put(`/chat/${chatId}/messages/${messageId}`, update);
    return response.data;
  },

  // Chat with agent (non-streaming)
  chatWithAgent: async (message: string, file?: File, chatId?: number) => {
    const state: any = JSON.parse(localStorage.getItem("user-storage") || "{}");
    const token = state?.state?.token;
    
    if (!token) {
      throw new Error('Authentication token not found');
    }

    const formData = new FormData();
    formData.append('message', message);
    
    if (file) {
      formData.append('file', file);
    }

    try {
      const url = chatId 
        ? `${api.defaults.baseURL}/openai/chat-with-agent/${chatId}`
        : `${api.defaults.baseURL}/openai/chat-with-agent`;

      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`,
          // Don't set Content-Type header when using FormData, 
          // browser will set it automatically with the boundary
        },
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Session expired. Please login again.');
        }
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to get response from server');
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error('Chat error:', error);
      throw error;
    }
  },

  // Add a method to handle file upload progress if needed
  getUploadProgress: (progressEvent: any) => {
    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
    return percentCompleted;
  },

  inpaint: async (message: any, chatId: number) => {
    try {
      const response = await api.post(`/openai/inpaint/${chatId}`, message);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  uploadFile: async (chatId: number, file: File) => {
    const state: any = JSON.parse(localStorage.getItem("user-storage") || "{}");
    const token = state?.state?.token;
    
    if (!token) {
      throw new Error('Authentication token not found');
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${api.defaults.baseURL}/chat/${chatId}/upload`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'File upload failed');
      }

      return await response.json();
    } catch (error: any) {
      console.error('Upload error:', error);
      throw error;
    }
  },
};

export default chatService; 