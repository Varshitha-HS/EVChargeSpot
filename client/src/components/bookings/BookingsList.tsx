import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Booking, Station } from "@shared/schema";
import { useAuth } from "@/context/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, CheckCircle, Clock, AlertTriangle, XCircle } from "lucide-react";

const BookingsList = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("upcoming");
  
  // Fetch user's bookings
  const { data: bookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: [`/api/users/${user?.id}/bookings`],
    enabled: !!user
  });
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
  
  // Format time for display
  const formatTime = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true
    };
    return new Date(dateString).toLocaleTimeString('en-US', options);
  };
  
  // Calculate end time based on start time and duration
  const calculateEndTime = (startTime: string, durationMinutes: number) => {
    const start = new Date(startTime);
    const end = new Date(start.getTime() + durationMinutes * 60000);
    return formatTime(end.toString());
  };
  
  // Filter bookings based on status and current time
  const filterBookings = (bookings: Booking[], filter: string) => {
    if (!bookings?.length) return [];
    
    const now = new Date();
    
    switch (filter) {
      case "upcoming":
        return bookings.filter(booking => 
          booking.status === "confirmed" && 
          new Date(booking.startTime) > now
        );
      case "past":
        return bookings.filter(booking => 
          booking.status === "completed" || 
          (booking.status === "confirmed" && new Date(booking.startTime) < now)
        );
      case "canceled":
        return bookings.filter(booking => 
          booking.status === "cancelled"
        );
      default:
        return [];
    }
  };
  
  const upcomingBookings = filterBookings(bookings, "upcoming");
  const pastBookings = filterBookings(bookings, "past");
  const canceledBookings = filterBookings(bookings, "canceled");
  
  // Loading skeleton
  const BookingSkeleton = () => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
          <div>
            <div className="h-5 bg-gray-200 rounded w-40 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-60"></div>
          </div>
          <div className="mt-2 md:mt-0">
            <div className="h-6 bg-gray-200 rounded w-24"></div>
          </div>
        </div>
        
        <div className="border-t pt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
            <div className="h-5 bg-gray-200 rounded w-32 mb-1"></div>
            <div className="h-4 bg-gray-200 rounded w-20"></div>
          </div>
          <div>
            <div className="h-4 bg-gray-200 rounded w-28 mb-1"></div>
            <div className="h-5 bg-gray-200 rounded w-36 mb-1"></div>
            <div className="h-4 bg-gray-200 rounded w-16"></div>
          </div>
          <div>
            <div className="h-4 bg-gray-200 rounded w-20 mb-1"></div>
            <div className="h-5 bg-gray-200 rounded w-28"></div>
          </div>
        </div>
        
        <div className="border-t mt-4 pt-4 flex justify-end">
          <div className="h-9 bg-gray-200 rounded w-24 mx-1"></div>
          <div className="h-9 bg-gray-200 rounded w-24 mx-1"></div>
          <div className="h-9 bg-gray-200 rounded w-24 mx-1"></div>
        </div>
      </div>
    </div>
  );
  
  // Empty state component
  const EmptyState = ({ type }: { type: string }) => {
    let title, description, icon;
    
    switch (type) {
      case "upcoming":
        title = "No upcoming bookings";
        description = "You don't have any upcoming charging station bookings.";
        icon = <Calendar className="w-8 h-8 text-[#757575]" />;
        break;
      case "past":
        title = "No past bookings";
        description = "You don't have any past charging station bookings.";
        icon = <Clock className="w-8 h-8 text-[#757575]" />;
        break;
      case "canceled":
        title = "No canceled bookings";
        description = "You don't have any canceled charging station bookings.";
        icon = <XCircle className="w-8 h-8 text-[#757575]" />;
        break;
      default:
        title = "No bookings";
        description = "You don't have any bookings yet.";
        icon = <Calendar className="w-8 h-8 text-[#757575]" />;
    }
    
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <div className="w-16 h-16 mx-auto bg-[#F5F5F5] rounded-full flex items-center justify-center mb-4">
          {icon}
        </div>
        <h3 className="text-lg font-medium mb-2">{title}</h3>
        <p className="text-[#757575] mb-6">{description}</p>
        <Button className="bg-[#00BFA5] hover:bg-[#00BFA5]/90 text-white">
          Find Charging Stations
        </Button>
      </div>
    );
  };
  
  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    let classes = "px-3 py-1 rounded-full text-sm font-medium";
    let label = status;
    
    switch (status) {
      case "confirmed":
        classes += " bg-[#4CAF50] bg-opacity-10 text-[#4CAF50]";
        label = "Confirmed";
        break;
      case "completed":
        classes += " bg-[#1976D2] bg-opacity-10 text-[#1976D2]";
        label = "Completed";
        break;
      case "cancelled":
        classes += " bg-[#757575] bg-opacity-10 text-[#757575]";
        label = "Canceled";
        break;
      case "in_progress":
        classes += " bg-[#FFC107] bg-opacity-10 text-[#FFC107]";
        label = "In Progress";
        break;
      default:
        classes += " bg-[#757575] bg-opacity-10 text-[#757575]";
    }
    
    return <span className={classes}>{label}</span>;
  };
  
  return (
    <div className="flex-1 overflow-y-auto bg-[#F5F5F5] p-6">
      <div>
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-medium">My Bookings</h1>
          <p className="text-[#757575]">View and manage your charging station bookings</p>
        </div>
        
        {/* Booking Tabs */}
        <Tabs defaultValue="upcoming" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="upcoming">Upcoming Bookings</TabsTrigger>
            <TabsTrigger value="past">Past Bookings</TabsTrigger>
            <TabsTrigger value="canceled">Canceled Bookings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upcoming" className="space-y-6">
            {bookingsLoading ? (
              Array(2).fill(0).map((_, index) => <BookingSkeleton key={index} />)
            ) : upcomingBookings.length > 0 ? (
              upcomingBookings.map((booking: Booking) => (
                <div key={booking.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                      <div>
                        <h2 className="text-lg font-medium">Bay Area Superchargers</h2>
                        <p className="text-[#757575] text-sm">789 Bay Street, San Francisco, CA</p>
                      </div>
                      <div className="mt-2 md:mt-0">
                        <StatusBadge status={booking.status} />
                      </div>
                    </div>
                    
                    <div className="border-t pt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <div className="text-sm text-[#757575]">Date & Time</div>
                        <div className="font-medium">
                          {formatDate(booking.startTime)} • {formatTime(booking.startTime)}
                        </div>
                        <div className="text-sm text-[#757575]">
                          Duration: {Math.floor(booking.duration / 60)} hour{booking.duration >= 120 ? 's' : ''}
                          {booking.duration % 60 > 0 ? ` ${booking.duration % 60} min` : ''}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-[#757575]">Station Details</div>
                        <div className="font-medium">
                          Slot #{booking.slotId} • {booking.connectorType}
                        </div>
                        <div className="text-sm text-[#757575]">
                          ${(booking.estimatedCost / (booking.duration / 60)).toFixed(2)}/kWh
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-[#757575]">Booking ID</div>
                        <div className="font-medium">
                          EVC-{String(booking.id).padStart(8, '0')}
                        </div>
                      </div>
                    </div>
                    
                    <div className="border-t mt-4 pt-4 flex flex-col md:flex-row md:items-center md:justify-between">
                      <div className="text-sm">
                        <span className="text-[#757575]">Booked on </span>
                        <span className="font-medium">{formatDate(booking.createdAt)}</span>
                      </div>
                      <div className="mt-3 md:mt-0 flex space-x-3">
                        <Button size="sm" className="bg-[#00BFA5] hover:bg-[#00BFA5]/90 text-white">
                          Get Directions
                        </Button>
                        <Button size="sm" variant="outline">
                          Modify
                        </Button>
                        <Button size="sm" variant="outline">
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState type="upcoming" />
            )}
          </TabsContent>
          
          <TabsContent value="past" className="space-y-6">
            {bookingsLoading ? (
              Array(2).fill(0).map((_, index) => <BookingSkeleton key={index} />)
            ) : pastBookings.length > 0 ? (
              pastBookings.map((booking: Booking) => (
                <div key={booking.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                      <div>
                        <h2 className="text-lg font-medium">Bay Area Superchargers</h2>
                        <p className="text-[#757575] text-sm">789 Bay Street, San Francisco, CA</p>
                      </div>
                      <div className="mt-2 md:mt-0">
                        <StatusBadge status={booking.status} />
                      </div>
                    </div>
                    
                    <div className="border-t pt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <div className="text-sm text-[#757575]">Date & Time</div>
                        <div className="font-medium">
                          {formatDate(booking.startTime)} • {formatTime(booking.startTime)}
                        </div>
                        <div className="text-sm text-[#757575]">
                          Duration: {Math.floor(booking.duration / 60)} hour{booking.duration >= 120 ? 's' : ''}
                          {booking.duration % 60 > 0 ? ` ${booking.duration % 60} min` : ''}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-[#757575]">Station Details</div>
                        <div className="font-medium">
                          Slot #{booking.slotId} • {booking.connectorType}
                        </div>
                        <div className="text-sm text-[#757575]">
                          ${(booking.estimatedCost / (booking.duration / 60)).toFixed(2)}/kWh
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-[#757575]">Booking ID</div>
                        <div className="font-medium">
                          EVC-{String(booking.id).padStart(8, '0')}
                        </div>
                      </div>
                    </div>
                    
                    <div className="border-t mt-4 pt-4 flex flex-col md:flex-row md:items-center md:justify-between">
                      <div className="text-sm">
                        <span className="text-[#757575]">Booked on </span>
                        <span className="font-medium">{formatDate(booking.createdAt)}</span>
                      </div>
                      <div className="mt-3 md:mt-0">
                        <Button size="sm" variant="outline">
                          Book Again
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState type="past" />
            )}
          </TabsContent>
          
          <TabsContent value="canceled" className="space-y-6">
            {bookingsLoading ? (
              Array(2).fill(0).map((_, index) => <BookingSkeleton key={index} />)
            ) : canceledBookings.length > 0 ? (
              canceledBookings.map((booking: Booking) => (
                <div key={booking.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                      <div>
                        <h2 className="text-lg font-medium">Bay Area Superchargers</h2>
                        <p className="text-[#757575] text-sm">789 Bay Street, San Francisco, CA</p>
                      </div>
                      <div className="mt-2 md:mt-0">
                        <StatusBadge status="cancelled" />
                      </div>
                    </div>
                    
                    <div className="border-t pt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <div className="text-sm text-[#757575]">Date & Time</div>
                        <div className="font-medium">
                          {formatDate(booking.startTime)} • {formatTime(booking.startTime)}
                        </div>
                        <div className="text-sm text-[#757575]">
                          Duration: {Math.floor(booking.duration / 60)} hour{booking.duration >= 120 ? 's' : ''}
                          {booking.duration % 60 > 0 ? ` ${booking.duration % 60} min` : ''}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-[#757575]">Station Details</div>
                        <div className="font-medium">
                          Slot #{booking.slotId} • {booking.connectorType}
                        </div>
                        <div className="text-sm text-[#757575]">
                          ${(booking.estimatedCost / (booking.duration / 60)).toFixed(2)}/kWh
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-[#757575]">Booking ID</div>
                        <div className="font-medium">
                          EVC-{String(booking.id).padStart(8, '0')}
                        </div>
                      </div>
                    </div>
                    
                    <div className="border-t mt-4 pt-4 flex flex-col md:flex-row md:items-center md:justify-between">
                      <div className="text-sm">
                        <span className="text-[#757575]">Canceled on </span>
                        <span className="font-medium">{formatDate(booking.createdAt)}</span>
                      </div>
                      <div className="mt-3 md:mt-0">
                        <Button size="sm" variant="outline">
                          Book Again
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState type="canceled" />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default BookingsList;
