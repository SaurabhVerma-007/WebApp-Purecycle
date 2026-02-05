import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { setupAuth, hashPassword } from "./auth";
import { api } from "@shared/routes";
import { z } from "zod";
import Bytez from "bytez.js";

/* =========================
   BYTEZ (DeepSeek) SETUP
   ========================= */

let bytezModel: any = null;

if (process.env.BYTEZ_API_KEY) {
  const sdk = new Bytez(process.env.BYTEZ_API_KEY);
  bytezModel = sdk.model("deepseek-ai/DeepSeek-R1-Distill-Qwen-7B");
}

/* =========================
   SEED DATABASE
   ========================= */

async function seed() {
  const existingUser = await storage.getUserByUsername("demo");
  if (!existingUser) {
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
      notes: "Seeded cycle",
    });

    await storage.createDailyLog({
      userId: user.id,
      date: today.toISOString().split("T")[0],
      flowIntensity: "medium",
      symptoms: ["cramps"],
      mood: "tired",
      notes: "Seeded daily log",
    });
  }
}

/* =========================
   ROUTES
   ========================= */

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  setupAuth(app);
  seed().catch(console.error);

  /* ---------- AUTH GUARD ---------- */
  const requireAuth = (req: any, res: any, next: any) => {
    if (req.isAuthenticated()) return next();
    res.status(401).json({ message: "Unauthorized" });
  };

  /* ---------- TEST ---------- */
  app.get("/test", (_req, res) => {
    res.json({ ok: true });
  });

  /* ---------- USER MODE ---------- */
  app.patch(api.auth.updateMode.path, requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const { trackingMode } = api.auth.updateMode.input.parse(req.body);
      const updated = await storage.updateUserMode(user.id, trackingMode);
      res.json({ trackingMode: updated.trackingMode });
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  });

  /* =========================
     AI CHAT (BYTEZ + DEEPSEEK)
     ========================= */

  app.post(api.ai.chat.path, requireAuth, async (req, res) => {
    if (!bytezModel) {
      return res.status(503).json({ message: "AI service is disabled" });
    }

    try {
      const user = req.user as any;
      const trackingMode = user.trackingMode || "standard";
      const { message, context } = req.body;

      if (!message || typeof message !== "string") {
        return res.status(400).json({ message: "Message is required" });
      }

      const systemPrompt = `
You are a menstrual health assistant inside a period tracking app.

STRICT RULES:
- Output ONLY the final answer for the user.
- NEVER include thinking, reasoning, or analysis.
- NEVER explain what you are doing.
- NEVER mention "I think", "Let me", "Okay so", "I should"

CONTEXT:
This app is ONLY about periods, cramps, PMS, fatigue, cycle phases, and diet during menstruation.

BEHAVIOR:
- If user says "hi" → ask how their period or symptoms are or how they are feeling.
- If cramps/pain → suggest comfort + food tips.
- If diet → give period-friendly diet advice or which help with cramps.
- If fatigue → suggest sleep tips.
- If mood → suggest mood tips.
- Be empathetic and concise.
- NOT a doctor.

MODE: ${trackingMode.toUpperCase()}
USER CONTEXT: ${context || "None"}
`;

      const result = await bytezModel.run([
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ]);

      if (result?.error) {
        return res.status(500).json({ message: "AI failed to respond" });
      }

      let aiText =
        typeof result?.output?.content === "string"
          ? result.output.content
          : "";

      // 🔥 HARD SANITIZATION (no thoughts, no leaks)
      aiText = aiText
        .replace(/<think>[\s\S]*?<\/think>/gi, "")
        .replace(/<\/think>/gi, "")
        .split("\n")
        .filter(
          (line: string) =>
            !line.toLowerCase().includes("i am thinking") &&
           !line.toLowerCase().includes("I should") &&
            !line.toLowerCase().includes("let me") &&
            !line.toLowerCase().includes("okay so") &&
            !line.toLowerCase().includes("the user")
        )
        .join("\n")
        .trim();

      if (!aiText) {
        aiText =
          "Hello 😊 How are you feeling today? Are you experiencing cramps, fatigue, or any period-related discomfort?";
      }

      res.json({ response: aiText });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to process AI request" });
    }
  });

  /* ---------- FINAL RETURN ---------- */
  return httpServer;
}
