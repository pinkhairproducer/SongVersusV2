import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertUserSchema,
  insertBattleSchema,
  insertVoteSchema,
  insertCommentSchema,
  insertChatMessageSchema,
} from "@shared/schema";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Auth/User routes
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const data = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existing = await storage.getUserByName(data.name);
      if (existing) {
        return res.status(400).json({ error: "User already exists" });
      }

      const user = await storage.createUser(data);
      res.json({ user: { ...user, password: undefined } });
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ error: fromZodError(error).toString() });
      }
      res.status(500).json({ error: "Failed to create user" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { name, password } = req.body;
      const user = await storage.getUserByName(name);

      if (!user || user.password !== password) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      res.json({ user: { ...user, password: undefined } });
    } catch (error) {
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({ ...user, password: undefined });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  app.patch("/api/users/:id/coins", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { coins } = req.body;
      
      if (typeof coins !== "number") {
        return res.status(400).json({ error: "Invalid coins value" });
      }

      await storage.updateUserCoins(id, coins);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update coins" });
    }
  });

  app.get("/api/leaderboard", async (req, res) => {
    try {
      const users = await storage.getLeaderboard();
      res.json(users.map(u => ({ ...u, password: undefined })));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
  });

  // Battle routes
  app.get("/api/battles", async (req, res) => {
    try {
      const battles = await storage.getAllBattles();
      res.json(battles);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch battles" });
    }
  });

  app.get("/api/battles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const battle = await storage.getBattle(id);
      
      if (!battle) {
        return res.status(404).json({ error: "Battle not found" });
      }

      res.json(battle);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch battle" });
    }
  });

  app.post("/api/battles", async (req, res) => {
    try {
      const data = insertBattleSchema.parse(req.body);
      const battle = await storage.createBattle(data);
      res.json(battle);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ error: fromZodError(error).toString() });
      }
      res.status(500).json({ error: "Failed to create battle" });
    }
  });

  app.post("/api/battles/:id/join", async (req, res) => {
    try {
      const battleId = parseInt(req.params.id);
      const { userId, artist, track, cover } = req.body;

      const battle = await storage.joinBattle(battleId, userId, artist, track, cover);
      res.json(battle);
    } catch (error) {
      res.status(500).json({ error: "Failed to join battle" });
    }
  });

  // Vote routes
  app.post("/api/votes", async (req, res) => {
    try {
      const data = insertVoteSchema.parse(req.body);
      
      // Check if user already voted
      const existing = await storage.getUserVote(data.battleId, data.userId);
      if (existing) {
        return res.status(400).json({ error: "Already voted" });
      }

      const vote = await storage.createVote(data);
      await storage.updateBattleVotes(data.battleId, data.side as "left" | "right", 1);
      
      res.json(vote);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ error: fromZodError(error).toString() });
      }
      res.status(500).json({ error: "Failed to vote" });
    }
  });

  app.get("/api/votes/:battleId/:userId", async (req, res) => {
    try {
      const battleId = parseInt(req.params.battleId);
      const userId = parseInt(req.params.userId);
      
      const vote = await storage.getUserVote(battleId, userId);
      res.json(vote || null);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch vote" });
    }
  });

  // Comment routes
  app.get("/api/comments/:battleId", async (req, res) => {
    try {
      const battleId = parseInt(req.params.battleId);
      const comments = await storage.getCommentsByBattle(battleId);
      res.json(comments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch comments" });
    }
  });

  app.post("/api/comments", async (req, res) => {
    try {
      const data = insertCommentSchema.parse(req.body);
      const comment = await storage.createComment(data);
      res.json(comment);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ error: fromZodError(error).toString() });
      }
      res.status(500).json({ error: "Failed to create comment" });
    }
  });

  // Chat routes
  app.get("/api/chat", async (req, res) => {
    try {
      const messages = await storage.getChatMessages();
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  app.post("/api/chat", async (req, res) => {
    try {
      const data = insertChatMessageSchema.parse(req.body);
      const message = await storage.createChatMessage(data);
      res.json(message);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ error: fromZodError(error).toString() });
      }
      res.status(500).json({ error: "Failed to send message" });
    }
  });

  return httpServer;
}
