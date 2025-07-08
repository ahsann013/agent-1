//@ts-nocheck
import UserMenu from "./userMenu";
import CreditTracker from "./creditTracker";
import { Button } from "@/components/ui/button";
import { SidebarIcon, ChevronLeft } from "lucide-react";
import { ModeToggle } from "@/components/theme/mode-toggle";
import useUserStore from "@/store/useUserStore";
import { useState, useImperativeHandle, forwardRef, useEffect } from "react";
import api from "@/services/api";
import { useNavigate } from "react-router";
interface ChatHeaderProps {
  variant?: "default" | "pricing";
  onToggleSidebar: () => void;
}

export interface ChatHeaderRef {
  fetchCredits: () => Promise<void>;
}

const ChatHeader = forwardRef<ChatHeaderRef, ChatHeaderProps>(({ onToggleSidebar, variant }, ref) => {
  // This would come from your user store/state
  const { user, updateUser } = useUserStore();
  const navigate = useNavigate();
  const [credits, setCredits] = useState(user?.credits);

  const fetchCredits = async () => {
    try {

      const response = await api.get("/credits");

      // Check the response structure and extract credits
      if (response.data && response.data.credits !== undefined) {
        setCredits(response.data.credits);

        // Also update the user store
        updateUser({ credits: response.data.credits });
      } else {
        console.error("Invalid credits response structure:", response.data);
      }
    } catch (error) {
      console.error("Error fetching credits:", error);
    }
  }

  // Fetch credits when component mounts
  useEffect(() => {
    fetchCredits();
  }, []);

  // Expose fetchCredits method via ref
  useImperativeHandle(ref, () => ({
    fetchCredits
  }));

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 sm:h-16 items-center px-2 sm:px-6">
        {/* Left section */}
        <div className="flex items-center gap-2 sm:gap-4">
          {variant === 'pricing' ? 
          <Button
            variant="default"
            size="icon"
            onClick={() => navigate(-1)}
            className="hover:bg-muted h-8 w-8 sm:h-10 sm:w-10"
          >
            <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button> : 
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="hover:bg-muted h-8 w-8 sm:h-10 sm:w-10"
          >
            <SidebarIcon className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>}
        </div>

        {/* Right section */}
        <div className="flex flex-1 items-center justify-end gap-2 sm:gap-6">
          <ModeToggle />

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden sm:block">
              <CreditTracker credits={credits} />
            </div>
            <div className="sm:hidden">
              <CreditTracker
                credits={credits}
                compact={true}
              />
            </div>
            {/* <NotificationMenu /> */}
            <div className="pl-1 sm:pl-2 border-l">
              <UserMenu />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
});

export default ChatHeader; 