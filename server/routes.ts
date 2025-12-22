import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, hashPassword } from "./auth";
import { api } from "@shared/routes";
import { z } from "zod";
import OpenAI from "openai";

const openai = new OpenAI({ 
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL
});

async function seed() {
  const existingUser = await storage.getUserByUsername("demo");
  if (!existingUser) {
    console.log("Seeding database...");
    const password = await hashPassword("demo123");
    const user = await storage.createUser({
      username: "demo",
      password,
      displayName: "Demo User",
      email: "demo@example.com"
    });
    
    // Create a cycle starting 5 days ago
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 5);
    
    await storage.createCycle({
      userId: user.id,
      startDate: startDate.toISOString().split('T')[0],
      notes: "Initial seeded cycle"
    });
    
    // Log for today
    await storage.createDailyLog({
      userId: user.id,
      date: today.toISOString().split('T')[0],
      flowIntensity: "medium",
      symptoms: ["cramps", "fatigue"],
      mood: "tired",
      notes: "Feeling a bit low energy today."
    });
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  setupAuth(app);
  
  // Seed data
  seed().catch(console.error);

  // Protected route middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  };

  // Cycles
  app.get(api.cycles.list.path, requireAuth, async (req, res) => {
    const cycles = await storage.getCycles(req.user!.id);
    res.json(cycles);
  });

  app.post(api.cycles.create.path, requireAuth, async (req, res) => {
    try {
      const input = api.cycles.create.input.parse(req.body);
      const cycle = await storage.createCycle({ ...input, userId: req.user!.id });
      res.status(201).json(cycle);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  });

  app.put(api.cycles.update.path, requireAuth, async (req, res) => {
    try {
      const input = api.cycles.update.input.parse(req.body);
      const id = parseInt(req.params.id);
      const existing = await storage.getCycle(id);
      if (!existing || existing.userId !== req.user!.id) {
        return res.status(404).json({ message: "Cycle not found" });
      }
      const updated = await storage.updateCycle(id, input);
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  });

  // Daily Logs
  app.get(api.dailyLogs.list.path, requireAuth, async (req, res) => {
    const logs = await storage.getDailyLogs(req.user!.id);
    res.json(logs);
  });

  app.post(api.dailyLogs.create.path, requireAuth, async (req, res) => {
    try {
      const input = api.dailyLogs.create.input.parse(req.body);
      const log = await storage.createDailyLog({ ...input, userId: req.user!.id });
      res.status(201).json(log);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  });

  app.put(api.dailyLogs.update.path, requireAuth, async (req, res) => {
    try {
      const input = api.dailyLogs.update.input.parse(req.body);
      const id = parseInt(req.params.id);
      const updated = await storage.updateDailyLog(id, input);
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  });

  // AI Chat
  app.post(api.ai.chat.path, requireAuth, async (req, res) => {
    try {
      const { message, context } = req.body;
      
      const systemPrompt = `You are a helpful, empathetic menstrual health assistant. 
      You help women track their cycles and understand their symptoms. 
      Disclaimer: You are not a doctor and cannot provide medical diagnoses. Always advise users to consult a professional for medical issues.
      Keep responses concise and supportive.
      User Context: ${context || "No specific cycle context provided."}`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
      });

      const response = completion.choices[0].message.content || "I'm sorry, I couldn't generate a response.";
      res.json({ response });
    } catch (err) {
      console.error("AI Error:", err);
      res.status(500).json({ message: "Failed to process AI request" });
    }
  });

  return httpServer;
}
