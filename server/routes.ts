import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertStationSchema, insertSlotSchema, insertBookingSchema, insertVehicleSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // User routes
  app.post('/api/auth/register', async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }
      
      const user = await storage.createUser(userData);
      
      // Don't return password in response
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create user" });
    }
  });
  
  app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
      }
      
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Don't return password in response
      const { password: _, ...userWithoutPassword } = user;
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });
  
  // Station routes
  app.get('/api/stations', async (req: Request, res: Response) => {
    try {
      const stations = await storage.getAllStations();
      res.status(200).json(stations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stations" });
    }
  });
  
  app.get('/api/stations/nearby', async (req: Request, res: Response) => {
    try {
      const lat = parseFloat(req.query.lat as string);
      const lng = parseFloat(req.query.lng as string);
      const radius = parseFloat(req.query.radius as string) || 10; // Default radius 10km
      
      if (isNaN(lat) || isNaN(lng)) {
        return res.status(400).json({ message: "Valid latitude and longitude required" });
      }
      
      const stations = await storage.getStationsByLocation(lat, lng, radius);
      res.status(200).json(stations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch nearby stations" });
    }
  });
  
  app.get('/api/stations/:id', async (req: Request, res: Response) => {
    try {
      const stationId = parseInt(req.params.id);
      const station = await storage.getStation(stationId);
      
      if (!station) {
        return res.status(404).json({ message: "Station not found" });
      }
      
      res.status(200).json(station);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch station" });
    }
  });
  
  app.post('/api/stations', async (req: Request, res: Response) => {
    try {
      const stationData = insertStationSchema.parse(req.body);
      const station = await storage.createStation(stationData);
      res.status(201).json(station);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create station" });
    }
  });
  
  app.put('/api/stations/:id', async (req: Request, res: Response) => {
    try {
      const stationId = parseInt(req.params.id);
      const stationData = insertStationSchema.partial().parse(req.body);
      
      const updatedStation = await storage.updateStation(stationId, stationData);
      
      if (!updatedStation) {
        return res.status(404).json({ message: "Station not found" });
      }
      
      res.status(200).json(updatedStation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update station" });
    }
  });
  
  app.delete('/api/stations/:id', async (req: Request, res: Response) => {
    try {
      const stationId = parseInt(req.params.id);
      const success = await storage.deleteStation(stationId);
      
      if (!success) {
        return res.status(404).json({ message: "Station not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete station" });
    }
  });
  
  // Slot routes
  app.get('/api/stations/:stationId/slots', async (req: Request, res: Response) => {
    try {
      const stationId = parseInt(req.params.stationId);
      const slots = await storage.getSlotsByStation(stationId);
      res.status(200).json(slots);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch slots" });
    }
  });
  
  app.post('/api/slots', async (req: Request, res: Response) => {
    try {
      const slotData = insertSlotSchema.parse(req.body);
      const slot = await storage.createSlot(slotData);
      res.status(201).json(slot);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create slot" });
    }
  });
  
  app.put('/api/slots/:id', async (req: Request, res: Response) => {
    try {
      const slotId = parseInt(req.params.id);
      const slotData = insertSlotSchema.partial().parse(req.body);
      
      const updatedSlot = await storage.updateSlot(slotId, slotData);
      
      if (!updatedSlot) {
        return res.status(404).json({ message: "Slot not found" });
      }
      
      res.status(200).json(updatedSlot);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update slot" });
    }
  });
  
  // Booking routes
  app.get('/api/bookings', async (req: Request, res: Response) => {
    try {
      const bookings = await storage.getAllBookings();
      res.status(200).json(bookings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });
  
  app.get('/api/users/:userId/bookings', async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const bookings = await storage.getBookingsByUser(userId);
      res.status(200).json(bookings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user bookings" });
    }
  });
  
  app.get('/api/stations/:stationId/bookings', async (req: Request, res: Response) => {
    try {
      const stationId = parseInt(req.params.stationId);
      const bookings = await storage.getBookingsByStation(stationId);
      res.status(200).json(bookings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch station bookings" });
    }
  });
  
  app.get('/api/bookings/:id', async (req: Request, res: Response) => {
    try {
      const bookingId = parseInt(req.params.id);
      const booking = await storage.getBooking(bookingId);
      
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      res.status(200).json(booking);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch booking" });
    }
  });
  
  app.post('/api/bookings', async (req: Request, res: Response) => {
    try {
      const bookingData = insertBookingSchema.parse(req.body);
      
      // Check if slot is available
      const slot = await storage.getSlot(bookingData.slotId);
      if (!slot || slot.status !== "available") {
        return res.status(400).json({ message: "Slot is not available for booking" });
      }
      
      const booking = await storage.createBooking(bookingData);
      res.status(201).json(booking);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create booking" });
    }
  });
  
  app.put('/api/bookings/:id', async (req: Request, res: Response) => {
    try {
      const bookingId = parseInt(req.params.id);
      const bookingData = insertBookingSchema.partial().parse(req.body);
      
      const updatedBooking = await storage.updateBooking(bookingId, bookingData);
      
      if (!updatedBooking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      res.status(200).json(updatedBooking);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update booking" });
    }
  });
  
  // Vehicle routes
  app.get('/api/users/:userId/vehicles', async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const vehicles = await storage.getVehiclesByUser(userId);
      res.status(200).json(vehicles);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch vehicles" });
    }
  });
  
  app.post('/api/vehicles', async (req: Request, res: Response) => {
    try {
      const vehicleData = insertVehicleSchema.parse(req.body);
      const vehicle = await storage.createVehicle(vehicleData);
      res.status(201).json(vehicle);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create vehicle" });
    }
  });
  
  app.put('/api/vehicles/:id', async (req: Request, res: Response) => {
    try {
      const vehicleId = parseInt(req.params.id);
      const vehicleData = insertVehicleSchema.partial().parse(req.body);
      
      const updatedVehicle = await storage.updateVehicle(vehicleId, vehicleData);
      
      if (!updatedVehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
      }
      
      res.status(200).json(updatedVehicle);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update vehicle" });
    }
  });
  
  app.delete('/api/vehicles/:id', async (req: Request, res: Response) => {
    try {
      const vehicleId = parseInt(req.params.id);
      const success = await storage.deleteVehicle(vehicleId);
      
      if (!success) {
        return res.status(404).json({ message: "Vehicle not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete vehicle" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
