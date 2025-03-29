import { useState } from "react";
import { Station } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { Search, Filter, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface StationsListProps {
  stations: Station[];
  isLoading: boolean;
  selectedStation: Station | null;
  onStationSelect: (station: Station) => void;
  onBookStation: (station: Station) => void;
}

const StationsList = ({ 
  stations, 
  isLoading, 
  selectedStation, 
  onStationSelect, 
  onBookStation 
}: StationsListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredStations = stations.filter(station => 
    station.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    station.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    station.city.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="w-full md:w-96 bg-white shadow-lg overflow-y-auto">
      <div className="p-4 border-b">
        <h2 className="text-lg font-medium">Charging Stations</h2>
        <p className="text-sm text-[#757575]">
          {isLoading ? "Finding stations..." : `${filteredStations.length} stations found`}
        </p>
      </div>

      {/* Search Bar */}
      <div className="p-3 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#757575] h-4 w-4" />
          <Input
            type="text"
            placeholder="Search stations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full"
          />
        </div>
      </div>

      {/* Station List */}
      <div className="p-4 space-y-4">
        {isLoading ? (
          Array(3).fill(0).map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between mb-2">
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-5 w-24" />
              </div>
              <Skeleton className="h-4 w-full mb-2" />
              <div className="flex items-center mt-2">
                <Skeleton className="h-4 w-28 mr-4" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="flex justify-between items-center mt-3">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-9 w-24" />
              </div>
            </div>
          ))
        ) : filteredStations.length === 0 ? (
          <div className="text-center py-8">
            <div className="inline-block p-3 bg-[#F5F5F5] rounded-full mb-3">
              <Search className="h-6 w-6 text-[#757575]" />
            </div>
            <p className="text-[#212121] font-medium">No stations found</p>
            <p className="text-sm text-[#757575] mt-1">Try adjusting your search</p>
          </div>
        ) : (
          filteredStations.map((station) => (
            <div
              key={station.id}
              className={`bg-white rounded-lg shadow p-4 hover:shadow-md transition cursor-pointer ${
                selectedStation?.id === station.id ? "border-2 border-[#00BFA5]" : ""
              }`}
              onClick={() => onStationSelect(station)}
            >
              <div className="flex justify-between">
                <h3 className="font-medium">{station.name}</h3>
                <span className={`text-sm font-medium ${
                  station.availableSlots > 0
                    ? "text-[#4CAF50]"
                    : "text-[#FFC107]"
                }`}>
                  {station.availableSlots} Available
                </span>
              </div>
              <p className="text-sm text-[#757575] mt-1">
                {station.address}, {station.city}, {station.state}
              </p>
              <div className="flex items-center mt-2 text-sm">
                {station.fastChargingAvailable && (
                  <div className="flex items-center mr-4">
                    <svg className="w-4 h-4 text-[#00BFA5] mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"></path>
                    </svg>
                    <span>Fast Charging</span>
                  </div>
                )}
                {station.amenities && station.amenities.length > 0 && (
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-[#FFC107] mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd"></path>
                    </svg>
                    <span>Amenities</span>
                  </div>
                )}
              </div>
              <div className="flex justify-between items-center mt-3">
                <div className="text-sm">
                  <span className="font-medium">${station.pricePerKwh.toFixed(2)}</span>
                  <span className="text-[#757575]">/kWh</span>
                </div>
                <Button 
                  size="sm" 
                  className="bg-[#00BFA5] hover:bg-[#00BFA5]/90 text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    onBookStation(station);
                  }}
                >
                  Book Now
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StationsList;
