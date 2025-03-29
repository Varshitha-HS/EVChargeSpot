import {
  users, User, InsertUser,
  stations, Station, InsertStation,
  slots, Slot, InsertSlot,
  bookings, Booking, InsertBooking,
  vehicles, Vehicle, InsertVehicle
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Station methods
  getAllStations(): Promise<Station[]>;
  getStation(id: number): Promise<Station | undefined>;
  getStationsByLocation(lat: number, lng: number, radius: number): Promise<Station[]>;
  createStation(station: InsertStation): Promise<Station>;
  updateStation(id: number, station: Partial<InsertStation>): Promise<Station | undefined>;
  deleteStation(id: number): Promise<boolean>;
  
  // Slot methods
  getSlotsByStation(stationId: number): Promise<Slot[]>;
  getSlot(id: number): Promise<Slot | undefined>;
  createSlot(slot: InsertSlot): Promise<Slot>;
  updateSlot(id: number, slot: Partial<InsertSlot>): Promise<Slot | undefined>;
  
  // Booking methods
  getAllBookings(): Promise<Booking[]>;
  getBooking(id: number): Promise<Booking | undefined>;
  getBookingsByUser(userId: number): Promise<Booking[]>;
  getBookingsByStation(stationId: number): Promise<Booking[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBooking(id: number, booking: Partial<InsertBooking>): Promise<Booking | undefined>;
  
  // Vehicle methods
  getVehiclesByUser(userId: number): Promise<Vehicle[]>;
  getVehicle(id: number): Promise<Vehicle | undefined>;
  createVehicle(vehicle: InsertVehicle): Promise<Vehicle>;
  updateVehicle(id: number, vehicle: Partial<InsertVehicle>): Promise<Vehicle | undefined>;
  deleteVehicle(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private stations: Map<number, Station>;
  private slots: Map<number, Slot>;
  private bookings: Map<number, Booking>;
  private vehicles: Map<number, Vehicle>;
  private userId: number;
  private stationId: number;
  private slotId: number;
  private bookingId: number;
  private vehicleId: number;

  constructor() {
    this.users = new Map();
    this.stations = new Map();
    this.slots = new Map();
    this.bookings = new Map();
    this.vehicles = new Map();
    this.userId = 1;
    this.stationId = 1;
    this.slotId = 1;
    this.bookingId = 1;
    this.vehicleId = 1;
    
    // Initialize with sample data
    this.initializeData();
  }
  
  private initializeData() {
    // Bengaluru stations
    const stationData: InsertStation[] = [
      {
        name: "Ather Grid Charging Station – Jayanagar",
        address: "#64, 10th Main Rd, 4th Block, Jayanagar",
        city: "Bengaluru",
        state: "Karnataka",
        zipCode: "560011",
        latitude: 12.9257,
        longitude: 77.5960,
        totalSlots: 4,
        availableSlots: 3,
        pricePerKwh: 15.00, // Price in INR
        fastChargingAvailable: false,
        amenities: ["Parking", "24/7 Access"],
        connectorTypes: ["AC Type 2"],
        imageUrl: "https://images.unsplash.com/photo-1558428818-a3e48549249d?auto=format&fit=crop&w=600&h=300",
        contactPhone: "9789214555",
        contactEmail: "support@athergrid.com",
        operatingHours: "24 hours, 7 days a week",
        status: "operational"
      },
      {
        name: "IKEA Bengaluru Charging Station",
        address: "IKEA, Nagasandra",
        city: "Bengaluru",
        state: "Karnataka",
        zipCode: "560073",
        latitude: 13.0359,
        longitude: 77.5085,
        totalSlots: 12,
        availableSlots: 10,
        pricePerKwh: 0.00, // Free charging
        fastChargingAvailable: false,
        amenities: ["Parking", "Shopping", "Restaurant", "Restrooms"],
        connectorTypes: ["Type 2"],
        imageUrl: "https://images.unsplash.com/photo-1558428818-a3e48549249d?auto=format&fit=crop&w=600&h=300",
        contactPhone: "1800 419 4532",
        contactEmail: "customer.care@ikea.in",
        operatingHours: "10:00 AM - 10:00 PM",
        status: "operational"
      },
      {
        name: "Mahindra EV Charging Station – Eva Mall",
        address: "Eva Mall, 60, Brigade Road",
        city: "Bengaluru",
        state: "Karnataka",
        zipCode: "560025",
        latitude: 12.9730,
        longitude: 77.6090,
        totalSlots: 3,
        availableSlots: 1,
        pricePerKwh: 18.00, // Price in INR
        fastChargingAvailable: false,
        amenities: ["Parking", "Shopping", "Restrooms"],
        connectorTypes: ["AC Plug Point", "Socket 3PIN", "IEC 60309"],
        imageUrl: "https://images.unsplash.com/photo-1558428818-a3e48549249d?auto=format&fit=crop&w=600&h=300",
        contactPhone: "8041531162",
        contactEmail: "support@mahindraelectric.com",
        operatingHours: "10:00 AM - 7:00 PM",
        status: "operational"
      },
      {
        name: "BESCOM Charging Station – Indiranagar",
        address: "BESCOM E6 Indiranagar SDO",
        city: "Bengaluru",
        state: "Karnataka",
        zipCode: "560038",
        latitude: 12.9781,
        longitude: 77.6408,
        totalSlots: 3,
        availableSlots: 2,
        pricePerKwh: 12.00, // Price in INR
        fastChargingAvailable: true,
        amenities: ["Parking", "Government Facility"],
        connectorTypes: ["AC", "DC"],
        imageUrl: "https://images.unsplash.com/photo-1558428818-a3e48549249d?auto=format&fit=crop&w=600&h=300",
        contactPhone: "080-2294-4300",
        contactEmail: "bescom@karnataka.gov.in",
        operatingHours: "8:00 AM - 8:00 PM",
        status: "operational"
      },
      {
        name: "ElectricPe Charging Station – Pariwar Presidency",
        address: "Pariwar Presidency Block-B, Phase 2, Anugraha Layout, Ramanashree Enclave, Bilekahalli",
        city: "Bengaluru",
        state: "Karnataka",
        zipCode: "560076",
        latitude: 12.8943,
        longitude: 77.6080,
        totalSlots: 6,
        availableSlots: 4,
        pricePerKwh: 16.00, // Price in INR
        fastChargingAvailable: true,
        amenities: ["Parking", "WiFi", "24/7 Access"],
        connectorTypes: ["Type 2", "CCS", "CHAdeMO"],
        imageUrl: "https://images.unsplash.com/photo-1558428818-a3e48549249d?auto=format&fit=crop&w=600&h=300",
        contactPhone: "1800-209-1234",
        contactEmail: "support@electricpe.com",
        operatingHours: "24 hours, 7 days a week",
        status: "operational"
      }
    ];

    // Create stations and slots
    stationData.forEach(station => {
      const createdStation = this.createStation(station);
      
      // Create slots for each station
      for (let i = 1; i <= station.totalSlots; i++) {
        const status = i <= station.availableSlots ? "available" : "in_use";
        const connectorType = station.connectorTypes[i % station.connectorTypes.length];
        
        this.createSlot({
          stationId: createdStation.id,
          slotNumber: i,
          status: status,
          connectorType: connectorType
        });
      }
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.userId++;
    const newUser: User = { ...user, id, createdAt: new Date() };
    this.users.set(id, newUser);
    return newUser;
  }

  // Station methods
  async getAllStations(): Promise<Station[]> {
    return Array.from(this.stations.values());
  }

  async getStation(id: number): Promise<Station | undefined> {
    return this.stations.get(id);
  }

  async getStationsByLocation(lat: number, lng: number, radius: number): Promise<Station[]> {
    // Simple filtering based on distance calculation (Haversine formula)
    const stations = Array.from(this.stations.values());
    return stations.filter(station => {
      const distance = this.calculateDistance(
        lat, lng, 
        station.latitude, station.longitude
      );
      return distance <= radius;
    });
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const distance = R * c; // Distance in km
    return distance;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }

  async createStation(station: InsertStation): Promise<Station> {
    const id = this.stationId++;
    const newStation: Station = { ...station, id, createdAt: new Date() };
    this.stations.set(id, newStation);
    return newStation;
  }

  async updateStation(id: number, stationData: Partial<InsertStation>): Promise<Station | undefined> {
    const station = this.stations.get(id);
    if (!station) return undefined;
    
    const updatedStation: Station = { ...station, ...stationData };
    this.stations.set(id, updatedStation);
    return updatedStation;
  }

  async deleteStation(id: number): Promise<boolean> {
    return this.stations.delete(id);
  }

  // Slot methods
  async getSlotsByStation(stationId: number): Promise<Slot[]> {
    return Array.from(this.slots.values()).filter(slot => slot.stationId === stationId);
  }

  async getSlot(id: number): Promise<Slot | undefined> {
    return this.slots.get(id);
  }

  async createSlot(slot: InsertSlot): Promise<Slot> {
    const id = this.slotId++;
    const newSlot: Slot = { ...slot, id };
    this.slots.set(id, newSlot);
    return newSlot;
  }

  async updateSlot(id: number, slotData: Partial<InsertSlot>): Promise<Slot | undefined> {
    const slot = this.slots.get(id);
    if (!slot) return undefined;
    
    const updatedSlot: Slot = { ...slot, ...slotData };
    this.slots.set(id, updatedSlot);
    
    // Update station availability if status changes
    if (slotData.status) {
      this.updateStationAvailability(slot.stationId);
    }
    
    return updatedSlot;
  }
  
  private async updateStationAvailability(stationId: number) {
    const station = await this.getStation(stationId);
    if (station) {
      const slots = await this.getSlotsByStation(stationId);
      const availableSlots = slots.filter(slot => slot.status === "available").length;
      
      await this.updateStation(stationId, { availableSlots });
    }
  }

  // Booking methods
  async getAllBookings(): Promise<Booking[]> {
    return Array.from(this.bookings.values());
  }

  async getBooking(id: number): Promise<Booking | undefined> {
    return this.bookings.get(id);
  }

  async getBookingsByUser(userId: number): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(booking => booking.userId === userId);
  }

  async getBookingsByStation(stationId: number): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(booking => booking.stationId === stationId);
  }

  async createBooking(booking: InsertBooking): Promise<Booking> {
    const id = this.bookingId++;
    const newBooking: Booking = { ...booking, id, createdAt: new Date() };
    this.bookings.set(id, newBooking);
    
    // Update slot status
    await this.updateSlot(booking.slotId, { status: "booked" });
    
    return newBooking;
  }

  async updateBooking(id: number, bookingData: Partial<InsertBooking>): Promise<Booking | undefined> {
    const booking = this.bookings.get(id);
    if (!booking) return undefined;
    
    const updatedBooking: Booking = { ...booking, ...bookingData };
    this.bookings.set(id, updatedBooking);
    
    // If status is changed to cancelled, update the slot status
    if (bookingData.status === "cancelled") {
      await this.updateSlot(booking.slotId, { status: "available" });
    }
    
    return updatedBooking;
  }

  // Vehicle methods
  async getVehiclesByUser(userId: number): Promise<Vehicle[]> {
    return Array.from(this.vehicles.values()).filter(vehicle => vehicle.userId === userId);
  }

  async getVehicle(id: number): Promise<Vehicle | undefined> {
    return this.vehicles.get(id);
  }

  async createVehicle(vehicle: InsertVehicle): Promise<Vehicle> {
    const id = this.vehicleId++;
    const newVehicle: Vehicle = { ...vehicle, id };
    this.vehicles.set(id, newVehicle);
    return newVehicle;
  }

  async updateVehicle(id: number, vehicleData: Partial<InsertVehicle>): Promise<Vehicle | undefined> {
    const vehicle = this.vehicles.get(id);
    if (!vehicle) return undefined;
    
    const updatedVehicle: Vehicle = { ...vehicle, ...vehicleData };
    this.vehicles.set(id, updatedVehicle);
    return updatedVehicle;
  }

  async deleteVehicle(id: number): Promise<boolean> {
    return this.vehicles.delete(id);
  }
}

export const storage = new MemStorage();
