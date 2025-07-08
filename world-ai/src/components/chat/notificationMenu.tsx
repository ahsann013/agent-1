import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu";
  import { Bell } from "lucide-react";
  import { Button } from "@/components/ui/button";
  import { cn } from "@/lib/utils";
  
  interface Notification {
    id: string;
    title: string;
    message: string;
    timestamp: string;
    read: boolean;
  }
  
  const NotificationMenu = () => {
    // This would come from your notification store/state
    const notifications: Notification[] = [
      {
        id: "1",
        title: "Credits Updated",
        message: "Your credit balance has been updated",
        timestamp: "2 minutes ago",
        read: false,
      },
      // Add more notifications as needed
    ];
  
    const unreadCount = notifications.filter(n => !n.read).length;
  
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className={cn(
              "relative transition-colors",
              unreadCount > 0 && "text-primary hover:text-primary"
            )}
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-80" align="end">
          <DropdownMenuLabel className="flex items-center justify-between">
            <span>Notifications</span>
            {unreadCount > 0 && (
              <span className="text-xs font-normal text-primary">
                {unreadCount} new
              </span>
            )}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <DropdownMenuItem 
                key={notification.id} 
                className={cn(
                  "flex flex-col items-start p-4",
                  !notification.read && "bg-primary/5"
                )}
              >
                <div className="flex w-full justify-between">
                  <span className="font-medium">{notification.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {notification.timestamp}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{notification.message}</p>
              </DropdownMenuItem>
            ))
          ) : (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No notifications
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };
  
  export default NotificationMenu;