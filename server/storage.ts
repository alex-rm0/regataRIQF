import { eq, desc, asc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import {
  admins, races, raceEntries, notifications, contactMessages,
  type Admin, type InsertAdmin,
  type Race, type InsertRace,
  type RaceEntry, type InsertRaceEntry,
  type Notification, type InsertNotification,
  type ContactMessage, type InsertContactMessage,
} from "@shared/schema";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool);

export async function getAdmin(username: string): Promise<Admin | undefined> {
  const result = await db.select().from(admins).where(eq(admins.username, username));
  return result[0];
}

export async function createAdmin(data: InsertAdmin): Promise<Admin> {
  const result = await db.insert(admins).values(data).returning();
  return result[0];
}

export async function getAllRaces(): Promise<Race[]> {
  return db.select().from(races).orderBy(asc(races.raceNumber));
}

export async function getRace(id: string): Promise<Race | undefined> {
  const result = await db.select().from(races).where(eq(races.id, id));
  return result[0];
}

export async function createRace(data: InsertRace): Promise<Race> {
  const result = await db.insert(races).values(data).returning();
  return result[0];
}

export async function updateRace(id: string, data: Partial<InsertRace>): Promise<Race | undefined> {
  const result = await db.update(races).set(data).where(eq(races.id, id)).returning();
  return result[0];
}

export async function deleteRace(id: string): Promise<void> {
  await db.delete(races).where(eq(races.id, id));
}

export async function getEntriesByRace(raceId: string): Promise<RaceEntry[]> {
  return db.select().from(raceEntries).where(eq(raceEntries.raceId, raceId)).orderBy(asc(raceEntries.lane));
}

export async function createRaceEntry(data: InsertRaceEntry): Promise<RaceEntry> {
  const result = await db.insert(raceEntries).values(data).returning();
  return result[0];
}

export async function updateRaceEntry(id: string, data: Partial<InsertRaceEntry>): Promise<RaceEntry | undefined> {
  const result = await db.update(raceEntries).set(data).where(eq(raceEntries.id, id)).returning();
  return result[0];
}

export async function deleteRaceEntry(id: string): Promise<void> {
  await db.delete(raceEntries).where(eq(raceEntries.id, id));
}

export async function getAllNotifications(): Promise<Notification[]> {
  return db.select().from(notifications).orderBy(desc(notifications.createdAt));
}

export async function createNotification(data: InsertNotification): Promise<Notification> {
  const result = await db.insert(notifications).values(data).returning();
  return result[0];
}

export async function deleteNotification(id: string): Promise<void> {
  await db.delete(notifications).where(eq(notifications.id, id));
}

export async function markNotificationRead(id: string): Promise<void> {
  await db.update(notifications).set({ read: true }).where(eq(notifications.id, id));
}

export async function getUnreadNotificationCount(): Promise<number> {
  const result = await db.select().from(notifications).where(eq(notifications.read, false));
  return result.length;
}

export async function getAllContactMessages(): Promise<ContactMessage[]> {
  return db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt));
}

export async function createContactMessage(data: InsertContactMessage): Promise<ContactMessage> {
  const result = await db.insert(contactMessages).values(data).returning();
  return result[0];
}

export async function markMessageRead(id: string): Promise<void> {
  await db.update(contactMessages).set({ read: true }).where(eq(contactMessages.id, id));
}

export async function deleteContactMessage(id: string): Promise<void> {
  await db.delete(contactMessages).where(eq(contactMessages.id, id));
}

export async function deleteAllRaces(): Promise<void> {
  await db.delete(raceEntries);
  await db.delete(races);
}

export async function seedAdmin() {
  const existing = await getAdmin("admin");
  if (!existing) {
    await createAdmin({ username: "admin", password: "regata2026" });
    console.log("Default admin created: admin/regata2026");
  }
}
