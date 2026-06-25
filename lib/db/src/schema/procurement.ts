import { pgTable, serial, text, integer, numeric, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const suppliersTable = pgTable("suppliers", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").default(""),
  code: text("code"),
  address: text("address").default(""),
  material: text("material").default(""),
  outstandingDebt: numeric("outstanding_debt", { precision: 14, scale: 2 }).default("0"),
  totalPurchases: numeric("total_purchases", { precision: 14, scale: 2 }).default("0"),
  lastPurchase: text("last_purchase"),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const purchaseOrdersTable = pgTable("purchase_orders", {
  id: text("id").primaryKey(),
  supplierId: text("supplier_id").references(() => suppliersTable.id).notNull(),
  supplierName: text("supplier_name").notNull(),
  date: text("date").notNull(),
  dueDate: text("due_date"),
  status: text("status").notNull().default("pending"),
  items: jsonb("items").$type<{
    material: string; qty: number; unit: string; unitPrice: number; total: number;
  }[]>().notNull(),
  total: numeric("total", { precision: 14, scale: 2 }).notNull(),
  paidAmount: numeric("paid_amount", { precision: 14, scale: 2 }).default("0"),
  payMethod: text("pay_method"),
  payBank: text("pay_bank"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const purchaseReturnsTable = pgTable("purchase_returns", {
  id: text("id").primaryKey(),
  poId: text("po_id").references(() => purchaseOrdersTable.id).notNull(),
  supplierId: text("supplier_id").references(() => suppliersTable.id).notNull(),
  supplierName: text("supplier_name").notNull(),
  date: text("date").notNull(),
  items: jsonb("items").$type<{
    material: string; qty: number; unit: string; unitPrice: number; total: number;
  }[]>().notNull(),
  total: numeric("total", { precision: 14, scale: 2 }).notNull(),
  reason: text("reason").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const supplierPaymentsTable = pgTable("supplier_payments", {
  id: text("id").primaryKey(),
  supplierId: text("supplier_id").references(() => suppliersTable.id).notNull(),
  supplierName: text("supplier_name").notNull(),
  date: text("date").notNull(),
  amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
  method: text("method").notNull().default("cash"),
  bankId: text("bank_id"),
  notes: text("notes"),
  allocations: jsonb("allocations").$type<{ poId: string; amount: number }[]>().default([]),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSupplierSchema = createInsertSchema(suppliersTable);
export const insertPurchaseOrderSchema = createInsertSchema(purchaseOrdersTable);

export type Supplier = typeof suppliersTable.$inferSelect;
export type PurchaseOrder = typeof purchaseOrdersTable.$inferSelect;
export type PurchaseReturn = typeof purchaseReturnsTable.$inferSelect;
export type SupplierPayment = typeof supplierPaymentsTable.$inferSelect;
