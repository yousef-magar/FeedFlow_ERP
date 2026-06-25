import { pgTable, serial, text, integer, numeric, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const materialsTable = pgTable("materials", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  category: text("category").notNull(),
  unit: text("unit").notNull().default("ton"),
  defaultPricePerTon: numeric("default_price_per_ton", { precision: 12, scale: 2 }).notNull(),
  substitutionGroup: text("substitution_group"),
  minStockAlert: numeric("min_stock_alert", { precision: 10, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const inventoryTable = pgTable("inventory", {
  id: serial("id").primaryKey(),
  materialId: integer("material_id").references(() => materialsTable.id),
  materialName: text("material_name").notNull(),
  quantity: numeric("quantity", { precision: 10, scale: 2 }).notNull(),
  initialQuantity: numeric("initial_quantity", { precision: 10, scale: 2 }).notNull(),
  consumedQuantity: numeric("consumed_quantity", { precision: 10, scale: 2 }).default("0"),
  unit: text("unit").notNull().default("ton"),
  pricePerTon: numeric("price_per_ton", { precision: 12, scale: 2 }).default("0"),
  warehouseId: text("warehouse_id").notNull().default("W1"),
  batchNumber: text("batch_number"),
  productionDate: timestamp("production_date"),
  expiryDate: timestamp("expiry_date"),
  alertLevel: text("alert_level").notNull().default("normal"),
  type: text("type").notNull().default("raw"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const formulasTable = pgTable("formulas", {
  id: serial("id").primaryKey(),
  productId: text("product_id").notNull().unique(),
  productName: text("product_name").notNull(),
  proteinPct: numeric("protein_pct", { precision: 4, scale: 1 }),
  bagWeight: integer("bag_weight").default(50),
  createdAt: timestamp("created_at").defaultNow(),
});

export const formulaIngredientsTable = pgTable("formula_ingredients", {
  id: serial("id").primaryKey(),
  formulaId: integer("formula_id").references(() => formulasTable.id).notNull(),
  materialId: integer("material_id").references(() => materialsTable.id).notNull(),
  percentage: numeric("percentage", { precision: 5, scale: 2 }).notNull(),
  isOptional: boolean("is_optional").default(false),
});

export const substitutionRequestsTable = pgTable("substitution_requests", {
  id: serial("id").primaryKey(),
  requestId: text("request_id").notNull().unique(),
  orderId: text("order_id").notNull(),
  productId: text("product_id").notNull(),
  productName: text("product_name").notNull(),
  originalMaterialId: integer("original_material_id").references(() => materialsTable.id),
  originalMaterialName: text("original_material_name").notNull(),
  originalPricePerTon: numeric("original_price_per_ton", { precision: 12, scale: 2 }).notNull(),
  substituteMaterialId: integer("substitute_material_id").references(() => materialsTable.id),
  substituteMaterialName: text("substitute_material_name").notNull(),
  substitutePricePerTon: numeric("substitute_price_per_ton", { precision: 12, scale: 2 }).notNull(),
  substituteAvailableQty: numeric("substitute_available_qty", { precision: 10, scale: 2 }).notNull(),
  neededTons: numeric("needed_tons", { precision: 10, scale: 2 }).notNull(),
  costImpact: numeric("cost_impact", { precision: 14, scale: 2 }).notNull(),
  newTotalCost: numeric("new_total_cost", { precision: 14, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"),
  reason: text("reason"),
  aiSuggestion: text("ai_suggestion"),
  approvedAt: timestamp("approved_at"),
  rejectedAt: timestamp("rejected_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMaterialSchema = createInsertSchema(materialsTable);
export const insertInventorySchema = createInsertSchema(inventoryTable);
export const insertFormulaSchema = createInsertSchema(formulasTable);
export const insertSubstitutionRequestSchema = createInsertSchema(substitutionRequestsTable);

export type Material = typeof materialsTable.$inferSelect;
export type Inventory = typeof inventoryTable.$inferSelect;
export type Formula = typeof formulasTable.$inferSelect;
export type SubstitutionRequest = typeof substitutionRequestsTable.$inferSelect;
