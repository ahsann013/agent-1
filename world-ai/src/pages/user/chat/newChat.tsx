//@ts-nocheck
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import useUserStore from "@/store/useUserStore";
import { useCaptchaStore } from "@/store/useCaptchaStore";
import ChatInput from "@/components/chat/chatInput";
import ChatSuggestion from "@/components/chat/chatSuggestion";
import { useState, useEffect } from "react";
import chatService from "@/services/chat.service";
import Helpers from "@/config/helpers";
import MessageBubble from "@/components/chat/messageBubble";
import { useChatHeader } from "./chatLayout";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const NewChat = () => {
  const navigate = useNavigate();
  const user = useUserStore((state: any) => state.user);
  const isVerified = useCaptchaStore((state) => state.isVerified);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [isMobile] = useState(window.innerWidth < 768);
  const [messages, setMessages] = useState<any[]>([]);
  const [hasUserMessage, setHasUserMessage] = useState(false);
  const [chatId, setChatId] = useState<number | null>(null);
  const { headerRef } = useChatHeader();
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  useEffect(() => {
    // Show welcome modal if it's the user's first login
    if (localStorage.getItem("firstLogin") === "true") {
      setShowWelcomeModal(true);
    }
  }, [isVerified, navigate, user]);

  const handleSendMessage = async (content: string, file?: File) => {
    if (!content.trim() && !file) return;

    setIsLoading(true);
    setInputMessage("");

    try {
      // Create a new chat with temporary title
      const newChat = await chatService.createChat(content, "New Chat");
      const newChatId = newChat.id;
      setChatId(newChatId);

      // Upload file if present and get URL
      let fileUrl = null;
      let fileType = null;
      if (file) {
        setIsImageLoading(true);
        const uploadResponse = await chatService.uploadFile(newChatId, file);
        fileUrl = uploadResponse.fileUrl;
        fileType = getFileType(file);
        setIsImageLoading(false); // Set loading to false after upload is complete
      }

      // Create user message
      const userMessage = {
        content,
        role: 'user' as const,
        isUser: true,
        timestamp: new Date().toISOString(),
        fileUrl,
        fileType
      };

      // Immediately show user message with fileUrl
      setMessages([userMessage]);
      setHasUserMessage(true);

      // Add user message to the backend
      await chatService.addMessage(newChatId, { 
        ...userMessage, 
        chatId: newChatId,
        file: file || undefined
      });

      // Get chat title in the background
      chatService.getChatTitle(content).then(titleResponse => {
        if (titleResponse.title) {
          chatService.updateChatTitle(newChatId, titleResponse.title);
        }
      });

      // Get AI response
      const response = await chatService.chatWithAgent(content, file, newChatId);
      
      // Update credits after message is sent
      headerRef?.current?.fetchCredits();
      
      const assistantMessage = {
        chatId: newChatId,
        content: JSON.stringify(response.content),
        role: 'assistant' as const,
        isUser: false,
        timestamp: response.timestamp
      };

      // Add AI message to backend
      await chatService.addMessage(newChatId, assistantMessage);

      // Update messages state with AI response
      setMessages(prev => [...prev, assistantMessage]);

      // Navigate to the chat page
      navigate(`/chat/${newChatId}`);
    } catch (error) {
      Helpers.showToast("Failed to create chat. Please try again.", "error");
      console.error("Chat error:", error);
      // Reset messages on error
      setMessages([]);
      setHasUserMessage(false);
      setChatId(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Add helper function for file type detection
  const getFileType = (file: File): 'image' | 'video' | 'audio' => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    if (file.type.startsWith('audio/')) return 'audio';
    throw new Error('Unsupported file type');
  };

  const handleSuggestionClick = (prompt: string) => {
    setInputMessage(prompt);
  };

  return (
    <div className={`h-full flex flex-col items-center justify-center ${isMobile ? 'overflow-hidden' : ''}`}>
      {/* Welcome Modal for First Login */}
      <Dialog open={showWelcomeModal} onOpenChange={setShowWelcomeModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold text-primary">Welcome Gift!</DialogTitle>
          </DialogHeader>
          <div className="p-6 text-center space-y-4">
            <div className="text-4xl mb-4">🎉</div>
            <p className="text-lg">Congrats! You have been rewarded <span className="font-bold text-primary">50 credits</span> for free on signup.</p>
            <p className="text-sm text-muted-foreground">Start your conversation now and explore all the features.</p>
            <button 
              className="bg-primary text-white px-6 py-2 rounded-full hover:bg-primary/90 transition-colors" 
              onClick={() => {
                setShowWelcomeModal(false);
                localStorage.removeItem("firstLogin");
              }}
            >
              Get Started
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl space-y-4 sm:space-y-8"
      >
        {!hasUserMessage ? (
          <>
            <div className="text-center space-y-2 sm:space-y-4">
              <h1 className="text-2xl sm:text-4xl font-bold text-primary">
                Hi {user?.name.split(" ")[0]}!
              </h1>
              <h4 className="text-sm sm:text-base">
                Wish anything with <span className="text-primary">natural language</span>
              </h4>
            </div>
          </>
        ) : (
          <div className="w-full space-y-4">
            {messages.map((message, index) => (
              <MessageBubble
                key={index}
                content={message.content}
                json={message.content}
                timestamp={message.timestamp}
                role={message.role}
                fileUrl={message.fileUrl}
                fileType={message.fileType}
                isImageLoading={isImageLoading && index === 0 && message.role === 'user'}
              />
            ))}
            {isLoading && (
              <div className="flex justify-center">
                <div className="animate-pulse text-muted-foreground">
                  AI is thinking...
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex-col justify-center w-full rounded-2xl p-2">
          <div className={`${isMobile ? 'min-w-sm overflow-x-hidden' : 'w-2xl'} mx-auto p-2`}>
            <ChatInput
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              message={inputMessage}
              setMessage={setInputMessage}
            />
          </div>
          {!hasUserMessage && (
            <div className="mt-4 flex justify-center">
              <ChatSuggestion
                onHandleSuggestionClick={handleSuggestionClick}
              />
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default NewChat;