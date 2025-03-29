import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import AdminSidebar from "@/components/admin/AdminSidebar";
import StationsTable from "@/components/admin/StationsTable";
import { useToast } from "@/hooks/use-toast";
import { Redirect } from "wouter";
import { Button } from "@/components/ui/button";
import { Lock, Building2, CalendarClock, Users, BarChart3, AlertTriangle } from "lucide-react";

const Admin = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [activeMenu, setActiveMenu] = useState("stations");
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to access the admin dashboard",
        variant: "destructive",
      });
    } else if (!isLoading && isAuthenticated && user?.role !== "admin") {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access the admin dashboard",
        variant: "destructive",
      });
    }
  }, [isLoading, isAuthenticated, user, toast]);
  
  // Wait for auth state to load
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#F5F5F5]">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-t-[#00BFA5] border-opacity-50 rounded-full animate-spin"></div>
          <p className="mt-4 text-[#757575]">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }
  
  // Redirect if not authenticated or not an admin
  if (!isAuthenticated) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#F5F5F5]">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <Lock className="mx-auto h-12 w-12 text-[#00BFA5] mb-4" />
          <h2 className="text-xl font-medium mb-2">Authentication Required</h2>
          <p className="text-[#757575] mb-6">Please log in to access the admin dashboard.</p>
          <Button className="bg-[#00BFA5] hover:bg-[#00BFA5]/90 w-full">
            Log In
          </Button>
        </div>
      </div>
    );
  }
  
  if (user?.role !== "admin") {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#F5F5F5]">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-[#FFC107] mb-4" />
          <h2 className="text-xl font-medium mb-2">Access Denied</h2>
          <p className="text-[#757575] mb-6">You don't have permission to access the admin dashboard.</p>
          <Button className="bg-[#00BFA5] hover:bg-[#00BFA5]/90 w-full" onClick={() => window.location.href = "/"}>
            Return to Home
          </Button>
        </div>
      </div>
    );
  }
  
  const renderContent = () => {
    switch (activeMenu) {
      case "stations":
        return <StationsTable />;
      case "bookings":
        return (
          <div className="p-6">
            <h1 className="text-2xl font-medium mb-4">Bookings Management</h1>
            <div className="bg-white p-8 rounded-lg shadow text-center">
              <CalendarClock className="mx-auto h-12 w-12 text-[#1976D2] mb-4" />
              <p className="text-[#757575]">Bookings management interface coming soon</p>
            </div>
          </div>
        );
      case "users":
        return (
          <div className="p-6">
            <h1 className="text-2xl font-medium mb-4">User Management</h1>
            <div className="bg-white p-8 rounded-lg shadow text-center">
              <Users className="mx-auto h-12 w-12 text-[#1976D2] mb-4" />
              <p className="text-[#757575]">User management interface coming soon</p>
            </div>
          </div>
        );
      case "reports":
      case "statistics":
        return (
          <div className="p-6">
            <h1 className="text-2xl font-medium mb-4">Analytics Dashboard</h1>
            <div className="bg-white p-8 rounded-lg shadow text-center">
              <BarChart3 className="mx-auto h-12 w-12 text-[#1976D2] mb-4" />
              <p className="text-[#757575]">Analytics dashboard coming soon</p>
            </div>
          </div>
        );
      default:
        return (
          <div className="p-6">
            <h1 className="text-2xl font-medium mb-4">System Settings</h1>
            <div className="bg-white p-8 rounded-lg shadow text-center">
              <Building2 className="mx-auto h-12 w-12 text-[#1976D2] mb-4" />
              <p className="text-[#757575]">System settings interface coming soon</p>
            </div>
          </div>
        );
    }
  };
  
  return (
    <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
      <AdminSidebar onMenuSelect={setActiveMenu} />
      <div className="flex-1 overflow-y-auto bg-[#F5F5F5]">
        {renderContent()}
      </div>
    </div>
  );
};

export default Admin;
