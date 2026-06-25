import { pgTable, serial, text, integer, numeric, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const warehouseConfigsTable = pgTable("warehouse_configs", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  normalThreshold: numeric("normal_threshold", { precision: 10, scale: 2 }).notNull(),
  warningThreshold: numeric("warning_threshold", { precision: 10, scale: 2 }).notNull(),
});

export const productionOrdersTable = pgTable("production_orders", {
  id: text("id").primaryKey(),
  productId: text("product_id").notNull(),
  productName: text("product_name").notNull(),
  targetTons: numeric("target_tons", { precision: 10, scale: 2 }).notNull(),
  producedTons: numeric("produced_tons", { precision: 10, scale: 2 }).default("0"),
  status: text("status").notNull().default("pending"),
  date: text("date").notNull(),
  plannedStart: text("planned_start").notNull(),
  plannedEnd: text("planned_end").notNull(),
  sessions: jsonb("sessions").$type<{ date: string; startedAt: string; endedAt: string | null; durationMins: number | null }[]>().default([]),
  bags: jsonb("bags").$type<{ id: string; weightKg: number; count: number }[]>().default([]),
  warehouseId: text("warehouse_id").notNull().default("W1"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const workSessionsTable = pgTable("work_sessions", {
  id: serial("id").primaryKey(),
  orderId: text("order_id").references(() => productionOrdersTable.id).notNull(),
  date: text("date").notNull(),
  startedAt: text("started_at").notNull(),
  endedAt: text("ended_at"),
  durationMins: integer("duration_mins"),
});

export const bagEntriesTable = pgTable("bag_entries", {
  id: serial("id").primaryKey(),
  orderId: text("order_id").references(() => productionOrdersTable.id).notNull(),
  weightKg: numeric("weight_kg", { precision: 8, scale: 2 }).notNull(),
  count: integer("count").notNull(),
});

export const insertWarehouseConfigSchema = createInsertSchema(warehouseConfigsTable);
export const insertProductionOrderSchema = createInsertSchema(productionOrdersTable);

export type WarehouseConfig = typeof warehouseConfigsTable.$inferSelect;
export type ProductionOrder = typeof productionOrdersTable.$inferSelect;
export type WorkSession = typeof workSessionsTable.$inferSelect;
export type BagEntry = typeof bagEntriesTable.$inferSelect;
