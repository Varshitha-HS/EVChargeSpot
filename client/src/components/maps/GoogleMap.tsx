import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon, LatLngBounds, LatLng } from 'leaflet';
import { Station } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Plus, Minus, MapPin } from "lucide-react";

interface MapProps {
  stations: Station[];
  selectedStation: Station | null;
  onStationSelect: (station: Station) => void;
}

// Component to control the map (set view, etc.)
function MapController({ 
  stations, 
  selectedStation, 
  userLocation 
}: { 
  stations: Station[]; 
  selectedStation: Station | null;
  userLocation: [number, number] | null;
}) {
  const map = useMap();
  
  // Update view when selectedStation changes
  useEffect(() => {
    if (selectedStation) {
      map.setView([selectedStation.latitude, selectedStation.longitude], 15);
    }
  }, [map, selectedStation]);

  // Fit bounds to include all stations
  useEffect(() => {
    if (stations.length > 0) {
      const bounds = new LatLngBounds([]);
      
      stations.forEach(station => {
        bounds.extend(new LatLng(station.latitude, station.longitude));
      });
      
      // Add user location to bounds if available
      if (userLocation) {
        bounds.extend(new LatLng(userLocation[0], userLocation[1]));
      }
      
      map.fitBounds(bounds, { padding: [50, 50] });
      
      // Don't zoom in too much
      if (map.getZoom() > 15) {
        map.setZoom(15);
      }
    }
  }, [map, stations, userLocation]);
  
  return null;
}

// Custom zoom control component
function ZoomControl({ map }: { map: L.Map | null }) {
  const handleZoomIn = () => {
    if (map) {
      map.setZoom(map.getZoom() + 1);
    }
  };

  const handleZoomOut = () => {
    if (map) {
      map.setZoom(map.getZoom() - 1);
    }
  };

  return (
    <div className="flex flex-col space-y-2">
      <button 
        onClick={handleZoomIn}
        className="bg-white p-2 rounded-full shadow-lg hover:bg-[#F5F5F5]"
        aria-label="Zoom in"
      >
        <Plus className="w-6 h-6 text-[#212121]" />
      </button>
      <button 
        onClick={handleZoomOut}
        className="bg-white p-2 rounded-full shadow-lg hover:bg-[#F5F5F5]"
        aria-label="Zoom out"
      >
        <Minus className="w-6 h-6 text-[#212121]" />
      </button>
    </div>
  );
}

const StationMap = ({ stations, selectedStation, onStationSelect }: MapProps) => {
  const [map, setMap] = useState<L.Map | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const { toast } = useToast();

  // Default center (San Francisco)
  const defaultCenter: [number, number] = [37.7749, -122.4194];
  
  // Custom marker icons
  const stationIcon = (isSelected: boolean) => new Icon({
    iconUrl: `data:image/svg+xml;utf-8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="${isSelected ? '#4CAF50' : '#00BFA5'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M19.77 7.23l.01-.01-3.72-3.72L15 4.56l2.11 2.11c-.94.36-1.61 1.26-1.61 2.33 0 1.38 1.12 2.5 2.5 2.5.36 0 .69-.08 1-.21v7.21c0 .55-.45 1-1 1s-1-.45-1-1V14c0-1.1-.9-2-2-2h-1V5c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2v16h10v-7.5h1.5v5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V9c0-.69-.28-1.32-.73-1.77zM12 11v8H6V5h6v6zm6-1c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/>
      </svg>
    `)}`,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });
  
  const userIcon = new Icon({
    iconUrl: `data:image/svg+xml;utf-8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#1976D2" stroke="white" stroke-width="2">
        <circle cx="12" cy="12" r="10" />
      </svg>
    `)}`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        () => {
          toast({
            title: "Location Error",
            description: "Couldn't access your location. Showing default area.",
            variant: "destructive",
          });
        }
      );
    }
  }, [toast]);

  // Function to center on user's location
  const centerOnUserLocation = () => {
    if (map && userLocation) {
      map.setView(userLocation, 15);
    } else if (map && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation: [number, number] = [position.coords.latitude, position.coords.longitude];
          setUserLocation(newLocation);
          map.setView(newLocation, 15);
        },
        () => {
          toast({
            title: "Location Error",
            description: "Couldn't access your location.",
            variant: "destructive",
          });
        }
      );
    }
  };

  return (
    <div className="w-full map-container bg-[#F5F5F5] relative">
      <MapContainer 
        center={userLocation || defaultCenter} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        ref={setMap}
        whenReady={(e) => setMap(e.target)}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapController 
          stations={stations} 
          selectedStation={selectedStation}
          userLocation={userLocation}
        />
        
        {/* Station markers */}
        {stations.map(station => (
          <Marker 
            key={station.id}
            position={[station.latitude, station.longitude]}
            icon={stationIcon(selectedStation?.id === station.id)}
            eventHandlers={{
              click: () => onStationSelect(station)
            }}
          >
            <Popup>
              <div className="p-1">
                <div className="font-bold">{station.name}</div>
                <div className="text-sm">{station.address}</div>
                <div className="flex mt-1">
                  <span className="text-xs px-1 bg-green-100 text-green-800 rounded mr-1">
                    {station.availableSlots}/{station.totalSlots} Available
                  </span>
                  <span className="text-xs px-1 bg-blue-100 text-blue-800 rounded">
                    ${station.pricePerKwh}/kWh
                  </span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
        
        {/* User location marker */}
        {userLocation && (
          <Marker position={userLocation} icon={userIcon}>
            <Popup>Your location</Popup>
          </Marker>
        )}
      </MapContainer>
      
      {/* Map Controls */}
      <div className="absolute bottom-4 right-4 flex flex-col space-y-2">
        <ZoomControl map={map} />
        <button 
          onClick={centerOnUserLocation}
          className="bg-white p-2 rounded-full shadow-lg hover:bg-[#F5F5F5]"
          aria-label="My location"
        >
          <MapPin className="w-6 h-6 text-[#212121]" />
        </button>
      </div>
    </div>
  );
};

export default StationMap;
