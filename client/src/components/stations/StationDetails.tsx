import { useState, useEffect } from "react";
import { Station, Slot } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { X, Star, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface StationDetailsProps {
  station: Station;
  onClose: () => void;
  onBookNow: () => void;
}

const StationDetails = ({ station, onClose, onBookNow }: StationDetailsProps) => {
  // Fetch slots for this station
  const { data: slots = [], isLoading: slotsLoading } = useQuery<Slot[]>({
    queryKey: [`/api/stations/${station.id}/slots`],
    enabled: !!station
  });

  return (
    <div className="w-full md:w-96 bg-white shadow-lg overflow-y-auto">
      <div className="p-4 border-b sticky top-0 bg-white">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium">Station Details</h2>
          <button
            onClick={onClose}
            className="text-[#757575] hover:text-[#212121] p-1"
            aria-label="Close details"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      <div className="p-4">
        {/* Station Header */}
        <div className="mb-4">
          <h3 className="text-xl font-medium">{station.name}</h3>
          <p className="text-[#757575]">
            {station.address}, {station.city}, {station.state} {station.zipCode}
          </p>
          <div className="flex items-center mt-2">
            <div className="flex items-center text-[#FFC107]">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star 
                  key={star} 
                  className="w-5 h-5" 
                  fill="currentColor" 
                />
              ))}
              <span className="ml-1 text-sm">4.8 (45 reviews)</span>
            </div>
          </div>
        </div>
        
        {/* Station Image */}
        <div className="mb-4 rounded-lg overflow-hidden h-48">
          <img 
            src={station.imageUrl || "https://images.unsplash.com/photo-1558428818-a3e48549249d?auto=format&fit=crop&w=600&h=300"} 
            className="w-full h-full object-cover" 
            alt={station.name} 
          />
        </div>
        
        {/* Station Details */}
        <div className="mb-6 space-y-4">
          <div>
            <h4 className="font-medium mb-2">Hours</h4>
            <p className="text-sm">{station.operatingHours}</p>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Connectors</h4>
            <div className="flex flex-wrap gap-2">
              {station.connectorTypes.map((type, index) => (
                <span key={index} className="px-2 py-1 bg-[#F5F5F5] rounded-md text-xs">
                  {type}
                </span>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Amenities</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {station.amenities.map((amenity, index) => (
                <div key={index} className="flex items-center">
                  <svg className="w-4 h-4 text-[#4CAF50] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Contact</h4>
            <div className="text-sm">
              {station.contactPhone && (
                <div className="flex items-center mb-1">
                  <Phone className="w-4 h-4 text-[#757575] mr-2" />
                  <span>{station.contactPhone}</span>
                </div>
              )}
              {station.contactEmail && (
                <div className="flex items-center">
                  <Mail className="w-4 h-4 text-[#757575] mr-2" />
                  <span>{station.contactEmail}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Availability Section */}
        <div className="mb-6">
          <h4 className="font-medium mb-3">Current Availability</h4>
          <div className="bg-[#F5F5F5] rounded-lg p-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Available Slots</span>
              <span className={`font-medium ${station.availableSlots > 0 ? "text-[#4CAF50]" : "text-[#FFC107]"}`}>
                {station.availableSlots} / {station.totalSlots}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2 mb-2">
              {slotsLoading ? (
                Array(8).fill(0).map((_, index) => (
                  <div className="text-center" key={index}>
                    <Skeleton className="h-12 w-full rounded-md mb-1" />
                    <Skeleton className="h-3 w-10 mx-auto" />
                  </div>
                ))
              ) : slots ? (
                slots.map((slot: Slot) => (
                  <div className="text-center" key={slot.id}>
                    <div className={`h-12 w-full rounded-md ${
                      slot.status === "available" 
                        ? "bg-[#4CAF50]" 
                        : "bg-[#757575]"
                    } flex items-center justify-center mb-1`}>
                      <span className="text-white font-medium">{slot.slotNumber}</span>
                    </div>
                    <span className="text-xs">
                      {slot.status === "available" ? "Free" : "In Use"}
                    </span>
                  </div>
                ))
              ) : (
                <div className="col-span-4 text-center py-2 text-[#757575]">
                  No slot information available
                </div>
              )}
            </div>
            <div className="text-xs text-[#757575]">Last updated: {new Date().toLocaleString()}</div>
          </div>
        </div>
        
        {/* Pricing Info */}
        <div className="mb-6">
          <h4 className="font-medium mb-3">Pricing</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Standard Charging (Level 2)</span>
              <span className="font-medium">₹{station.pricePerKwh.toFixed(2)}/kWh</span>
            </div>
            {station.fastChargingAvailable && (
              <>
                <div className="flex justify-between">
                  <span>Fast Charging (DC)</span>
                  <span className="font-medium">₹{(station.pricePerKwh * 1.2).toFixed(2)}/kWh</span>
                </div>
                <div className="flex justify-between">
                  <span>Super Charging</span>
                  <span className="font-medium">₹{(station.pricePerKwh * 1.4).toFixed(2)}/kWh</span>
                </div>
              </>
            )}
            <div className="flex justify-between">
              <span>Idle Fee (after charging)</span>
              <span className="font-medium">₹10.00/min</span>
            </div>
          </div>
        </div>
        
        {/* Booking Button */}
        <Button
          onClick={onBookNow}
          className="w-full bg-[#00BFA5] hover:bg-[#00BFA5]/90 text-white py-6"
        >
          Book a Charging Slot
        </Button>
      </div>
    </div>
  );
};

export default StationDetails;
