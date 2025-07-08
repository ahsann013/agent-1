//@ts-nocheck
import { useState, useEffect, useRef, createContext, useContext } from "react";
import ChatHeader, { ChatHeaderRef } from "@/components/chat/chatHeader";
import ChatSidebar from "@/components/chat/chatSidebar";
import { Outlet } from "react-router-dom";
import { useMediaQuery } from "@/hooks/useMediaQuery";

// Create context for the header ref
export const ChatHeaderContext = createContext<{ headerRef: React.RefObject<ChatHeaderRef> | null }>({
    headerRef: null
});

// Hook to access the header ref
export const useChatHeader = () => useContext(ChatHeaderContext);

const ChatLayout = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const isMobile = useMediaQuery("(max-width: 768px)");
    const headerRef = useRef<ChatHeaderRef>(null);

    useEffect(() => {
        if (isMobile) {
            setIsCollapsed(true);
        }
    }, [isMobile]);

    return (
        <ChatHeaderContext.Provider value={{ headerRef }}>
            <div className="h-[100dvh] w-screen flex bg-background overflow-hidden max-w-[100vw]">
                <div className={`${isCollapsed && isMobile ? 'hidden' : 'block'} z-30 h-full flex flex-col shrink-0`}>
                    <ChatSidebar isCollapsed={isCollapsed} />
                </div>

                <div className="flex-1 flex flex-col h-full relative min-w-0">
                    <ChatHeader
                        ref={headerRef}
                        onToggleSidebar={() => setIsCollapsed(!isCollapsed)}
                    />
                    <main className={`${isMobile && !isCollapsed ? "hidden" : ""} flex-1 overflow-y-auto relative flex flex-col max-h-[calc(100dvh-4rem)]`}>
                        <Outlet />
                    </main>
                </div>
            </div>
        </ChatHeaderContext.Provider>
    );
};

export default ChatLayout;