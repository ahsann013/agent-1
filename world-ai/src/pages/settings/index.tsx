//@ts-nocheck
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme/theme-provider";
import {
  User,
  XIcon,
  SettingsIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import useUserStore from "@/store/useUserStore";


const SettingsLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { user } = useUserStore();
  const { theme } = useTheme();

  const handleClose = () => {
    if (user?.role === "admin") {
      navigate("/admin/dashboard");
    } else {
      navigate("/chat/new");
    }
  };


  const userNavItems = [
    {
      icon: User,
      label: "Profile",
      href: "/settings/profile"
    },
    {
      icon: SettingsIcon,
      label: "Preferences",
      href: "/settings/preferences"
    },
  ] 

  const adminNavItems = [
    {
      icon: User,
      label: "Profile",
      href: "/admin/settings/profile"
    },
  ]

  const settingsNavItems = user?.role === "admin" ? adminNavItems : userNavItems;

  return (
    <div className={`h-screen flex flex-col ${theme === 'light'
        ? 'bg-gradient-to-br from-background via-primary/5 to-secondary/5'
        : 'bg-gradient-to-br from-background via-primary/20 to-background'
      }`}>
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-between px-6">
          <h1 className="text-xl font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Settings
          </h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="h-8 w-8 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <XIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <div className="container mx-auto p-6 max-w-7xl h-full">
          <div className="flex gap-8 h-full bg-background/60 backdrop-blur-xl rounded-lg border shadow-sm">
            {/* Navigation Sidebar */}
            <div className="w-64 shrink-0 p-4 border-r">
              <nav className="space-y-1">
                {settingsNavItems.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      location.pathname === item.href
                        ? "bg-gradient-to-r from-primary/10 to-secondary/10 text-primary dark:text-secondary"
                        : "text-muted-foreground hover:bg-muted"
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-6 overflow-y-auto">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsLayout;
