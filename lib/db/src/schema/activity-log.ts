import { pgTable, serial, text, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const activityEntriesTable = pgTable("activity_entries", {
  id: text("id").primaryKey(),
  module: text("module").notNull(),
  action: text("action").notNull(),
  description: text("description").notNull(),
  arDescription: text("ar_description").notNull(),
  enDescription: text("en_description").notNull(),
  user: text("user").notNull(),
  timestamp: text("timestamp").notNull(),
  relatedId: text("related_id"),
  metadata: jsonb("metadata").$type<Record<string, any>>(),
  createdAt: timestamp("created_at").defaultNow(),
});

export type ActivityEntry = typeof activityEntriesTable.$inferSelect;
