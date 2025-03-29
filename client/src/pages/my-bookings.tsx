import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import BookingsList from "@/components/bookings/BookingsList";
import { useToast } from "@/hooks/use-toast";
import { Redirect } from "wouter";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";

const MyBookings = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to view your bookings",
        variant: "destructive",
      });
    }
  }, [isLoading, isAuthenticated, toast]);
  
  // Wait for auth state to load
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#F5F5F5]">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-t-[#00BFA5] border-opacity-50 rounded-full animate-spin"></div>
          <p className="mt-4 text-[#757575]">Loading your bookings...</p>
        </div>
      </div>
    );
  }
  
  // Redirect if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#F5F5F5]">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <LogIn className="mx-auto h-12 w-12 text-[#00BFA5] mb-4" />
          <h2 className="text-xl font-medium mb-2">Authentication Required</h2>
          <p className="text-[#757575] mb-6">Please log in to view and manage your bookings.</p>
          <Button className="bg-[#00BFA5] hover:bg-[#00BFA5]/90 w-full">
            Log In
          </Button>
        </div>
      </div>
    );
  }
  
  return <BookingsList />;
};

export default MyBookings;
