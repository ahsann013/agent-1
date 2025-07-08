import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu";
  import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
  import { Settings, User, CreditCard, Mail, LogOut } from "lucide-react";
  import { useNavigate } from "react-router-dom";
  import useUserStore from "@/store/useUserStore";
  
  const UserMenu = () => {
    const navigate = useNavigate();
    const { user, clearUser } = useUserStore();
  
    const handleLogout = () => {
      clearUser();
      localStorage.removeItem('captcha-storage');
      navigate("/login");
    };
  
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Avatar className="h-8 w-8 cursor-pointer">
            <AvatarImage src={user?.profileImage as string || "/avatars/default.png"} />
            <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end">
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate("/settings/profile")}>
            <User className="mr-2 h-4 w-4" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate("/settings")}>
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate("/products")}>
            <CreditCard className="mr-2 h-4 w-4" />
            Upgrade Plan
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate("/contact")}>
            <Mail className="mr-2 h-4 w-4" />
            Contact Us
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="text-red-600">
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };
  
  export default UserMenu;