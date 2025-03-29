import { useState } from "react";
import { useLocation } from "wouter";
import { Building2, CalendarClock, Users, BarChart3, ChartPieIcon, Settings, Key } from "lucide-react";

interface AdminSidebarProps {
  onMenuSelect?: (menu: string) => void;
}

const AdminSidebar = ({ onMenuSelect }: AdminSidebarProps) => {
  const [activeMenu, setActiveMenu] = useState("stations");
  const [location, setLocation] = useLocation();
  
  const handleMenuClick = (menu: string) => {
    setActiveMenu(menu);
    if (onMenuSelect) {
      onMenuSelect(menu);
    }
  };
  
  const menuItemClass = (menu: string) => {
    return activeMenu === menu
      ? "flex items-center px-3 py-2 rounded-md bg-[#00BFA5] bg-opacity-10 text-[#00BFA5]"
      : "flex items-center px-3 py-2 rounded-md text-[#212121] hover:bg-[#F5F5F5]";
  };
  
  return (
    <div className="w-full md:w-64 bg-white border-r overflow-y-auto">
      <div className="p-4">
        <h2 className="text-lg font-medium">Admin Dashboard</h2>
      </div>
      
      <div className="border-t">
        <div className="p-2">
          <div className="text-xs font-medium text-[#757575] uppercase tracking-wider px-3 py-2">Management</div>
          <a 
            href="#" 
            className={menuItemClass("stations")}
            onClick={(e) => { 
              e.preventDefault();
              handleMenuClick("stations");
            }}
          >
            <Building2 className="w-5 h-5 mr-3" />
            <span>Stations</span>
          </a>
          <a 
            href="#" 
            className={menuItemClass("bookings")}
            onClick={(e) => { 
              e.preventDefault();
              handleMenuClick("bookings");
            }}
          >
            <CalendarClock className="w-5 h-5 mr-3" />
            <span>Bookings</span>
          </a>
          <a 
            href="#" 
            className={menuItemClass("users")}
            onClick={(e) => { 
              e.preventDefault();
              handleMenuClick("users");
            }}
          >
            <Users className="w-5 h-5 mr-3" />
            <span>Users</span>
          </a>
        </div>
        
        <div className="p-2">
          <div className="text-xs font-medium text-[#757575] uppercase tracking-wider px-3 py-2">Analytics</div>
          <a 
            href="#" 
            className={menuItemClass("reports")}
            onClick={(e) => { 
              e.preventDefault();
              handleMenuClick("reports");
            }}
          >
            <BarChart3 className="w-5 h-5 mr-3" />
            <span>Reports</span>
          </a>
          <a 
            href="#" 
            className={menuItemClass("statistics")}
            onClick={(e) => { 
              e.preventDefault();
              handleMenuClick("statistics");
            }}
          >
            <ChartPieIcon className="w-5 h-5 mr-3" />
            <span>Statistics</span>
          </a>
        </div>
        
        <div className="p-2">
          <div className="text-xs font-medium text-[#757575] uppercase tracking-wider px-3 py-2">System</div>
          <a 
            href="#" 
            className={menuItemClass("settings")}
            onClick={(e) => { 
              e.preventDefault();
              handleMenuClick("settings");
            }}
          >
            <Settings className="w-5 h-5 mr-3" />
            <span>Settings</span>
          </a>
          <a 
            href="#" 
            className={menuItemClass("api-keys")}
            onClick={(e) => { 
              e.preventDefault();
              handleMenuClick("api-keys");
            }}
          >
            <Key className="w-5 h-5 mr-3" />
            <span>API Keys</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;
