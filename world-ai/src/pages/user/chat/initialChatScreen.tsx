//@ts-nocheck
import { useState, useRef, useEffect } from "react";
import MessageBubble from "@/components/chat/messageBubble";
import ChatInput from "@/components/chat/chatInput";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import chatService, { Message } from "@/services/chat.service";
import Helpers from "@/config/helpers";
import { useParams } from "react-router-dom";
import { useChatHeader } from "./chatLayout";

const ChatPage = () => {
  const { id } = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [isImageLoading, setIsImageLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const { headerRef } = useChatHeader();

  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const isBottom = Math.abs(scrollHeight - scrollTop - clientHeight) < 100;
    setShowScrollButton(!isBottom);
  };

  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await chatService.uploadFile(Number(id), file);
    return response.fileUrl;
  };

  const getFileType = (file: File): 'image' | 'video' | 'audio' => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    if (file.type.startsWith('audio/')) return 'audio';
    throw new Error('Unsupported file type');
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (content: string, file?: File) => {
    if ((!content.trim() && !file) || !id) return;

    setIsLoading(true);
    setInputMessage(""); // Clear input after sending

    try {
      // Upload file if present and get URL
      let fileUrl = null;
      if (file) {
        setIsImageLoading(true);
        fileUrl = await uploadFile(file);
        setIsImageLoading(false); // Set loading to false after upload is complete
      }

      // Add user message to existing chat
      const userMessage: Message = {
        chatId: Number(id),
        content,
        role: 'user' as const,
        isUser: true,
        timestamp: new Date().toISOString(),
        fileUrl: file ? fileUrl : null, // Use the uploaded file URL only if file exists
        fileType: file ? getFileType(file) : undefined
      };

      // Add message to state immediately with fileUrl
      setMessages(prev => [...prev, userMessage]);
      
      // Save message to backend
      await chatService.addMessage(Number(id), {
        content,
        role: 'user',
        timestamp: userMessage.timestamp,
        file: file || undefined,
        fileUrl: file ? fileUrl : null,
        fileType: file ? getFileType(file) : undefined
      });
      
      // Get AI response with file if provided
      const response = await chatService.chatWithAgent(content, file, Number(id));
      
      // Update credits after message is sent
      headerRef?.current?.fetchCredits();
      
      // Add AI response to messages
      const assistantMessage: Message = {
        chatId: Number(id),
        content: JSON.stringify(response.content),
        role: 'assistant' as const,
        isUser: false,
        timestamp: response.timestamp
      };

      // Save assistant message
      await chatService.addMessage(Number(id), assistantMessage);
      setMessages(prev => [...prev, assistantMessage]);
      
      // Scroll to bottom after new messages
      scrollToBottom();
      
    } catch (error) {
      Helpers.showToast("Failed to get response. Please try again.", "error");
      console.error("Chat error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchMessages = async () => {
      setIsLoading(true);
      const fetchedMessages = await chatService.getChatMessages(Number(id));
      setMessages(fetchedMessages);
      setIsLoading(false);
    };
    fetchMessages();
  }, [id]);

  // Add mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        <span className="ml-2 text-muted-foreground">
        Loading chat...
      </span>
    </div>
  )}

  return (
    <div className="relative flex flex-col h-full">
      <main
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-2 sm:p-4"
        onScroll={handleScroll}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-6xl mx-auto space-y-4 sm:space-y-6 overflow-hidden"
        >
          {messages.map((message, index) => (
            <MessageBubble
              key={index}
              content={message.content as string}
              json={(message.content)}
              isUser={message.role === 'user'}
              timestamp={message.timestamp}
              role={message.role}
              name={message.name}
              status={message.status}
              fileUrl={message.fileUrl}
              fileType={message.fileType}
              isLastMessage={index === messages.length - 1}
              isImageLoading={isImageLoading && index === messages.length - 1 && message.role === 'user'}
            />
          ))}
          {isLoading && (
            <div className="flex justify-center">
              <div className="animate-pulse text-muted-foreground">
                AI is thinking...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </motion.div>
      </main>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky bottom-0 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/20"
      >
        <div className={`mx-auto p-2 ${isMobile ? 'max-w-md' : 'max-w-2xl'}`}>
          <ChatInput
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            message={inputMessage}
            setMessage={setInputMessage}
          />
        </div>
      </motion.div>

      {showScrollButton && (
        <Button
          onClick={scrollToBottom}
          className="absolute bottom-24 right-8 h-10 w-10 rounded-full bg-primary/90 hover:bg-primary p-0 shadow-lg"
          size="icon"
        >
          <ChevronDown className="h-5 w-5 text-primary-foreground" />
        </Button>
      )}
    </div>
  );
};

export default ChatPage;