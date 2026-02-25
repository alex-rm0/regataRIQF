import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const admins = pgTable("admins", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const races = pgTable("races", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  raceNumber: integer("race_number").notNull(),
  time: text("time").notNull(),
  category: text("category").notNull(),
  gender: text("gender").notNull(),
  boatType: text("boat_type").notNull(),
  distance: integer("distance").notNull().default(1000),
  phase: text("phase").notNull().default("Série"),
  lanes: text("lanes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const raceEntries = pgTable("race_entries", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  raceId: varchar("race_id").notNull().references(() => races.id, { onDelete: "cascade" }),
  lane: integer("lane").notNull(),
  clubName: text("club_name").notNull(),
  crewNames: text("crew_names"),
  resultTime: text("result_time"),
  position: integer("position"),
  status: text("status").default("DNS"),
});

export const notifications = pgTable("notifications", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull().default("info"),
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const SCHEDULE_ICONS = [
  "boat", "trophy", "ribbon", "time", "flag", "medal", "gift",
  "restaurant", "musical-notes", "people", "megaphone", "star",
  "podium", "water", "fitness", "bicycle",
] as const;

export const scheduleEntries = pgTable("schedule_entries", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  time: text("time").notNull(),
  title: text("title").notNull(),
  icon: text("icon").notNull().default("time"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const contactMessages = pgTable("contact_messages", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAdminSchema = createInsertSchema(admins).pick({
  username: true,
  password: true,
});

export const insertRaceSchema = createInsertSchema(races).omit({
  id: true,
  createdAt: true,
});

export const insertRaceEntrySchema = createInsertSchema(raceEntries).omit({
  id: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export const insertScheduleEntrySchema = createInsertSchema(scheduleEntries).omit({
  id: true,
  createdAt: true,
});

export const insertContactMessageSchema = createInsertSchema(contactMessages).omit({
  id: true,
  read: true,
  createdAt: true,
});

export type Admin = typeof admins.$inferSelect;
export type InsertAdmin = z.infer<typeof insertAdminSchema>;
export type Race = typeof races.$inferSelect;
export type InsertRace = z.infer<typeof insertRaceSchema>;
export type RaceEntry = typeof raceEntries.$inferSelect;
export type InsertRaceEntry = z.infer<typeof insertRaceEntrySchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type ScheduleEntry = typeof scheduleEntries.$inferSelect;
export type InsertScheduleEntry = z.infer<typeof insertScheduleEntrySchema>;
export type ContactMessage = typeof contactMessages.$inferSelect;
export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;

export const CATEGORIES = ["Sub9", "Sub11", "Sub13", "Sub15", "Sub17", "Absoluto"] as const;
export const GENDERS = ["Masculino", "Feminino"] as const;
export const BOAT_TYPES = ["1x", "2x", "2-", "4x", "4-", "4+", "8+"] as const;
export const PHASES = ["Série", "Repescagem", "Semifinal", "Final A", "Final B", "Direto"] as const;
export const NOTIFICATION_TYPES = ["info", "warning", "urgent", "schedule"] as const;
