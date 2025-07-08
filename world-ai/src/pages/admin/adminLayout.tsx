import { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminHeader from "@/components/admin/adminHeader";
import AdminSidebar from "@/components/admin/adminSidebar";

const AdminLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="h-screen flex bg-background">
      <AdminSidebar isCollapsed={isCollapsed} />
      
      <div className="flex-1 flex flex-col h-full">
        <AdminHeader 
          onToggleSidebar={() => setIsCollapsed(!isCollapsed)} 
        />
        <div className="flex-1 overflow-auto relative p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
