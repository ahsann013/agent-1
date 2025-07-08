import { Button } from "@/components/ui/button";
import {
  Users,
  LogOut,
  AppWindowIcon,
  UserRound,
  BotIcon,
  BadgeDollarSign,
  LucideDollarSign,
  BoxIcon,
  LayoutDashboard,
} from "lucide-react";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import useUserStore from "@/store/useUserStore";
import { useTheme } from "../theme/theme-provider";
interface AdminSidebarProps {
  isCollapsed: boolean;
}

const AdminSidebar = ({ isCollapsed }: AdminSidebarProps) => {
  const { clearUser } = useUserStore();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const handleLogout = () => {
    clearUser();
    localStorage.removeItem("captcha-storage");
    navigate("/login");
  };

  const { pathname } = useLocation();

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/admin/dashboard" },
    { icon: Users, label: "Users", path: "/admin/users" },
    { icon: AppWindowIcon, label: "API", path: "/admin/api" },
    { icon: BotIcon, label: "LLM", path: "/admin/llm" },
    { icon: UserRound, label: "Profile", path: "/admin/profile" },
    { icon: BoxIcon, label: "Plans", path: "/admin/plans" },
    { icon: LucideDollarSign, label: "Pricing", path: "/admin/pricing" },
    {
      icon: BadgeDollarSign,
      label: "Transactions",
      path: "/admin/transactions",
    },
  ];

  return (
    <motion.div
      initial={false}
      animate={{ width: isCollapsed ? "80px" : "280px" }}
      transition={{ duration: 0.3 }}
      className="relative border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b">
          <Link to="/admin/dashboard" className="flex items-center gap-2">
            {!isCollapsed && (
              <>
                <div className="text-6xl font-bold">
                  <img
                    src={
                      theme === "dark"
                        ? " /assets/logo-dark.png"
                        : "/assets/awish-logo.png"
                    }
                    alt="logo"
                    className="w-40 h-auto"
                  />
                </div>
              </>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <div className="flex-1 p-4">
          <div className="space-y-2">
            {menuItems.map((item) => (
              <Link key={item.path} to={item.path}>
                <Button
                  variant="ghost"
                  className={`w-full justify-start ${
                    isCollapsed ? "px-2" : "px-4"
                  } ${
                    pathname.includes(item.path) ? "!bg-accent !text-white" : ""
                  }`}
                >
                  <item.icon className={`h-5 w-5 ${!isCollapsed && "mr-2"}`} />
                  {!isCollapsed && <span>{item.label}</span>}
                </Button>
              </Link>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t p-4">
          <div className="space-y-2">
            <Button
              variant="ghost"
              onClick={handleLogout}
              className={`w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 ${
                isCollapsed ? "px-2" : "px-4"
              }`}
            >
              <LogOut className={`h-5 w-5 ${!isCollapsed && "mr-2"}`} />
              {!isCollapsed && <span>Logout</span>}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminSidebar;
