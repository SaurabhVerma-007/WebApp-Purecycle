import { db } from "./db";
import { users, cycles, dailyLogs, type User, type InsertUser, type InsertCycle, type InsertDailyLog, type Cycle, type DailyLog } from "@shared/schema";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // User
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Cycles
  getCycles(userId: number): Promise<Cycle[]>;
  getCycle(id: number): Promise<Cycle | undefined>;
  createCycle(cycle: InsertCycle): Promise<Cycle>;
  updateCycle(id: number, cycle: Partial<InsertCycle>): Promise<Cycle>;

  // Daily Logs
  getDailyLogs(userId: number): Promise<DailyLog[]>;
  createDailyLog(log: InsertDailyLog): Promise<DailyLog>;
  updateDailyLog(id: number, log: Partial<InsertDailyLog>): Promise<DailyLog>;
}

export class DatabaseStorage implements IStorage {
  // User
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Cycles
  async getCycles(userId: number): Promise<Cycle[]> {
    return await db.select().from(cycles).where(eq(cycles.userId, userId)).orderBy(desc(cycles.startDate));
  }

  async getCycle(id: number): Promise<Cycle | undefined> {
    const [cycle] = await db.select().from(cycles).where(eq(cycles.id, id));
    return cycle;
  }

  async createCycle(cycle: InsertCycle): Promise<Cycle> {
    const [newCycle] = await db.insert(cycles).values(cycle).returning();
    return newCycle;
  }

  async updateCycle(id: number, cycle: Partial<InsertCycle>): Promise<Cycle> {
    const [updated] = await db.update(cycles).set(cycle).where(eq(cycles.id, id)).returning();
    return updated;
  }

  // Daily Logs
  async getDailyLogs(userId: number): Promise<DailyLog[]> {
    return await db.select().from(dailyLogs).where(eq(dailyLogs.userId, userId)).orderBy(desc(dailyLogs.date));
  }

  async createDailyLog(log: InsertDailyLog): Promise<DailyLog> {
    const [newLog] = await db.insert(dailyLogs).values(log).returning();
    return newLog;
  }

  async updateDailyLog(id: number, log: Partial<InsertDailyLog>): Promise<DailyLog> {
    const [updated] = await db.update(dailyLogs).set(log).where(eq(dailyLogs.id, id)).returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
