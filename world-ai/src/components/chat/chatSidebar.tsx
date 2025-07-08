import { Button } from "@/components/ui/button";
import { Plus, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { Link, useNavigate, useLocation } from "react-router-dom";
import useUserStore from "@/store/useUserStore";
import { ChatHistoryItem } from "./ChatHistoryItem";
import chatService, { Chat } from "@/services/chat.service";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Helpers from "@/config/helpers";
import { useTheme } from "../theme/theme-provider";

interface ChatSidebarProps {
  isCollapsed: boolean;
}

const ChatSidebar = ({ isCollapsed }: ChatSidebarProps) => {
  const navigate = useNavigate();
  const {theme} = useTheme();
  const location = useLocation();
  const { clearUser } = useUserStore();
  const [chats, setChats] = useState<Chat[]>([]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingChat, setEditingChat] = useState<Chat | null>(null);
  const [newChatTitle, setNewChatTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isNewChat, setIsNewChat] = useState(false);

  // Fetch chats on component mount and when location changes
  useEffect(() => {
    fetchChats();
  }, [location.pathname]);

  // Additional polling when new chat is created
  useEffect(() => {
    if (location.pathname === '/chat/new') {
      setIsNewChat(true);
    } else if (location.pathname.startsWith('/chat/') && isNewChat) {
      // Start polling when navigated to a new chat
      const pollInterval = setInterval(fetchChats, 1000); // Poll every second
      
      // Stop polling after 5 seconds
      const timeoutId = setTimeout(() => {
        clearInterval(pollInterval);
        setIsNewChat(false);
      }, 5000);

      return () => {
        clearInterval(pollInterval);
        clearTimeout(timeoutId);
      };
    }
  }, [location.pathname, isNewChat]);

  const fetchChats = async () => {
    try {
      const fetchedChats = await chatService.getAllChats();
      setChats(fetchedChats);
    } catch (error) {
      Helpers.showToast("Failed to fetch chats", "error");
    }
  };

  const handleLogout = () => {
    clearUser();
    localStorage.removeItem('captcha-storage');
    navigate("/login");
  };

  const handleDelete = async (id: string) => {
    try {
      await chatService.deleteChat(Number(id));
      Helpers.showToast("Chat deleted successfully", "success");
      // Refresh chats list
      fetchChats();
    } catch (error) {
      Helpers.showToast("Failed to delete chat", "error");
    }
  };

  const handleArchive = async (id: string) => {
    try {
      await chatService.archiveChat(Number(id));
      Helpers.showToast("Chat archived successfully", "success");
      // Refresh chats list
      fetchChats();
    } catch (error) {
      Helpers.showToast("Failed to archive chat", "error");
    }
  };

  const handleEdit = (id: string) => {
    const chat = chats.find(c => c.id === Number(id));
    if (chat) {
      setEditingChat(chat);
      setNewChatTitle(chat.title);
      setIsEditDialogOpen(true);
    }
  };

  const handleNewChat = () => {
    navigate('/chat/new');
  };

  const handleUpdateChatTitle = async () => {
    if (!editingChat || !newChatTitle.trim()) {
      Helpers.showToast("Please enter a chat title", "error");
      return;
    }

    setIsLoading(true);
    try {
      const updatedChat = await chatService.updateChatTitle(editingChat.id, newChatTitle);
      setChats(prev => prev.map(chat =>
        chat.id === updatedChat.id ? updatedChat : chat
      ));
      setIsEditDialogOpen(false);
      setNewChatTitle("");
      setEditingChat(null);
      Helpers.showToast("Chat title updated successfully", "success");
    } catch (error) {
      Helpers.showToast("Failed to update chat title", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <motion.div
        initial={false}
        animate={{ width: isCollapsed ? '80px' : '280px' }}
        transition={{ duration: 0.3 }}
        className="h-full relative border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 max-w-[100vw]"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          {!isCollapsed ? (
            <div className="p-3 sm:p-4 flex justify-center border-b">
              <Link to="/" className="flex items-center gap-2">
                <div className="text-6xl font-bold">
                  <img src={theme != "dark" ? "/assets/awish-logo.png": "/assets/logo-dark.png"} alt="logo" className="w-40 h-auto "/>
                </div>
              </Link>
            </div>
          ): (
            <div className="p-1 sm:p-2 flex justify-center border-b">
              <Link to="/" className="flex items-center gap-2">
                <img src="/assets/favicon.png" alt="logo" className="w-40 h-auto " />
              </Link>
            </div>
          )}

          {/* New Chat Button */}
          <div className="p-3 sm:p-4">
            <Button
              className={`w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all ${isCollapsed ? 'px-0' : 'px-3 sm:px-4'}`}
              onClick={handleNewChat}
            >
              <Plus className={`${isCollapsed ? 'h-5 w-5' : 'h-4 w-4 mr-2'}`} />
              {!isCollapsed && "New Chat"}
            </Button>
          </div>

          {/* Chat History */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            <div className="space-y-1 px-2">
              {chats.map((chat) => (
                <ChatHistoryItem
                  key={chat.id}
                  id={chat.id.toString()}
                  title={chat.title}
                  date={new Date(chat.createdAt).toLocaleDateString()}
                  isCollapsed={isCollapsed}
                  onDelete={handleDelete}
                  onArchive={handleArchive}
                  onEdit={handleEdit}
                />
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="p-3 sm:p-4 border-t">
            <div className="flex flex-col gap-2">
              <Button
                variant="ghost"
                onClick={handleLogout}
                className={`w-full text-destructive hover:text-destructive hover:bg-destructive/10 ${isCollapsed ? 'justify-center px-2' : 'px-3 sm:px-4 justify-start'}`}
              >
                <LogOut className="h-4 w-4" />
                {!isCollapsed && <span className="ml-2">Log out</span>}
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Edit Chat Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Chat Title</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Chat Title</Label>
              <Input
                id="edit-name"
                value={newChatTitle}
                onChange={(e) => setNewChatTitle(e.target.value)}
                placeholder="Enter new chat title"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                setNewChatTitle("");
                setEditingChat(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateChatTitle} disabled={isLoading}>
              {isLoading ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ChatSidebar; 