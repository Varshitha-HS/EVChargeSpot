import { pgTable, text, serial, integer, timestamp, boolean, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  role: text("role").notNull().default("user"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  name: true,
  role: true,
});

// Stations schema
export const stations = pgTable("stations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipCode: text("zip_code").notNull(),
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
  totalSlots: integer("total_slots").notNull(),
  availableSlots: integer("available_slots").notNull(),
  pricePerKwh: doublePrecision("price_per_kwh").notNull(),
  fastChargingAvailable: boolean("fast_charging_available").default(false),
  amenities: text("amenities").array().notNull(),
  connectorTypes: text("connector_types").array().notNull(),
  imageUrl: text("image_url"),
  contactPhone: text("contact_phone"),
  contactEmail: text("contact_email"),
  operatingHours: text("operating_hours").default("24 hours, 7 days a week"),
  status: text("status").notNull().default("operational"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertStationSchema = createInsertSchema(stations).omit({
  id: true,
  createdAt: true,
});

// Slots schema
export const slots = pgTable("slots", {
  id: serial("id").primaryKey(),
  stationId: integer("station_id").notNull(),
  slotNumber: integer("slot_number").notNull(),
  status: text("status").notNull().default("available"),
  connectorType: text("connector_type").notNull(),
});

export const insertSlotSchema = createInsertSchema(slots).omit({
  id: true,
});

// Bookings schema
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  stationId: integer("station_id").notNull(),
  slotId: integer("slot_id").notNull(),
  bookingDate: timestamp("booking_date").notNull(),
  startTime: timestamp("start_time").notNull(),
  duration: integer("duration").notNull(), // duration in minutes
  status: text("status").notNull().default("confirmed"),
  vehicle: text("vehicle"),
  connectorType: text("connector_type").notNull(),
  estimatedCost: doublePrecision("estimated_cost"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
});

// Vehicles schema
export const vehicles = pgTable("vehicles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  make: text("make").notNull(),
  model: text("model").notNull(),
  year: text("year").notNull(),
  connectorTypes: text("connector_types").array().notNull(),
});

export const insertVehicleSchema = createInsertSchema(vehicles).omit({
  id: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Station = typeof stations.$inferSelect;
export type InsertStation = z.infer<typeof insertStationSchema>;

export type Slot = typeof slots.$inferSelect;
export type InsertSlot = z.infer<typeof insertSlotSchema>;

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;

export type Vehicle = typeof vehicles.$inferSelect;
export type InsertVehicle = z.infer<typeof insertVehicleSchema>;
