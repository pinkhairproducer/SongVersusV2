import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertBattleSchema,
  insertVoteSchema,
  insertCommentSchema,
  insertChatMessageSchema,
} from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { getUncachableStripeClient, getStripePublishableKey } from "./stripeClient";
import { setupAuth, isAuthenticated } from "./replitAuth";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  await setupAuth(app);

  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const replitAuthId = req.user.claims.sub;
      const user = await storage.getUserByReplitAuthId(replitAuthId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json(user);
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

  app.patch("/api/users/:id/profile", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { profileImageUrl, bio, name, role } = req.body;
      
      if (!profileImageUrl || bio === undefined) {
        return res.status(400).json({ error: "Profile image URL and bio are required" });
      }

      const user = await storage.updateUserProfile(id, profileImageUrl, bio, name, role);
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to update profile" });
    }
  });

  app.get("/api/leaderboard", async (req, res) => {
    try {
      const users = await storage.getLeaderboard();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
  });

  app.post("/api/users/:id/follow", async (req, res) => {
    try {
      const followerId = req.body.followerId;
      const followingId = parseInt(req.params.id);

      const isFollowing = await storage.isFollowing(followerId, followingId);
      if (isFollowing) {
        return res.status(400).json({ error: "Already following" });
      }

      const follow = await storage.followUser(followerId, followingId);
      const fromUser = await storage.getUser(followerId);
      
      await storage.createNotification({
        userId: followingId,
        fromUserId: followerId,
        type: "follow",
        message: `${fromUser?.name || 'Someone'} started following you`,
      });

      res.json(follow);
    } catch (error) {
      res.status(500).json({ error: "Failed to follow user" });
    }
  });

  app.post("/api/users/:id/unfollow", async (req, res) => {
    try {
      const followerId = req.body.followerId;
      const followingId = parseInt(req.params.id);

      await storage.unfollowUser(followerId, followingId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to unfollow user" });
    }
  });

  app.get("/api/users/:id/followers", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const followers = await storage.getFollowers(id);
      res.json(followers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch followers" });
    }
  });

  app.get("/api/users/:id/following", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const following = await storage.getFollowing(id);
      res.json(following);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch following" });
    }
  });

  app.get("/api/notifications/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const notifications = await storage.getNotifications(userId);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  });

  app.post("/api/notifications/:id/read", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.markNotificationAsRead(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to mark notification as read" });
    }
  });

  app.post("/api/notifications/:userId/read-all", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      await storage.markAllNotificationsAsRead(userId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to mark all notifications as read" });
    }
  });

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
      const battleData = {
        ...data,
        status: "pending" as const,
      };
      const battle = await storage.createBattle(battleData);
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
      const { userId, artist, track, audio } = req.body;

      const battle = await storage.joinBattle(battleId, userId, artist, track, audio);
      res.json(battle);
    } catch (error) {
      res.status(500).json({ error: "Failed to join battle" });
    }
  });

  app.post("/api/votes", async (req, res) => {
    try {
      const data = insertVoteSchema.parse(req.body);
      
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

  app.get("/api/stripe/config", async (req, res) => {
    try {
      const publishableKey = await getStripePublishableKey();
      res.json({ publishableKey });
    } catch (error) {
      res.status(500).json({ error: "Failed to get Stripe config" });
    }
  });

  app.get("/api/stripe/products", async (req, res) => {
    try {
      const products = await storage.getProductsWithPrices();
      res.json({ data: products });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.post("/api/stripe/checkout", async (req, res) => {
    try {
      const { priceId, userId, mode } = req.body;

      if (!priceId || !userId) {
        return res.status(400).json({ error: "priceId and userId are required" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const stripe = await getUncachableStripeClient();

      let customerId = user.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create({
          metadata: { userId: user.id.toString() },
        });
        await storage.updateUserStripeInfo(user.id, customer.id, null, user.membership);
        customerId = customer.id;
      }

      const domains = process.env.REPLIT_DOMAINS;
      const baseUrl = domains ? `https://${domains.split(',')[0]}` : 'http://localhost:5000';
      
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [{ price: priceId, quantity: 1 }],
        mode: mode || 'subscription',
        success_url: `${baseUrl}/store?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/store?canceled=true`,
        metadata: { 
          userId: user.id.toString(),
          mode: mode || 'subscription',
        },
      });

      res.json({ url: session.url });
    } catch (error: any) {
      console.error('Checkout error:', error.message);
      res.status(500).json({ error: "Failed to create checkout session" });
    }
  });

  app.get("/api/stripe/subscription/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      if (!user.stripeSubscriptionId) {
        return res.json({ subscription: null, membership: user.membership });
      }

      const subscription = await storage.getSubscription(user.stripeSubscriptionId);
      res.json({ subscription, membership: user.membership });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch subscription" });
    }
  });

  app.post("/api/stripe/portal", async (req, res) => {
    try {
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }

      const user = await storage.getUser(userId);
      if (!user || !user.stripeCustomerId) {
        return res.status(404).json({ error: "No Stripe customer found" });
      }

      const stripe = await getUncachableStripeClient();
      const domains = process.env.REPLIT_DOMAINS;
      const baseUrl = domains ? `https://${domains.split(',')[0]}` : 'http://localhost:5000';

      const session = await stripe.billingPortal.sessions.create({
        customer: user.stripeCustomerId,
        return_url: `${baseUrl}/store`,
      });

      res.json({ url: session.url });
    } catch (error: any) {
      console.error('Portal error:', error.message);
      res.status(500).json({ error: "Failed to create portal session" });
    }
  });

  app.post("/api/stripe/verify-purchase", async (req, res) => {
    try {
      const { sessionId, userId } = req.body;

      if (!sessionId || !userId) {
        return res.status(400).json({ error: "sessionId and userId are required" });
      }

      const stripe = await getUncachableStripeClient();
      
      const session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ['line_items', 'line_items.data.price.product'],
      });

      if (!session.metadata?.userId || parseInt(session.metadata.userId) !== userId) {
        return res.status(403).json({ error: "Session does not belong to this user" });
      }

      if (session.payment_status !== 'paid') {
        return res.status(400).json({ error: "Payment not completed" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const lineItem = session.line_items?.data[0];
      const product = lineItem?.price?.product as any;
      const metadata = product?.metadata || {};

      if (metadata.type === 'coins') {
        const coinAmount = parseInt(metadata.coinAmount || '0');
        if (coinAmount > 0) {
          const currentUser = await storage.getUser(userId);
          if (!currentUser) {
            return res.status(404).json({ error: "User not found" });
          }
          await storage.updateUserCoins(userId, currentUser.coins + coinAmount);
          return res.json({ 
            success: true, 
            type: 'coins', 
            amount: coinAmount,
            newBalance: currentUser.coins + coinAmount 
          });
        }
      }

      if (metadata.tier === 'pro' || metadata.tier === 'elite') {
        const subscriptionId = session.subscription as string;
        const currentUser = await storage.getUser(userId);
        if (!currentUser) {
          return res.status(404).json({ error: "User not found" });
        }
        
        if (currentUser.membership === metadata.tier) {
          return res.json({ 
            success: true, 
            type: 'membership', 
            tier: metadata.tier,
            bonusCoins: 0,
            alreadyApplied: true
          });
        }
        
        await storage.updateUserStripeInfo(
          userId, 
          session.customer as string, 
          subscriptionId, 
          metadata.tier
        );
        
        const bonusCoins = metadata.tier === 'elite' ? 1500 : 500;
        await storage.updateUserCoins(userId, currentUser.coins + bonusCoins);
        
        return res.json({ 
          success: true, 
          type: 'membership', 
          tier: metadata.tier,
          bonusCoins 
        });
      }

      res.json({ success: true, type: 'unknown' });
    } catch (error: any) {
      console.error('Verify purchase error:', error.message);
      res.status(500).json({ error: "Failed to verify purchase" });
    }
  });

  return httpServer;
}
