import { pgTable, serial, text, integer, numeric, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const productPricesTable = pgTable("product_prices", {
  id: serial("id").primaryKey(),
  productId: text("product_id").notNull().unique(),
  productName: text("product_name").notNull(),
  productCode: text("product_code"),
  category: text("category").default(""),
  bagWeight: integer("bag_weight").default(50),
  wholeSalePrice: numeric("wholesale_price", { precision: 12, scale: 2 }).default("0"),
  retailPrice: numeric("retail_price", { precision: 12, scale: 2 }).default("0"),
  distributorPrice: numeric("distributor_price", { precision: 12, scale: 2 }).default("0"),
  minSalePrice: numeric("min_sale_price", { precision: 12, scale: 2 }).default("0"),
  costPrice: numeric("cost_price", { precision: 12, scale: 2 }).default("0"),
  lastUpdated: text("last_updated"),
  priceHistory: jsonb("price_history").$type<{ date: string; field: string; oldValue: number; newValue: number }[]>().default([]),
  createdAt: timestamp("created_at").defaultNow(),
});

export const pricingAlertsTable = pgTable("pricing_alerts", {
  id: serial("id").primaryKey(),
  productName: text("product_name").notNull(),
  costPrice: numeric("cost_price", { precision: 12, scale: 2 }).notNull(),
  reason: text("reason").notNull(),
  date: text("date").notNull(),
  dismissed: boolean("dismissed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const productGroupsTable = pgTable("product_groups", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  customName: text("custom_name"),
  customMargin: text("custom_margin"),
});

export const groupItemsTable = pgTable("group_items", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id").references(() => productGroupsTable.id).notNull(),
  itemName: text("item_name").notNull(),
});

export const insertProductPriceSchema = createInsertSchema(productPricesTable);

export type ProductPrice = typeof productPricesTable.$inferSelect;
export type PricingAlert = typeof pricingAlertsTable.$inferSelect;
export type ProductGroup = typeof productGroupsTable.$inferSelect;
export type GroupItem = typeof groupItemsTable.$inferSelect;
