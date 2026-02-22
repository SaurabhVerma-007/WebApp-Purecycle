import type { Express } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import { setupAuth, hashPassword } from "./auth";
import { api } from "@shared/routes";
import { z } from "zod";
import { Groq } from "groq-sdk";

const groq = new Groq();

async function seed() {
  const existingUser = await storage.getUserByUsername("demo");
  if (!existingUser) {
    console.log("Seeding database...");
    const password = await hashPassword("demo123");
    const user = await storage.createUser({
      username: "demo",
      password,
      displayName: "Demo User",
      email: "demo@example.com",
    });

    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 5);

    await storage.createCycle({
      userId: user.id,
      startDate: startDate.toISOString().split("T")[0],
      notes: "Initial seeded cycle",
    });

    await storage.createDailyLog({
      userId: user.id,
      date: today.toISOString().split("T")[0],
      flowIntensity: "medium",
      symptoms: ["cramps", "fatigue"],
      mood: "tired",
      notes: "Feeling a bit low energy today.",
    });
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  setupAuth(app);
  seed().catch(console.error);

  const requireAuth = (req: any, res: any, next: any) => {
    if (req.isAuthenticated()) return next();
    res.status(401).json({ message: "Unauthorized" });
  };

  // Update tracking mode
  app.patch(api.auth.updateMode.path, requireAuth, async (req, res) => {
    try {
      const { trackingMode } = api.auth.updateMode.input.parse(req.body);
      const updated = await storage.updateUserMode((req as any).user.id, trackingMode);
      res.json({ trackingMode: updated.trackingMode });
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  });

  // Cycles
  app.get(api.cycles.list.path, requireAuth, async (req, res) => {
    const user = req.user as any;
    const cycles = await storage.getCycles(user.id);
    res.json(cycles);
  });

  app.post(api.cycles.create.path, requireAuth, async (req: any, res: any) => {
    try {
      const user = req.user as any;
      const input = api.cycles.create.input.parse(req.body);
      const cycle = await storage.createCycle({ ...input, userId: user.id });
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
      const user = req.user as any;
      const input = api.cycles.update.input.parse(req.body);
      const id = parseInt(req.params.id);
      const existing = await storage.getCycle(id);
      if (!existing || existing.userId !== user.id) {
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
    const user = req.user as any;
    const logs = await storage.getDailyLogs(user.id);
    res.json(logs);
  });

  app.post(api.dailyLogs.create.path, requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const input = api.dailyLogs.create.input.parse(req.body);
      const log = await storage.createDailyLog({ ...input, userId: user.id });
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

  // AI Chat — Groq streaming with user health data context
  app.post(api.ai.chat.path, requireAuth, async (req: any, res: any) => {
    try {
      const { message, context: providedContext } = req.body;
      const user = req.user as any;
      const trackingMode = user.trackingMode || "standard";

      // Fetch user's real health data
      const cycles = await storage.getCycles(user.id);
      const dailyLogs = await storage.getDailyLogs(user.id);

      // Build cycle summary
      const latestCycle = cycles[0];
      const cycleSummary = latestCycle
        ? `Latest cycle started on ${latestCycle.startDate}${latestCycle.endDate ? `, ended on ${latestCycle.endDate}` : " (ongoing)"}. Total cycles tracked: ${cycles.length}.`
        : "No cycles logged yet.";

      // Build recent logs summary (last 5)
      const recentLogs = dailyLogs.slice(0, 5).map(log =>
        `Date: ${log.date}, Flow: ${log.flowIntensity || "not logged"}, Mood: ${log.mood || "not logged"}, Symptoms: ${log.symptoms?.join(", ") || "none"}`
      ).join("\n");

      const modeContexts: Record<string, string> = {
        standard: "Focus on general cycle tracking and symptom management.",
        fertility: "Focus on identifying fertile windows, ovulation signs (BBT, cervical mucus), and optimizing conception chances.",
        pcos: "Focus on managing PCOS symptoms (irregular cycles, acne, hirsutism), hormonal balance, and lifestyle tracking.",
        pregnancy: "Focus on fetal development milestones, pregnancy symptoms, prenatal health, and preparing for birth.",
      };

      const systemPrompt = `You are a helpful, empathetic menstrual and reproductive health assistant.
You help users track their health according to their current mode: ${trackingMode.toUpperCase()}.
${modeContexts[trackingMode] || modeContexts.standard}
Disclaimer: You are not a doctor and cannot provide medical diagnoses. Always advise users to consult a professional for medical issues.
Keep responses concise and supportive. Always format your responses using markdown: use bullet points, numbered lists, bold headings, and line breaks to make responses easy to read. Never respond in a single paragraph.
The user's name is ${user.displayName || user.username}. Always address them by their name.

--- USER HEALTH DATA ---
${cycleSummary}

Recent Daily Logs:
${recentLogs || "No recent logs available."}
--- END HEALTH DATA ---

User Context: ${providedContext || "No specific health context provided."}`;

      // Set up SSE headers for streaming response
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      const chatCompletion = await groq.chat.completions.create({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 1,
        max_tokens: 1024,
        top_p: 1,
        stream: true as const,
        stop: null,
      });

      let fullResponse = "";

      for await (const chunk of chatCompletion) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          fullResponse += content;
          res.write(`data: ${JSON.stringify({ content })}\n\n`);
        }
      }

      res.write(`data: ${JSON.stringify({ done: true, response: fullResponse })}\n\n`);
      res.end();

    } catch (err) {
      console.error("AI Error:", err);
      if (res.headersSent) {
        res.write(`data: ${JSON.stringify({ error: "Failed to process AI request" })}\n\n`);
        res.end();
      } else {
        res.status(500).json({ message: "Failed to process AI request" });
      }
    }
  });

  return httpServer;
}