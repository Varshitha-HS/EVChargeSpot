import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Station } from "@shared/schema";
import { Search, Filter, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import StationMap from "@/components/maps/StationMap";
import StationsList from "@/components/stations/StationsList";
import StationDetails from "@/components/stations/StationDetails";
import BookingForm from "@/components/bookings/BookingForm";
import BookingConfirmation from "@/components/bookings/BookingConfirmation";

enum ViewState {
  LIST,
  DETAIL,
  BOOKING,
  CONFIRMATION
}

const Home = () => {
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [viewState, setViewState] = useState<ViewState>(ViewState.LIST);
  const [bookingId, setBookingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Fetch all stations
  const { data: stations = [], isLoading } = useQuery<Station[]>({ 
    queryKey: ['/api/stations']
  });
  
  // Filter stations by search query
  const filteredStations = stations.filter((station) => 
    station.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    station.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    station.city.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Handlers
  const handleStationSelect = (station: Station) => {
    setSelectedStation(station);
    setViewState(ViewState.DETAIL);
  };
  
  const handleBookNow = () => {
    if (selectedStation) {
      setViewState(ViewState.BOOKING);
    }
  };
  
  const handleBookingComplete = (bookingId: number) => {
    setBookingId(bookingId);
    setViewState(ViewState.CONFIRMATION);
  };
  
  const handleCloseDetails = () => {
    setViewState(ViewState.LIST);
  };
  
  const handleCloseBooking = () => {
    setViewState(ViewState.DETAIL);
  };
  
  const handleCloseConfirmation = () => {
    setViewState(ViewState.LIST);
    setSelectedStation(null);
    setBookingId(null);
  };
  
  return (
    <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
      {/* Map Section */}
      <div className="flex-1 relative">
        {/* Search Bar */}
        <div className="absolute top-4 left-4 right-4 z-10">
          <div className="bg-white rounded-lg shadow-lg p-2">
            <div className="flex items-center">
              <div className="flex-1">
                <Input 
                  type="text" 
                  placeholder="Search for charging stations..." 
                  className="w-full border-none shadow-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button 
                size="sm" 
                className="bg-[#00BFA5] hover:bg-[#00BFA5]/90 text-white ml-2"
              >
                <Search className="h-4 w-4" />
              </Button>
              <Button 
                size="sm" 
                className="bg-[#1976D2] hover:bg-[#1976D2]/90 text-white ml-2"
              >
                <Filter className="h-4 w-4" />
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                className="text-[#212121] hover:bg-[#F5F5F5] ml-2"
              >
                <Clock className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Map */}
        <StationMap 
          stations={filteredStations} 
          selectedStation={selectedStation} 
          onStationSelect={handleStationSelect} 
        />
      </div>

      {/* Panel Section - Changes based on viewState */}
      {viewState === ViewState.LIST && (
        <StationsList 
          stations={filteredStations} 
          isLoading={isLoading} 
          selectedStation={selectedStation} 
          onStationSelect={handleStationSelect}
          onBookStation={handleStationSelect}
        />
      )}
      
      {viewState === ViewState.DETAIL && selectedStation && (
        <StationDetails 
          station={selectedStation} 
          onClose={handleCloseDetails} 
          onBookNow={handleBookNow}
        />
      )}
      
      {viewState === ViewState.BOOKING && selectedStation && (
        <BookingForm 
          station={selectedStation} 
          onClose={handleCloseBooking} 
          onComplete={handleBookingComplete} 
        />
      )}
      
      {viewState === ViewState.CONFIRMATION && bookingId !== null && (
        <BookingConfirmation 
          bookingId={bookingId} 
          onClose={handleCloseConfirmation} 
        />
      )}
    </div>
  );
};

export default Home;
