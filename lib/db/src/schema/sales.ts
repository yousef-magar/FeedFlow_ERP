import { pgTable, serial, text, integer, numeric, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const customersTable = pgTable("customers", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull().default(""),
  phone2: text("phone2").default(""),
  code: text("code"),
  address: text("address").default(""),
  region: text("region").default(""),
  governorate: text("governorate").default(""),
  distributionCenter: text("distribution_center").default(""),
  totalPurchases: numeric("total_purchases", { precision: 14, scale: 2 }).default("0"),
  lastPurchase: text("last_purchase"),
  creditLimit: numeric("credit_limit", { precision: 14, scale: 2 }).default("0"),
  outstandingDebt: numeric("outstanding_debt", { precision: 14, scale: 2 }).default("0"),
  savedAddresses: jsonb("saved_addresses").$type<{ governorate: string; region: string; village?: string; details: string[] }[]>().default([]),
  createdAt: timestamp("created_at").defaultNow(),
});

export const salesInvoicesTable = pgTable("sales_invoices", {
  id: text("id").primaryKey(),
  customerId: text("customer_id").references(() => customersTable.id).notNull(),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").default(""),
  type: text("type").notNull().default("cash"),
  status: text("status").notNull().default("paid"),
  date: text("date").notNull(),
  items: jsonb("items").$type<{
    productId: string; productName: string; productCode: string;
    qtyTons: number; bagWeight: number; bagCount: number; pricePerTon: number;
  }[]>().notNull(),
  discountPct: numeric("discount_pct", { precision: 5, scale: 2 }).default("0"),
  taxPct: numeric("tax_pct", { precision: 5, scale: 2 }).default("0"),
  subtotal: numeric("subtotal", { precision: 14, scale: 2 }).notNull(),
  discountAmt: numeric("discount_amt", { precision: 14, scale: 2 }).default("0"),
  taxAmt: numeric("tax_amt", { precision: 14, scale: 2 }).default("0"),
  total: numeric("total", { precision: 14, scale: 2 }).notNull(),
  paidAmount: numeric("paid_amount", { precision: 14, scale: 2 }).default("0"),
  marketerId: text("marketer_id"),
  pricingTier: text("pricing_tier"),
  additionalCharges: numeric("additional_charges", { precision: 10, scale: 2 }).default("0"),
  additionalChargesDesc: text("additional_charges_desc"),
  payMethod: text("pay_method"),
  payBank: text("pay_bank"),
  needsDelivery: boolean("needs_delivery").default(false),
  deliveryAddress: jsonb("delivery_address").$type<{ governorate: string; region: string; village?: string; details: string }>().default({ governorate: "", region: "", details: "" }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const salesReturnsTable = pgTable("sales_returns", {
  id: text("id").primaryKey(),
  invoiceId: text("invoice_id").references(() => salesInvoicesTable.id).notNull(),
  customerId: text("customer_id").references(() => customersTable.id).notNull(),
  customerName: text("customer_name").notNull(),
  date: text("date").notNull(),
  items: jsonb("items").$type<{
    productId: string; productName: string;
    qtyTons: number; bagWeight: number; bagCount: number; pricePerTon: number;
  }[]>().notNull(),
  reason: text("reason").notNull(),
  total: numeric("total", { precision: 14, scale: 2 }).notNull(),
  discountPct: numeric("discount_pct", { precision: 5, scale: 2 }).default("0"),
  discountAmt: numeric("discount_amt", { precision: 14, scale: 2 }).default("0"),
  taxPct: numeric("tax_pct", { precision: 5, scale: 2 }).default("0"),
  taxAmt: numeric("tax_amt", { precision: 14, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const customerPaymentsTable = pgTable("customer_payments", {
  id: text("id").primaryKey(),
  customerId: text("customer_id").references(() => customersTable.id).notNull(),
  customerName: text("customer_name").notNull(),
  date: text("date").notNull(),
  amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
  type: text("type").notNull().default("cash_receipt"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const paymentAllocationsTable = pgTable("payment_allocations", {
  id: serial("id").primaryKey(),
  paymentId: text("payment_id").references(() => customerPaymentsTable.id).notNull(),
  invoiceId: text("invoice_id").references(() => salesInvoicesTable.id).notNull(),
  amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
});

export const insertCustomerSchema = createInsertSchema(customersTable);
export const insertSalesInvoiceSchema = createInsertSchema(salesInvoicesTable);

export type Customer = typeof customersTable.$inferSelect;
export type SalesInvoice = typeof salesInvoicesTable.$inferSelect;
export type SalesReturn = typeof salesReturnsTable.$inferSelect;
export type CustomerPayment = typeof customerPaymentsTable.$inferSelect;
export type PaymentAllocation = typeof paymentAllocationsTable.$inferSelect;
