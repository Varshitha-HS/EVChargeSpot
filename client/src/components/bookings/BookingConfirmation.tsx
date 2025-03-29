import { useQuery } from "@tanstack/react-query";
import { Booking, Station } from "@shared/schema";
import { X, CheckCircle, Calendar, MapPin, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BookingConfirmationProps {
  bookingId: number;
  onClose: () => void;
}

const BookingConfirmation = ({ bookingId, onClose }: BookingConfirmationProps) => {
  // Fetch booking details
  const { data: booking, isLoading: bookingLoading } = useQuery({
    queryKey: [`/api/bookings/${bookingId}`],
  });
  
  // Fetch station details if booking is loaded
  const { data: station, isLoading: stationLoading } = useQuery({
    queryKey: [`/api/stations/${booking?.stationId}`],
    enabled: !!booking
  });
  
  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return "";
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  const formatTimeForDisplay = (dateString: string) => {
    if (!dateString) return "";
    
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };
  
  const getEndTime = (startTimeString: string, durationMinutes: number) => {
    if (!startTimeString) return "";
    
    const startTime = new Date(startTimeString);
    const endTime = new Date(startTime.getTime() + durationMinutes * 60000);
    
    return formatTimeForDisplay(endTime.toISOString());
  };
  
  const loading = bookingLoading || stationLoading;
  
  const getBookingId = () => {
    if (!booking) return "";
    return `EVC-${String(booking.id).padStart(8, '0')}`;
  };
  
  return (
    <div className="w-full md:w-96 bg-white shadow-lg overflow-y-auto">
      <div className="p-4 border-b sticky top-0 bg-white">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium">Booking Confirmed</h2>
          <button
            onClick={onClose}
            className="text-[#757575] hover:text-[#212121] p-1"
            aria-label="Close confirmation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      <div className="p-6 text-center">
        <div className="w-16 h-16 bg-[#4CAF50] rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-white" />
        </div>
        
        <h3 className="text-xl font-medium mb-2">Your booking is confirmed!</h3>
        <p className="text-[#757575] mb-6">Booking confirmation has been sent to your email.</p>
        
        {loading ? (
          <div className="bg-[#F5F5F5] rounded-lg p-4 text-left mb-6 animate-pulse">
            <div className="h-4 bg-gray-300 rounded w-3/4 mb-3"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2 mb-3"></div>
            <div className="h-4 bg-gray-300 rounded w-2/3 mb-3"></div>
            <div className="h-4 bg-gray-300 rounded w-3/4 mb-3"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2 mb-3"></div>
          </div>
        ) : (
          <div className="bg-[#F5F5F5] rounded-lg p-4 text-left mb-6">
            <h4 className="font-medium mb-3 text-center">Booking Details</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Booking ID</span>
                <span className="font-medium">{getBookingId()}</span>
              </div>
              <div className="flex justify-between">
                <span>Station</span>
                <span className="font-medium">{station?.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Address</span>
                <span className="font-medium">
                  {station?.address}, {station?.city}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Date</span>
                <span className="font-medium">
                  {formatDateForDisplay(booking?.startTime)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Time</span>
                <span className="font-medium">
                  {formatTimeForDisplay(booking?.startTime)} - {getEndTime(booking?.startTime, booking?.duration)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Slot Number</span>
                <span className="font-medium">
                  {booking?.slotId}
                </span>
              </div>
            </div>
          </div>
        )}
        
        <div className="space-y-3">
          <Button 
            className="w-full bg-[#00BFA5] hover:bg-[#00BFA5]/90 text-white"
            disabled={loading}
          >
            <Calendar className="mr-2 h-4 w-4" /> Add to Calendar
          </Button>
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => window.location.href = '/bookings'}
            disabled={loading}
          >
            View in My Bookings
          </Button>
          <Button 
            variant="outline" 
            className="w-full"
            disabled={loading}
          >
            <Navigation className="mr-2 h-4 w-4" /> Get Directions
          </Button>
        </div>
        
        <div className="mt-6 text-sm text-[#757575]">
          <p>Need help? <a href="#" className="text-[#1976D2] hover:underline">Contact Support</a></p>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
