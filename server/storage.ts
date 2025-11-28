import {
  users,
  battles,
  votes,
  comments,
  chatMessages,
  type User,
  type InsertUser,
  type Battle,
  type InsertBattle,
  type Vote,
  type InsertVote,
  type Comment,
  type InsertComment,
  type ChatMessage,
  type InsertChatMessage,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql } from "drizzle-orm";

export interface StripeProduct {
  id: string;
  name: string;
  description: string | null;
  metadata: Record<string, string>;
  active: boolean;
}

export interface StripePrice {
  id: string;
  product: string;
  unit_amount: number;
  currency: string;
  recurring: { interval: string } | null;
  active: boolean;
  metadata: Record<string, string>;
}

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByName(name: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserCoins(id: number, coins: number): Promise<void>;
  updateUserStats(id: number, xp: number, wins: number): Promise<void>;
  updateUserStripeInfo(id: number, stripeCustomerId: string | null, stripeSubscriptionId: string | null, membership: string): Promise<User>;
  getLeaderboard(limit?: number): Promise<User[]>;

  // Stripe data (read from stripe schema)
  listProducts(active?: boolean): Promise<StripeProduct[]>;
  listPrices(active?: boolean): Promise<StripePrice[]>;
  getProductsWithPrices(): Promise<Array<StripeProduct & { prices: StripePrice[] }>>;
  getSubscription(subscriptionId: string): Promise<any>;

  // Battles
  getBattle(id: number): Promise<Battle | undefined>;
  getAllBattles(): Promise<Battle[]>;
  createBattle(battle: InsertBattle): Promise<Battle>;
  joinBattle(battleId: number, userId: number, artist: string, track: string, cover: string): Promise<Battle>;
  updateBattleVotes(battleId: number, side: "left" | "right", increment: number): Promise<void>;

  // Votes
  getUserVote(battleId: number, userId: number): Promise<Vote | undefined>;
  createVote(vote: InsertVote): Promise<Vote>;

  // Comments
  getCommentsByBattle(battleId: number): Promise<Array<Comment & { userName: string; userAvatar: string }>>;
  createComment(comment: InsertComment): Promise<Comment>;

  // Chat
  getChatMessages(limit?: number): Promise<Array<ChatMessage & { userName: string; userAvatar: string }>>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByName(name: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.name, name));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUserCoins(id: number, coins: number): Promise<void> {
    await db.update(users).set({ coins }).where(eq(users.id, id));
  }

  async updateUserStats(id: number, xp: number, wins: number): Promise<void> {
    await db.update(users).set({ xp, wins }).where(eq(users.id, id));
  }

  async updateUserStripeInfo(
    id: number, 
    stripeCustomerId: string | null, 
    stripeSubscriptionId: string | null, 
    membership: string
  ): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ stripeCustomerId, stripeSubscriptionId, membership })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getLeaderboard(limit: number = 100): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.xp)).limit(limit);
  }

  // Stripe data (read from stripe schema)
  async listProducts(active: boolean = true): Promise<StripeProduct[]> {
    const result = await db.execute(
      sql`SELECT id, name, description, metadata, active FROM stripe.products WHERE active = ${active}`
    );
    return result.rows as unknown as StripeProduct[];
  }

  async listPrices(active: boolean = true): Promise<StripePrice[]> {
    const result = await db.execute(
      sql`SELECT id, product, unit_amount, currency, recurring, active, metadata FROM stripe.prices WHERE active = ${active}`
    );
    return result.rows as unknown as StripePrice[];
  }

  async getProductsWithPrices(): Promise<Array<StripeProduct & { prices: StripePrice[] }>> {
    const result = await db.execute(sql`
      SELECT 
        p.id as product_id,
        p.name as product_name,
        p.description as product_description,
        p.active as product_active,
        p.metadata as product_metadata,
        pr.id as price_id,
        pr.unit_amount,
        pr.currency,
        pr.recurring,
        pr.active as price_active,
        pr.metadata as price_metadata
      FROM stripe.products p
      LEFT JOIN stripe.prices pr ON pr.product = p.id AND pr.active = true
      WHERE p.active = true
      ORDER BY p.id, pr.unit_amount
    `);

    const productsMap = new Map<string, StripeProduct & { prices: StripePrice[] }>();
    for (const row of result.rows as any[]) {
      if (!productsMap.has(row.product_id)) {
        productsMap.set(row.product_id, {
          id: row.product_id,
          name: row.product_name,
          description: row.product_description,
          metadata: row.product_metadata || {},
          active: row.product_active,
          prices: []
        });
      }
      if (row.price_id) {
        productsMap.get(row.product_id)!.prices.push({
          id: row.price_id,
          product: row.product_id,
          unit_amount: row.unit_amount,
          currency: row.currency,
          recurring: row.recurring,
          active: row.price_active,
          metadata: row.price_metadata || {},
        });
      }
    }

    return Array.from(productsMap.values());
  }

  async getSubscription(subscriptionId: string): Promise<any> {
    const result = await db.execute(
      sql`SELECT * FROM stripe.subscriptions WHERE id = ${subscriptionId}`
    );
    return result.rows[0] || null;
  }

  // Battles
  async getBattle(id: number): Promise<Battle | undefined> {
    const [battle] = await db.select().from(battles).where(eq(battles.id, id));
    return battle || undefined;
  }

  async getAllBattles(): Promise<Battle[]> {
    return await db.select().from(battles).orderBy(desc(battles.createdAt));
  }

  async createBattle(insertBattle: InsertBattle): Promise<Battle> {
    const [battle] = await db.insert(battles).values(insertBattle).returning();
    return battle;
  }

  async joinBattle(battleId: number, userId: number, artist: string, track: string, cover: string): Promise<Battle> {
    const [battle] = await db
      .update(battles)
      .set({
        rightArtist: artist,
        rightTrack: track,
        rightCover: cover,
        rightUserId: userId,
      })
      .where(eq(battles.id, battleId))
      .returning();
    return battle;
  }

  async updateBattleVotes(battleId: number, side: "left" | "right", increment: number): Promise<void> {
    if (side === "left") {
      await db
        .update(battles)
        .set({ leftVotes: sql`${battles.leftVotes} + ${increment}` })
        .where(eq(battles.id, battleId));
    } else {
      await db
        .update(battles)
        .set({ rightVotes: sql`${battles.rightVotes} + ${increment}` })
        .where(eq(battles.id, battleId));
    }
  }

  // Votes
  async getUserVote(battleId: number, userId: number): Promise<Vote | undefined> {
    const [vote] = await db
      .select()
      .from(votes)
      .where(sql`${votes.battleId} = ${battleId} AND ${votes.userId} = ${userId}`);
    return vote || undefined;
  }

  async createVote(insertVote: InsertVote): Promise<Vote> {
    const [vote] = await db.insert(votes).values(insertVote).returning();
    return vote;
  }

  // Comments
  async getCommentsByBattle(battleId: number): Promise<Array<Comment & { userName: string; userAvatar: string }>> {
    const result = await db
      .select({
        id: comments.id,
        battleId: comments.battleId,
        userId: comments.userId,
        text: comments.text,
        createdAt: comments.createdAt,
        userName: users.name,
        userAvatar: users.avatar,
      })
      .from(comments)
      .innerJoin(users, eq(comments.userId, users.id))
      .where(eq(comments.battleId, battleId))
      .orderBy(desc(comments.createdAt));

    return result;
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const [comment] = await db.insert(comments).values(insertComment).returning();
    return comment;
  }

  // Chat
  async getChatMessages(limit: number = 50): Promise<Array<ChatMessage & { userName: string; userAvatar: string }>> {
    const result = await db
      .select({
        id: chatMessages.id,
        userId: chatMessages.userId,
        text: chatMessages.text,
        createdAt: chatMessages.createdAt,
        userName: users.name,
        userAvatar: users.avatar,
      })
      .from(chatMessages)
      .innerJoin(users, eq(chatMessages.userId, users.id))
      .orderBy(desc(chatMessages.createdAt))
      .limit(limit);

    return result.reverse();
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const [message] = await db.insert(chatMessages).values(insertMessage).returning();
    return message;
  }
}

export const storage = new DatabaseStorage();
