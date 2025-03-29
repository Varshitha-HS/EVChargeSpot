import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Station } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Filter, Edit, Eye, Trash, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const StationsTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [regionFilter, setRegionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const { toast } = useToast();
  
  // Fetch all stations
  const { data: stations = [], isLoading } = useQuery({ 
    queryKey: ['/api/stations']
  });
  
  // Delete station mutation
  const deleteStationMutation = useMutation({
    mutationFn: async (stationId: number) => {
      return apiRequest("DELETE", `/api/stations/${stationId}`);
    },
    onSuccess: () => {
      toast({
        title: "Station Deleted",
        description: "The charging station has been successfully deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/stations'] });
    },
    onError: () => {
      toast({
        title: "Deletion Failed",
        description: "Failed to delete the charging station. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  // Apply filters
  const filteredStations = stations.filter((station: Station) => {
    // Search filter
    const matchesSearch = station.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           station.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           station.city.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Region filter
    const matchesRegion = regionFilter === "all" || 
                          station.state.toLowerCase() === regionFilter.toLowerCase();
    
    // Status filter
    const matchesStatus = statusFilter === "all" || 
                          station.status.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesRegion && matchesStatus;
  });
  
  // Pagination
  const totalPages = Math.ceil(filteredStations.length / itemsPerPage);
  const paginatedStations = filteredStations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  // Status badge style
  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 inline-flex text-xs leading-5 font-semibold rounded-full";
    
    switch (status) {
      case "operational":
        return `${baseClasses} bg-[#4CAF50] bg-opacity-10 text-[#4CAF50]`;
      case "maintenance":
        return `${baseClasses} bg-[#FFC107] bg-opacity-10 text-[#FFC107]`;
      case "offline":
        return `${baseClasses} bg-[#F44336] bg-opacity-10 text-[#F44336]`;
      default:
        return `${baseClasses} bg-[#757575] bg-opacity-10 text-[#757575]`;
    }
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="p-6">
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-medium">Charging Stations</h1>
          <div className="mt-4 md:mt-0">
            <Button className="bg-[#00BFA5] hover:bg-[#00BFA5]/90 text-white px-4 py-2 rounded-md flex items-center">
              <Plus className="w-5 h-5 mr-2" />
              Add New Station
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="bg-white p-4 rounded-lg shadow animate-pulse">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-200 rounded-full mr-4"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow mb-6 animate-pulse">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1 h-10 bg-gray-200 rounded"></div>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="h-10 bg-gray-200 rounded w-36"></div>
              <div className="h-10 bg-gray-200 rounded w-36"></div>
              <div className="h-10 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="h-64 bg-gray-200 animate-pulse"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-medium">Charging Stations</h1>
        <div className="mt-4 md:mt-0">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-[#00BFA5] hover:bg-[#00BFA5]/90 text-white px-4 py-2 rounded-md flex items-center">
                <Plus className="w-5 h-5 mr-2" />
                Add New Station
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add New Charging Station</DialogTitle>
                <DialogDescription>
                  Create a new charging station with all relevant details
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <p className="text-center text-[#757575]">
                  Station creation form will be implemented in a future update
                </p>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-[#00BFA5] bg-opacity-10 rounded-full flex items-center justify-center mr-4">
              <Building2 className="w-6 h-6 text-[#00BFA5]" />
            </div>
            <div>
              <div className="text-[#757575] text-sm">Total Stations</div>
              <div className="text-2xl font-medium">{stations.length}</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-[#4CAF50] bg-opacity-10 rounded-full flex items-center justify-center mr-4">
              <CheckCircle className="w-6 h-6 text-[#4CAF50]" />
            </div>
            <div>
              <div className="text-[#757575] text-sm">Available Slots</div>
              <div className="text-2xl font-medium">
                {stations.reduce((total, station) => total + station.availableSlots, 0)}
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-[#FFC107] bg-opacity-10 rounded-full flex items-center justify-center mr-4">
              <Clock className="w-6 h-6 text-[#FFC107]" />
            </div>
            <div>
              <div className="text-[#757575] text-sm">Active Bookings</div>
              <div className="text-2xl font-medium">
                {stations.reduce((total, station) => total + (station.totalSlots - station.availableSlots), 0)}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#757575] h-4 w-4" />
              <Input 
                type="text" 
                placeholder="Search stations..." 
                className="pl-10 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-4">
            <Select value={regionFilter} onValueChange={setRegionFilter}>
              <SelectTrigger className="min-w-[150px]">
                <SelectValue placeholder="All Regions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                <SelectItem value="CA">California</SelectItem>
                <SelectItem value="NY">New York</SelectItem>
                <SelectItem value="TX">Texas</SelectItem>
                <SelectItem value="FL">Florida</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="min-w-[150px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="operational">Operational</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
              </SelectContent>
            </Select>
            <Button className="px-4 py-2 bg-[#1976D2] hover:bg-[#1976D2]/90 text-white">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>
      </div>
      
      {/* Stations Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredStations.length === 0 ? (
          <div className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-[#FFC107] mx-auto mb-3" />
            <h3 className="text-lg font-medium mb-2">No stations found</h3>
            <p className="text-[#757575] mb-4">No charging stations match your search criteria.</p>
            <Button 
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setRegionFilter("all");
                setStatusFilter("all");
              }}
            >
              Clear filters
            </Button>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#757575] uppercase tracking-wider">
                  Station Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#757575] uppercase tracking-wider">
                  Location
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#757575] uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#757575] uppercase tracking-wider">
                  Slots
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#757575] uppercase tracking-wider">
                  Price
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-[#757575] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedStations.map((station: Station) => (
                <tr key={station.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-[#00BFA5] bg-opacity-10 rounded-full flex items-center justify-center">
                        <svg className="h-6 w-6 text-[#00BFA5]" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M19.77 7.23l.01-.01-3.72-3.72L15 4.56l2.11 2.11c-.94.36-1.61 1.26-1.61 2.33 0 1.38 1.12 2.5 2.5 2.5.36 0 .69-.08 1-.21v7.21c0 .55-.45 1-1 1s-1-.45-1-1V14c0-1.1-.9-2-2-2h-1V5c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2v16h10v-7.5h1.5v5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V9c0-.69-.28-1.32-.73-1.77zM12 11v8H6V5h6v6zm6-1c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/>
                        </svg>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-[#212121]">{station.name}</div>
                        <div className="text-sm text-[#757575]">ID: STA-{String(station.id).padStart(4, '0')}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-[#212121]">{station.city}, {station.state}</div>
                    <div className="text-sm text-[#757575]">{station.address}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={getStatusBadge(station.status)}>
                      {station.status.charAt(0).toUpperCase() + station.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#212121]">
                    <div>{station.availableSlots} / {station.totalSlots} Available</div>
                    <div className="w-24 bg-gray-200 rounded-full h-2.5 mt-1">
                      <div 
                        className="bg-[#4CAF50] h-2.5 rounded-full" 
                        style={{ width: `${(station.availableSlots / station.totalSlots) * 100}%` }}
                      ></div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#212121]">
                    ${station.pricePerKwh.toFixed(2)}/kWh
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" className="text-[#1976D2] hover:text-[#1976D2]/80 mr-2">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Station</DialogTitle>
                          <DialogDescription>
                            Update details for {station.name}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                          <p className="text-center text-[#757575]">
                            Station edit form will be implemented in a future update
                          </p>
                        </div>
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                          </DialogClose>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" className="text-[#757575] hover:text-[#212121] mr-2">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{station.name}</DialogTitle>
                          <DialogDescription>
                            {station.address}, {station.city}, {station.state} {station.zipCode}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                          <p className="text-center text-[#757575]">
                            Detailed station view will be implemented in a future update
                          </p>
                        </div>
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button variant="outline">Close</Button>
                          </DialogClose>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" className="text-red-500 hover:text-red-700">
                          <Trash className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Station</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete {station.name}? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => deleteStationMutation.mutate(station.id)}
                            className="bg-red-500 hover:bg-red-600"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        
        {/* Pagination */}
        {filteredStations.length > 0 && (
          <div className="px-6 py-3 flex items-center justify-between border-t">
            <div className="flex-1 flex justify-between sm:hidden">
              <Button 
                variant="outline" 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button 
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-[#757575]">
                  Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
                  <span className="font-medium">
                    {Math.min(currentPage * itemsPerPage, filteredStations.length)}
                  </span>{" "}
                  of <span className="font-medium">{filteredStations.length}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <Button 
                    variant="outline"
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md text-[#757575]"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    <span className="sr-only">Previous</span>
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      className={`relative inline-flex items-center px-4 py-2 text-sm font-medium ${
                        currentPage === page 
                          ? "bg-[#00BFA5] text-white" 
                          : "text-[#757575] hover:bg-gray-50"
                      }`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  ))}
                  
                  <Button 
                    variant="outline"
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md text-[#757575]"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    <span className="sr-only">Next</span>
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StationsTable;
