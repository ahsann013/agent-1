import api from "./api";

interface Message {
    role: 'user' | 'assistant' | 'tool' | 'error';
    content: string;
    timestamp: string;
    name?: string;
    status?: string;
}

interface ChatRequest {
    message: string;
}

interface SuggestionResponse {
    suggestions: {
        emoji: string;
        prompt: string;
        category: string;
    }[];
}

const openaiService = {
    chat: async (data: ChatRequest, onChunk: (chunk: string) => void): Promise<void> => {
        const state: any = JSON.parse(localStorage.getItem("user-storage") || "{}");
        const token = state?.state?.token;
        try {
            const response = await fetch(`${api.defaults.baseURL}/openai/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(data),
            });

            const reader = response.body?.getReader();
            if (!reader) throw new Error('No reader available');

            const decoder = new TextDecoder();
            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        if (data === '[DONE]') break;

                        try {
                            const parsed = JSON.parse(data);
                            if (parsed.content) {
                                onChunk(parsed.content);
                            }
                            if (parsed.error) {
                                throw new Error(parsed.error);
                            }
                        } catch (e) {
                            console.error('Error parsing chunk:', e);
                        }
                    }
                }
            }
        } catch (error) {
            throw error;
        }
    },

    getSuggestions: async (): Promise<SuggestionResponse> => {
        try {
            const response = await api.get("/openai/suggestions");
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    chatWithAgent: async (data: ChatRequest, onMessage: (message: Message) => void): Promise<void> => {
        const state: any = JSON.parse(localStorage.getItem("user-storage") || "{}");
        const token = state?.state?.token;
    
        try {
          const response = await fetch(`${api.defaults.baseURL}/openai/chat-with-agent`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(data),
          });
    
          const reader = response.body?.getReader();
          if (!reader) throw new Error('No reader available');
    
          const decoder = new TextDecoder();
          let isFirstToken = true;  // Add flag to track first token
    
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
    
            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');
    
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') break;
    
                try {
                  const parsed = JSON.parse(data);
                  switch (parsed.type) {
                    case 'token':
                      if (isFirstToken) {
                        // Skip the first token as it's the echo of user's input
                        isFirstToken = false;
                      } else {
                        onMessage({
                          role: 'assistant',
                          content: parsed.content.content,
                          timestamp: new Date().toISOString()
                        });
                      }
                      break;
                    case 'tool_start':
                      onMessage({
                        role: 'tool',
                        content: `Starting tool: ${parsed.tool}`,
                        timestamp: new Date().toISOString(),
                        name: parsed.tool,
                        status: 'started'
                      });
                      break;
                    case 'tool_end':
                      onMessage({
                        role: 'tool',
                        content: parsed.output,
                        timestamp: new Date().toISOString(),
                        status: 'completed'
                      });
                      break;
                    case 'error':
                      onMessage({
                        role: 'error',
                        content: parsed.error,
                        timestamp: new Date().toISOString()
                      });
                      break;
                  }
                } catch (e) {
                  console.error('Error parsing chunk:', e);
                }
              }
            }
          }
        } catch (error: any) {
          onMessage({
            role: 'error',
            content: error?.message || 'An unknown error occurred',
            timestamp: new Date().toISOString()
          });
          throw error;
        }
      },
    
   
};

export default openaiService; 