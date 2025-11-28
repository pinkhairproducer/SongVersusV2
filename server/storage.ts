import {
  users,
  battles,
  votes,
  comments,
  chatMessages,
  follows,
  notifications,
  messages,
  type User,
  type UpsertUser,
  type Battle,
  type InsertBattle,
  type Vote,
  type InsertVote,
  type Comment,
  type InsertComment,
  type ChatMessage,
  type InsertChatMessage,
  type Follow,
  type InsertFollow,
  type Notification,
  type InsertNotification,
  type Message,
  type InsertMessage,
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
  getUser(id: number): Promise<User | undefined>;
  getUserByReplitAuthId(replitAuthId: string): Promise<User | undefined>;
  getUserByName(name: string): Promise<User | undefined>;
  upsertUser(userData: UpsertUser): Promise<User>;
  updateUserCoins(id: number, coins: number): Promise<void>;
  updateUserStats(id: number, xp: number, wins: number): Promise<void>;
  updateUserProfile(id: number, profileImageUrl: string, bio: string, name?: string, role?: string): Promise<User>;
  updateUserStripeInfo(id: number, stripeCustomerId: string | null, stripeSubscriptionId: string | null, membership: string): Promise<User>;
  getLeaderboard(limit?: number): Promise<User[]>;

  listProducts(active?: boolean): Promise<StripeProduct[]>;
  listPrices(active?: boolean): Promise<StripePrice[]>;
  getProductsWithPrices(): Promise<Array<StripeProduct & { prices: StripePrice[] }>>;
  getSubscription(subscriptionId: string): Promise<any>;

  getBattle(id: number): Promise<Battle | undefined>;
  getAllBattles(): Promise<Battle[]>;
  createBattle(battle: InsertBattle): Promise<Battle>;
  joinBattle(battleId: number, userId: number, artist: string, track: string, audio: string): Promise<Battle>;
  updateBattleVotes(battleId: number, side: "left" | "right", increment: number): Promise<void>;

  getUserVote(battleId: number, userId: number): Promise<Vote | undefined>;
  createVote(vote: InsertVote): Promise<Vote>;

  getCommentsByBattle(battleId: number): Promise<Array<Comment & { userName: string | null; userAvatar: string | null }>>;
  createComment(comment: InsertComment): Promise<Comment>;

  getChatMessages(limit?: number): Promise<Array<ChatMessage & { userName: string | null; userAvatar: string | null }>>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;

  followUser(followerId: number, followingId: number): Promise<Follow>;
  unfollowUser(followerId: number, followingId: number): Promise<void>;
  isFollowing(followerId: number, followingId: number): Promise<boolean>;
  getFollowers(userId: number): Promise<User[]>;
  getFollowing(userId: number): Promise<User[]>;

  getNotifications(userId: number): Promise<Array<Notification & { fromUserName?: string | null; fromUserAvatar?: string | null }>>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(notificationId: number): Promise<void>;
  markAllNotificationsAsRead(userId: number): Promise<void>;
  getUnreadNotificationCount(userId: number): Promise<number>;

  getMessages(userId: number): Promise<Array<Message & { fromUserName?: string | null; fromUserAvatar?: string | null }>>;
  getSentMessages(userId: number): Promise<Array<Message & { toUserName?: string | null; toUserAvatar?: string | null }>>;
  getMessage(messageId: number): Promise<Message | undefined>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessageAsRead(messageId: number): Promise<void>;
  getUnreadMessageCount(userId: number): Promise<number>;
  getNotification(notificationId: number): Promise<Notification | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByReplitAuthId(replitAuthId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.replitAuthId, replitAuthId));
    return user || undefined;
  }

  async getUserByName(name: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.name, name));
    return user || undefined;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existingUser = await this.getUserByReplitAuthId(userData.replitAuthId);
    
    if (existingUser) {
      const [user] = await db
        .update(users)
        .set({
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          profileImageUrl: userData.profileImageUrl,
          updatedAt: new Date(),
        })
        .where(eq(users.replitAuthId, userData.replitAuthId))
        .returning();
      return user;
    } else {
      const [user] = await db
        .insert(users)
        .values({
          replitAuthId: userData.replitAuthId,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          profileImageUrl: userData.profileImageUrl,
          name: userData.firstName || userData.email?.split('@')[0] || 'User',
        })
        .returning();
      return user;
    }
  }

  async updateUserCoins(id: number, coins: number): Promise<void> {
    await db.update(users).set({ coins }).where(eq(users.id, id));
  }

  async updateUserStats(id: number, xp: number, wins: number): Promise<void> {
    await db.update(users).set({ xp, wins }).where(eq(users.id, id));
  }

  async updateUserProfile(id: number, profileImageUrl: string, bio: string, name?: string, role?: string): Promise<User> {
    const updateData: any = { profileImageUrl, bio, updatedAt: new Date() };
    if (name) updateData.name = name;
    if (role) updateData.role = role;
    const [user] = await db.update(users).set(updateData).where(eq(users.id, id)).returning();
    return user;
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

  async joinBattle(battleId: number, userId: number, artist: string, track: string, audio: string): Promise<Battle> {
    const [battle] = await db
      .update(battles)
      .set({
        rightArtist: artist,
        rightTrack: track,
        rightAudio: audio,
        rightUserId: userId,
        status: "active",
        endsAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
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

  async getCommentsByBattle(battleId: number): Promise<Array<Comment & { userName: string | null; userAvatar: string | null }>> {
    const result = await db
      .select({
        id: comments.id,
        battleId: comments.battleId,
        userId: comments.userId,
        text: comments.text,
        createdAt: comments.createdAt,
        userName: users.name,
        userAvatar: users.profileImageUrl,
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

  async getChatMessages(limit: number = 50): Promise<Array<ChatMessage & { userName: string | null; userAvatar: string | null }>> {
    const result = await db
      .select({
        id: chatMessages.id,
        userId: chatMessages.userId,
        text: chatMessages.text,
        createdAt: chatMessages.createdAt,
        userName: users.name,
        userAvatar: users.profileImageUrl,
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

  async followUser(followerId: number, followingId: number): Promise<Follow> {
    const [follow] = await db.insert(follows).values({ followerId, followingId }).returning();
    return follow;
  }

  async unfollowUser(followerId: number, followingId: number): Promise<void> {
    await db.delete(follows).where(
      sql`${follows.followerId} = ${followerId} AND ${follows.followingId} = ${followingId}`
    );
  }

  async isFollowing(followerId: number, followingId: number): Promise<boolean> {
    const [result] = await db
      .select()
      .from(follows)
      .where(
        sql`${follows.followerId} = ${followerId} AND ${follows.followingId} = ${followingId}`
      );
    return !!result;
  }

  async getFollowers(userId: number): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .innerJoin(follows, eq(follows.followerId, users.id))
      .where(eq(follows.followingId, userId))
      .then(results => results.map(r => r.users));
  }

  async getFollowing(userId: number): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .innerJoin(follows, eq(follows.followingId, users.id))
      .where(eq(follows.followerId, userId))
      .then(results => results.map(r => r.users));
  }

  async getNotifications(userId: number): Promise<Array<Notification & { fromUserName?: string | null; fromUserAvatar?: string | null }>> {
    const result = await db
      .select({
        id: notifications.id,
        userId: notifications.userId,
        fromUserId: notifications.fromUserId,
        type: notifications.type,
        battleId: notifications.battleId,
        message: notifications.message,
        read: notifications.read,
        createdAt: notifications.createdAt,
        fromUserName: users.name,
        fromUserAvatar: users.profileImageUrl,
      })
      .from(notifications)
      .leftJoin(users, eq(notifications.fromUserId, users.id))
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));

    return result;
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const [notification] = await db.insert(notifications).values(insertNotification).returning();
    return notification;
  }

  async markNotificationAsRead(notificationId: number): Promise<void> {
    await db.update(notifications).set({ read: true }).where(eq(notifications.id, notificationId));
  }

  async markAllNotificationsAsRead(userId: number): Promise<void> {
    await db.update(notifications).set({ read: true }).where(eq(notifications.userId, userId));
  }

  async getUnreadNotificationCount(userId: number): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(notifications)
      .where(sql`${notifications.userId} = ${userId} AND ${notifications.read} = false`);
    return result[0]?.count || 0;
  }

  async getMessages(userId: number): Promise<Array<Message & { fromUserName?: string | null; fromUserAvatar?: string | null }>> {
    const result = await db
      .select({
        id: messages.id,
        fromUserId: messages.fromUserId,
        toUserId: messages.toUserId,
        subject: messages.subject,
        content: messages.content,
        read: messages.read,
        createdAt: messages.createdAt,
        fromUserName: users.name,
        fromUserAvatar: users.profileImageUrl,
      })
      .from(messages)
      .leftJoin(users, eq(messages.fromUserId, users.id))
      .where(eq(messages.toUserId, userId))
      .orderBy(desc(messages.createdAt));

    return result;
  }

  async getSentMessages(userId: number): Promise<Array<Message & { toUserName?: string | null; toUserAvatar?: string | null }>> {
    const result = await db
      .select({
        id: messages.id,
        fromUserId: messages.fromUserId,
        toUserId: messages.toUserId,
        subject: messages.subject,
        content: messages.content,
        read: messages.read,
        createdAt: messages.createdAt,
        toUserName: users.name,
        toUserAvatar: users.profileImageUrl,
      })
      .from(messages)
      .leftJoin(users, eq(messages.toUserId, users.id))
      .where(eq(messages.fromUserId, userId))
      .orderBy(desc(messages.createdAt));

    return result;
  }

  async getMessage(messageId: number): Promise<Message | undefined> {
    const [message] = await db.select().from(messages).where(eq(messages.id, messageId));
    return message || undefined;
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db.insert(messages).values(insertMessage).returning();
    return message;
  }

  async markMessageAsRead(messageId: number): Promise<void> {
    await db.update(messages).set({ read: true }).where(eq(messages.id, messageId));
  }

  async getUnreadMessageCount(userId: number): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(messages)
      .where(sql`${messages.toUserId} = ${userId} AND ${messages.read} = false`);
    return result[0]?.count || 0;
  }

  async getNotification(notificationId: number): Promise<Notification | undefined> {
    const [notification] = await db.select().from(notifications).where(eq(notifications.id, notificationId));
    return notification || undefined;
  }
}

export const storage = new DatabaseStorage();
