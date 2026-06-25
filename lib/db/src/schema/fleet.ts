import { pgTable, serial, text, integer, numeric, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const fleetVehiclesTable = pgTable("fleet_vehicles", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  plate: text("plate").notNull(),
  driver: text("driver").default(""),
  driverPhone: text("driver_phone").default(""),
  type: text("type").notNull().default("heavy"),
  maxCapacity: numeric("max_capacity", { precision: 8, scale: 2 }).notNull(),
  status: text("status").notNull().default("available"),
  locationType: text("location_type").default("at-factory"),
  address: text("address"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const shipmentsTable = pgTable("shipments", {
  id: text("id").primaryKey(),
  vehicleId: text("vehicle_id").references(() => fleetVehiclesTable.id).notNull(),
  vehicleName: text("vehicle_name").notNull(),
  driverName: text("driver_name").notNull(),
  driverPhone: text("driver_phone").default(""),
  stops: jsonb("stops").$type<{
    invoiceId: string; customerId: string; customerName: string;
    customerPhone: string; address: string; region: string;
    governorate: string; village?: string; weightTons: number;
  }[]>().notNull(),
  totalWeight: numeric("total_weight", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"),
  date: text("date").notNull(),
  departureDate: text("departure_date"),
  deliveredDate: text("delivered_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertVehicleSchema = createInsertSchema(fleetVehiclesTable);
export const insertShipmentSchema = createInsertSchema(shipmentsTable);

export type FleetVehicle = typeof fleetVehiclesTable.$inferSelect;
export type Shipment = typeof shipmentsTable.$inferSelect;
