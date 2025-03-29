import { useState } from "react";
import { Station, Slot, InsertBooking } from "@shared/schema";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { X, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";

interface BookingFormProps {
  station: Station;
  onClose: () => void;
  onComplete: (bookingId: number) => void;
}

enum BookingStep {
  SelectTime = 1,
  VehicleConnector = 2,
  PaymentConfirmation = 3
}

const BookingForm = ({ station, onClose, onComplete }: BookingFormProps) => {
  const [currentStep, setCurrentStep] = useState<BookingStep>(BookingStep.SelectTime);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState<string>("09:00");
  const [selectedDuration, setSelectedDuration] = useState<number>(60); // minutes
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [selectedConnector, setSelectedConnector] = useState<string>("");
  const [selectedVehicle, setSelectedVehicle] = useState<string>("");
  const [agreeToTerms, setAgreeToTerms] = useState<boolean>(false);
  
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Fetch slots for this station
  const { data: slots = [], isLoading: slotsLoading } = useQuery({
    queryKey: [`/api/stations/${station.id}/slots`],
  });
  
  // Fetch user's vehicles if logged in
  const { data: vehicles = [], isLoading: vehiclesLoading } = useQuery({
    queryKey: [`/api/users/${user?.id}/vehicles`],
    enabled: !!user
  });
  
  // Date/time utilities
  const formatDateForDisplay = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  const formatTimeForDisplay = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${period}`;
  };
  
  const getEndTime = (timeString: string, durationMinutes: number) => {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));
    date.setMinutes(date.getMinutes() + durationMinutes);
    
    const endHour = date.getHours();
    const endMinutes = date.getMinutes();
    
    return `${endHour.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
  };
  
  const getFormattedTimeRange = (startTime: string, durationMinutes: number) => {
    const endTime = getEndTime(startTime, durationMinutes);
    return `${formatTimeForDisplay(startTime)} - ${formatTimeForDisplay(endTime)}`;
  };
  
  // Create booking mutation
  const createBookingMutation = useMutation({
    mutationFn: async (bookingData: any) => {
      const response = await apiRequest("POST", "/api/bookings", bookingData);
      return response.json();
    },
    onSuccess: (data) => {
      onComplete(data.id);
    },
    onError: (error) => {
      toast({
        title: "Booking Failed",
        description: error instanceof Error ? error.message : "Failed to create booking",
        variant: "destructive"
      });
    }
  });
  
  // Format duration for display
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours === 0) {
      return `${remainingMinutes} minutes`;
    } else if (hours === 1 && remainingMinutes === 0) {
      return "1 hour";
    } else if (remainingMinutes === 0) {
      return `${hours} hours`;
    } else {
      return `${hours} hour${hours > 1 ? 's' : ''} ${remainingMinutes} min`;
    }
  };
  
  // Time slots for selection
  const timeSlots = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const formattedHour = hour.toString().padStart(2, '0');
      const formattedMinute = minute.toString().padStart(2, '0');
      timeSlots.push(`${formattedHour}:${formattedMinute}`);
    }
  }
  
  // Handle form submission
  const handleBookingSubmit = () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to complete your booking",
        variant: "destructive"
      });
      return;
    }
    
    if (!selectedSlot) {
      toast({
        title: "Slot Required",
        description: "Please select a charging slot",
        variant: "destructive"
      });
      return;
    }
    
    if (!selectedConnector) {
      toast({
        title: "Connector Required",
        description: "Please select a connector type",
        variant: "destructive"
      });
      return;
    }
    
    if (!agreeToTerms) {
      toast({
        title: "Terms Agreement Required",
        description: "Please agree to the terms of service",
        variant: "destructive"
      });
      return;
    }
    
    // Calculate start time
    const bookingDate = new Date(selectedDate);
    const [hours, minutes] = selectedTime.split(':');
    bookingDate.setHours(parseInt(hours, 10), parseInt(minutes, 10));
    
    // Calculate estimated cost
    const estimatedCost = station.pricePerKwh * (selectedDuration / 60) * 30; // Assuming 30kWh for the duration
    
    const bookingData = {
      userId: user.id,
      stationId: station.id,
      slotId: selectedSlot.id,
      bookingDate: new Date(),
      startTime: bookingDate,
      duration: selectedDuration,
      status: "confirmed",
      vehicle: selectedVehicle,
      connectorType: selectedConnector,
      estimatedCost: estimatedCost
    };
    
    createBookingMutation.mutate(bookingData);
  };
  
  // Handle duration changes
  const decreaseDuration = () => {
    setSelectedDuration(prev => (prev > 30 ? prev - 30 : prev));
  };
  
  const increaseDuration = () => {
    setSelectedDuration(prev => prev + 30);
  };
  
  return (
    <div className="w-full md:w-96 bg-white shadow-lg overflow-y-auto">
      <div className="p-4 border-b sticky top-0 bg-white">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium">Book a Charging Slot</h2>
          <button
            onClick={onClose}
            className="text-[#757575] hover:text-[#212121] p-1"
            aria-label="Close booking form"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      {/* Booking Steps */}
      <div className="p-4">
        {/* Step Indicators */}
        <div className="flex justify-between items-center mb-6 relative">
          <div className="absolute top-1/2 h-0.5 bg-[#F5F5F5] w-full -z-10"></div>
          {[1, 2, 3].map((step) => (
            <div 
              key={step}
              className={`step-indicator ${
                currentStep >= step 
                  ? "bg-[#00BFA5] text-white" 
                  : "bg-[#F5F5F5] text-[#757575]"
              } w-8 h-8 rounded-full flex items-center justify-center z-10`}
            >
              <span>{step}</span>
            </div>
          ))}
        </div>
        
        {/* Step 1: Select Time */}
        {currentStep === BookingStep.SelectTime && (
          <div className="booking-step">
            <h3 className="font-medium mb-4">Select Date & Time</h3>
            
            <div className="mb-4">
              <FormLabel>Date</FormLabel>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full mt-1"
              />
            </div>
            
            <div className="mb-6">
              <FormLabel>Preferred Time</FormLabel>
              <Select
                value={selectedTime}
                onValueChange={setSelectedTime}
              >
                <SelectTrigger className="w-full mt-1">
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((time) => (
                    <SelectItem key={time} value={time}>
                      {formatTimeForDisplay(time)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="mb-6">
              <FormLabel>Duration</FormLabel>
              <div className="flex items-center mt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={decreaseDuration}
                  className="rounded-l-md rounded-r-none"
                  disabled={selectedDuration <= 30}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="px-4 py-2 border-t border-b text-center min-w-[120px]">
                  <span>{formatDuration(selectedDuration)}</span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={increaseDuration}
                  className="rounded-r-md rounded-l-none"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="mb-6">
              <h4 className="font-medium mb-2">Available Slots</h4>
              {slotsLoading ? (
                <div className="grid grid-cols-4 gap-2">
                  {Array(8).fill(0).map((_, index) => (
                    <Skeleton key={index} className="h-12" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {slots
                    .filter((slot: Slot) => slot.status === "available")
                    .map((slot: Slot) => (
                      <div key={slot.id} className="text-center cursor-pointer">
                        <div 
                          className={`h-12 w-full rounded-md ${
                            selectedSlot?.id === slot.id
                              ? "border-2 border-[#00BFA5] bg-[#00BFA5] bg-opacity-10 text-[#00BFA5]"
                              : "bg-[#4CAF50] text-white hover:bg-opacity-90"
                          } flex items-center justify-center mb-1`}
                          onClick={() => setSelectedSlot(slot)}
                        >
                          <span className="font-medium">{slot.slotNumber}</span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
              {!slotsLoading && slots.filter((slot: Slot) => slot.status === "available").length === 0 && (
                <div className="text-center p-4 bg-[#F5F5F5] rounded-md">
                  <p className="text-[#757575]">No slots available at this time</p>
                </div>
              )}
            </div>
            
            <div className="flex space-x-3">
              <Button 
                variant="outline"
                className="flex-1"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button 
                className="flex-1 bg-[#00BFA5] hover:bg-[#00BFA5]/90 text-white"
                onClick={() => setCurrentStep(BookingStep.VehicleConnector)}
                disabled={!selectedSlot}
              >
                Next
              </Button>
            </div>
          </div>
        )}
        
        {/* Step 2: Vehicle & Connector */}
        {currentStep === BookingStep.VehicleConnector && (
          <div className="booking-step">
            <h3 className="font-medium mb-4">Vehicle & Connector</h3>
            
            <div className="mb-4">
              <FormLabel>Your Vehicle</FormLabel>
              <Select
                value={selectedVehicle}
                onValueChange={setSelectedVehicle}
              >
                <SelectTrigger className="w-full mt-1">
                  <SelectValue placeholder="Select your vehicle" />
                </SelectTrigger>
                <SelectContent>
                  {vehiclesLoading ? (
                    <SelectItem value="loading" disabled>Loading vehicles...</SelectItem>
                  ) : vehicles && vehicles.length > 0 ? (
                    vehicles.map((vehicle: any) => (
                      <SelectItem key={vehicle.id} value={`${vehicle.make} ${vehicle.model} (${vehicle.year})`}>
                        {vehicle.make} {vehicle.model} ({vehicle.year})
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>No vehicles found</SelectItem>
                  )}
                  <SelectItem value="Tesla Model 3 (2021)">Tesla Model 3 (2021)</SelectItem>
                  <SelectItem value="new">Add new vehicle</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="mb-6">
              <FormLabel>Connector Type</FormLabel>
              <div className="grid grid-cols-2 gap-3 mt-1">
                {station.connectorTypes.map((type) => (
                  <div 
                    key={type}
                    onClick={() => setSelectedConnector(type)}
                    className={`border rounded-md p-3 flex items-center cursor-pointer ${
                      selectedConnector === type ? "bg-[#00BFA5] bg-opacity-10 border-[#00BFA5]" : ""
                    }`}
                  >
                    <input 
                      type="radio" 
                      name="connector" 
                      className="mr-2"
                      checked={selectedConnector === type}
                      onChange={() => setSelectedConnector(type)}
                    />
                    <div>
                      <div className="font-medium">{type}</div>
                      <div className="text-xs text-[#757575]">
                        {type === "Type 2" ? "AC Charging" : 
                         type === "CCS" ? "DC Fast Charging" :
                         type === "CHAdeMO" ? "DC Fast Charging" :
                         "Supercharging"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mb-6 p-3 bg-[#F5F5F5] rounded-lg">
              <h4 className="font-medium mb-2">Charging Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Station</span>
                  <span className="font-medium">{station.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date</span>
                  <span className="font-medium">{formatDateForDisplay(selectedDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Time</span>
                  <span className="font-medium">{getFormattedTimeRange(selectedTime, selectedDuration)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Slot</span>
                  <span className="font-medium">{selectedSlot?.slotNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>Rate</span>
                  <span className="font-medium">${station.pricePerKwh.toFixed(2)}/kWh</span>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Button 
                variant="outline"
                className="flex-1"
                onClick={() => setCurrentStep(BookingStep.SelectTime)}
              >
                Back
              </Button>
              <Button 
                className="flex-1 bg-[#00BFA5] hover:bg-[#00BFA5]/90 text-white"
                onClick={() => setCurrentStep(BookingStep.PaymentConfirmation)}
                disabled={!selectedConnector || !selectedVehicle}
              >
                Next
              </Button>
            </div>
          </div>
        )}
        
        {/* Step 3: Payment & Confirmation */}
        {currentStep === BookingStep.PaymentConfirmation && (
          <div className="booking-step">
            <h3 className="font-medium mb-4">Payment & Confirmation</h3>
            
            <div className="mb-4">
              <FormLabel>Payment Method</FormLabel>
              <Select defaultValue="visa">
                <SelectTrigger className="w-full mt-1">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="visa">Visa ending in 4242</SelectItem>
                  <SelectItem value="new">Add new payment method</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="mb-6 p-3 bg-[#F5F5F5] rounded-lg">
              <h4 className="font-medium mb-2">Booking Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Station</span>
                  <span className="font-medium">{station.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date</span>
                  <span className="font-medium">{formatDateForDisplay(selectedDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Time</span>
                  <span className="font-medium">{getFormattedTimeRange(selectedTime, selectedDuration)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Slot</span>
                  <span className="font-medium">{selectedSlot?.slotNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>Vehicle</span>
                  <span className="font-medium">{selectedVehicle}</span>
                </div>
                <div className="flex justify-between">
                  <span>Connector</span>
                  <span className="font-medium">{selectedConnector}</span>
                </div>
                <div className="border-t pt-1 mt-1"></div>
                <div className="flex justify-between font-medium">
                  <span>Estimated Cost</span>
                  <span>$15.00 - $25.00</span>
                </div>
                <div className="text-xs text-[#757575]">
                  Final amount will be based on actual energy consumed
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <div className="flex items-start mb-2">
                <Checkbox 
                  id="terms" 
                  checked={agreeToTerms}
                  onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                  className="mt-1 mr-2"
                />
                <label htmlFor="terms" className="text-sm">
                  I agree to the <a href="#" className="text-[#1976D2] hover:underline">terms of service</a> and <a href="#" className="text-[#1976D2] hover:underline">cancellation policy</a>
                </label>
              </div>
              <div className="text-xs text-[#757575]">
                You can cancel free of charge up to 30 minutes before your booking. Late cancellations may incur a fee.
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Button 
                variant="outline"
                className="flex-1"
                onClick={() => setCurrentStep(BookingStep.VehicleConnector)}
              >
                Back
              </Button>
              <Button 
                className="flex-1 bg-[#00BFA5] hover:bg-[#00BFA5]/90 text-white"
                onClick={handleBookingSubmit}
                disabled={!agreeToTerms || createBookingMutation.isPending}
              >
                {createBookingMutation.isPending ? "Processing..." : "Confirm Booking"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingForm;
