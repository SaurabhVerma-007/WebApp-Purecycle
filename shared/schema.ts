import { pgTable, text, serial, integer, boolean, timestamp, date, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name"),
  email: text("email"),
  trackingMode: text("tracking_mode").default("standard"), // "standard", "fertility", "pcos", "pregnancy"
  createdAt: timestamp("created_at").defaultNow(),
});

export const cycles = pgTable("cycles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  notes: text("notes"),
});

export const dailyLogs = pgTable("daily_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  date: date("date").notNull(),
  flowIntensity: text("flow_intensity"),
  symptoms: text("symptoms").array(),
  mood: text("mood"),
  notes: text("notes"),
  // Additional data for specialized modes
  basalBodyTemp: text("basal_body_temp"), // For fertility mode
  cervicalMucus: text("cervical_mucus"), // For fertility mode
  pregnancyTest: text("pregnancy_test"), // "positive", "negative"
  pcosSymptoms: text("pcos_symptoms").array(), // Specific symptoms like hair growth, acne
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  displayName: true,
  email: true,
  trackingMode: true,
});

export const insertCycleSchema = createInsertSchema(cycles).omit({ id: true });
export const insertDailyLogSchema = createInsertSchema(dailyLogs).omit({ id: true });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertCycle = z.infer<typeof insertCycleSchema>;
export type Cycle = typeof cycles.$inferSelect;
export type InsertDailyLog = z.infer<typeof insertDailyLogSchema>;
export type DailyLog = typeof dailyLogs.$inferSelect;
