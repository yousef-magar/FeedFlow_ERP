import { pgTable, serial, text, numeric, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const subAccountsTable = pgTable("sub_accounts", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password"),
  passwordHash: text("password_hash"),
  role: text("role").notNull().default("employee"),
  active: boolean("active").default(true),
  permissions: jsonb("permissions").$type<Record<string, string>>().default({}),
  canExceedDiscountLimit: boolean("can_exceed_discount_limit").default(false),
  canAccessPricing: boolean("can_access_pricing").default(false),
  canAccessHR: boolean("can_access_hr").default(false),
  canAccessPayroll: boolean("can_access_payroll").default(false),
  featurePermissions: jsonb("feature_permissions").$type<Record<string, boolean>>().default({}),
  createdAt: timestamp("created_at").defaultNow(),
});

export const bankAccountsTable = pgTable("bank_accounts", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  balance: numeric("balance", { precision: 14, scale: 2 }).default("0"),
});

export const walletAccountsTable = pgTable("wallet_accounts", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  identifier: text("identifier").notNull(),
  balance: numeric("balance", { precision: 14, scale: 2 }).default("0"),
  maxLimit: numeric("max_limit", { precision: 10, scale: 2 }),
});

export const paymentMethodsTable = pgTable("payment_methods", {
  id: text("id").primaryKey(),
  labelAr: text("label_ar").notNull(),
  labelEn: text("label_en").notNull(),
});

export const expenseCategoriesTable = pgTable("expense_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
});

export const appSettingsTable = pgTable("app_settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
});

export type SubAccount = typeof subAccountsTable.$inferSelect;
export type BankAccount = typeof bankAccountsTable.$inferSelect;
export type WalletAccount = typeof walletAccountsTable.$inferSelect;
export type PaymentMethod = typeof paymentMethodsTable.$inferSelect;
export type ExpenseCategory = typeof expenseCategoriesTable.$inferSelect;
