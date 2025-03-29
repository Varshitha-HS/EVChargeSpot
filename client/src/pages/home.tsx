import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Station } from "@shared/schema";
import { Search, Filter, Clock, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [recentDialogOpen, setRecentDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    fastChargingOnly: false,
    priceRange: "all", // all, low, medium, high
    availability: "all", // all, available, full
  });
  
  // Mock recent locations (in a real app, these would be stored in localStorage or a database)
  const recentLocations = [
    "MG Road, Bengaluru",
    "HSR Layout, Bengaluru",
    "Indiranagar, Bengaluru",
    "Koramangala, Bengaluru"
  ];
  
  // Fetch all stations
  const { data: stations = [], isLoading } = useQuery<Station[]>({ 
    queryKey: ['/api/stations']
  });
  
  // Apply filters to stations
  const filteredStations = stations.filter((station) => {
    // Text search filter
    const matchesSearch = 
      station.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      station.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      station.city.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    
    // Fast charging filter
    if (filters.fastChargingOnly && !station.fastChargingAvailable) {
      return false;
    }
    
    // Price range filter
    if (filters.priceRange !== "all") {
      if (filters.priceRange === "low" && station.pricePerKwh > 15) {
        return false;
      } else if (filters.priceRange === "medium" && (station.pricePerKwh <= 15 || station.pricePerKwh > 25)) {
        return false;
      } else if (filters.priceRange === "high" && station.pricePerKwh <= 25) {
        return false;
      }
    }
    
    // Availability filter
    if (filters.availability !== "all") {
      if (filters.availability === "available" && station.availableSlots === 0) {
        return false;
      } else if (filters.availability === "full" && station.availableSlots > 0) {
        return false;
      }
    }
    
    return true;
  });
  
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
                onClick={() => {
                  // This will re-filter the stations with the current query
                  // The effect is already handled by the filteredStations variable
                }}
                aria-label="Search stations"
              >
                <Search className="h-4 w-4" />
              </Button>
              <Button 
                size="sm" 
                className="bg-[#1976D2] hover:bg-[#1976D2]/90 text-white ml-2"
                onClick={() => setFilterDialogOpen(true)}
                aria-label="Open filter dialog"
              >
                <Filter className="h-4 w-4" />
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                className="text-[#212121] hover:bg-[#F5F5F5] ml-2"
                onClick={() => setRecentDialogOpen(true)}
                aria-label="Recent searches"
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

      {/* Filter Dialog */}
      <Dialog open={filterDialogOpen} onOpenChange={setFilterDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Filter Stations</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="fast-charging" 
                checked={filters.fastChargingOnly}
                onCheckedChange={(checked) => 
                  setFilters({...filters, fastChargingOnly: checked === true})
                }
              />
              <Label htmlFor="fast-charging">Fast Charging Only</Label>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="price-range">Price Range</Label>
              <Select 
                value={filters.priceRange} 
                onValueChange={(value) => setFilters({...filters, priceRange: value})}
              >
                <SelectTrigger id="price-range">
                  <SelectValue placeholder="Select price range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="low">Low (₹0-15/kWh)</SelectItem>
                  <SelectItem value="medium">Medium (₹15-25/kWh)</SelectItem>
                  <SelectItem value="high">High (₹25+/kWh)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="availability">Availability</Label>
              <Select 
                value={filters.availability} 
                onValueChange={(value) => setFilters({...filters, availability: value})}
              >
                <SelectTrigger id="availability">
                  <SelectValue placeholder="Select availability" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stations</SelectItem>
                  <SelectItem value="available">Available Slots</SelectItem>
                  <SelectItem value="full">Full Stations</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setFilters({
                  fastChargingOnly: false,
                  priceRange: "all",
                  availability: "all"
                });
              }}
            >
              Reset
            </Button>
            <Button 
              className="bg-[#00BFA5] hover:bg-[#00BFA5]/90 text-white"
              onClick={() => setFilterDialogOpen(false)}
            >
              Apply Filters
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Recent Locations Dialog */}
      <Dialog open={recentDialogOpen} onOpenChange={setRecentDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Recent Locations</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            {recentLocations.length === 0 ? (
              <p className="text-center text-[#757575]">No recent locations</p>
            ) : (
              <ul className="space-y-2">
                {recentLocations.map((location, index) => (
                  <li key={index}>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-left"
                      onClick={() => {
                        setSearchQuery(location);
                        setRecentDialogOpen(false);
                      }}
                    >
                      <Clock className="mr-2 h-4 w-4" />
                      {location}
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setRecentDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Home;
