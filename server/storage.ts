import {
  users,
  battles,
  votes,
  comments,
  chatMessages,
  follows,
  notifications,
  messages,
  customizations,
  userCustomizations,
  emailVerificationTokens,
  passwordResetTokens,
  battleRequests,
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
  type Customization,
  type UserCustomization,
  type BattleRequest,
  type InsertBattleRequest,
} from "@shared/schema";
import crypto from "crypto";
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
  updateUserStripeInfo(id: number, stripeCustomerId: string | null, stripeSubscriptionId: string | null, membership: string, isNewPurchase?: boolean): Promise<User>;
  getLeaderboard(limit?: number): Promise<User[]>;
  countFounders(): Promise<number>;
  canUserBattle(userId: number): Promise<{ canBattle: boolean; reason?: string }>;

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

  getAllCustomizations(): Promise<Customization[]>;
  getCustomizationsByCategory(category: string): Promise<Customization[]>;
  getCustomization(id: number): Promise<Customization | undefined>;
  getUserCustomizations(userId: number): Promise<Array<Customization & { unlockedAt: Date }>>;
  unlockCustomization(userId: number, customizationId: number): Promise<UserCustomization>;
  buyCustomization(userId: number, customizationId: number): Promise<{ success: boolean; error?: string; newBalance?: number }>;
  hasCustomization(userId: number, customizationId: number): Promise<boolean>;
  equipCustomization(userId: number, category: string, customizationId: number): Promise<User>;
  updateUserLevel(userId: number, level: number): Promise<void>;
  completeTutorial(userId: number): Promise<void>;
  searchUsers(query: string): Promise<User[]>;
  getUsersByRole(role: string): Promise<User[]>;

  createBattleRequest(request: InsertBattleRequest): Promise<BattleRequest>;
  getBattleRequest(id: number): Promise<BattleRequest | undefined>;
  getPendingBattleRequests(userId: number): Promise<Array<BattleRequest & { challengerName: string | null; challengerAvatar: string | null }>>;
  getSentBattleRequests(userId: number): Promise<Array<BattleRequest & { challengedName: string | null; challengedAvatar: string | null }>>;
  updateBattleRequestStatus(id: number, status: string, challengedTrack?: string, challengedAudio?: string): Promise<BattleRequest>;
  linkBattleToRequest(requestId: number, battleId: number): Promise<void>;
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
          role: 'artist',
          roleSelected: false,
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
    if (role) {
      updateData.role = role;
      updateData.roleSelected = true;
    }
    const [user] = await db.update(users).set(updateData).where(eq(users.id, id)).returning();
    return user;
  }

  async updateUserStripeInfo(
    id: number, 
    stripeCustomerId: string | null, 
    stripeSubscriptionId: string | null, 
    membership: string,
    isNewPurchase: boolean = false
  ): Promise<User> {
    const updateData: any = { stripeCustomerId, stripeSubscriptionId, membership };
    
    if (isNewPurchase && (membership === 'pro' || membership === 'elite')) {
      const currentUser = await this.getUser(id);
      if (currentUser && !currentUser.membershipPurchasedAt) {
        updateData.membershipPurchasedAt = new Date();
        
        const founderCount = await this.countFounders();
        if (founderCount < 10) {
          updateData.foundersBadge = true;
        }
      }
    }
    
    const [user] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getLeaderboard(limit: number = 100): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.xp)).limit(limit);
  }

  async countFounders(): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(eq(users.foundersBadge, true));
    return Number(result[0]?.count || 0);
  }

  async canUserBattle(userId: number): Promise<{ canBattle: boolean; reason?: string }> {
    const user = await this.getUser(userId);
    if (!user) {
      return { canBattle: false, reason: "User not found" };
    }

    const BATTLE_COST = 250;

    if (user.membership === 'pro' || user.membership === 'elite') {
      return { canBattle: true };
    }

    if (user.coins >= BATTLE_COST) {
      return { canBattle: true };
    }

    return { 
      canBattle: false, 
      reason: "You need at least 250 coins to battle. Purchase a membership for unlimited battles!" 
    };
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

  async getAllCustomizations(): Promise<Customization[]> {
    return await db.select().from(customizations).orderBy(customizations.category, customizations.requiredLevel);
  }

  async getCustomizationsByCategory(category: string): Promise<Customization[]> {
    return await db.select().from(customizations).where(eq(customizations.category, category)).orderBy(customizations.requiredLevel);
  }

  async getUserCustomizations(userId: number): Promise<Array<Customization & { unlockedAt: Date }>> {
    const result = await db
      .select({
        id: customizations.id,
        category: customizations.category,
        name: customizations.name,
        description: customizations.description,
        previewUrl: customizations.previewUrl,
        cssClass: customizations.cssClass,
        animationData: customizations.animationData,
        unlockType: customizations.unlockType,
        requiredLevel: customizations.requiredLevel,
        coinCost: customizations.coinCost,
        rarity: customizations.rarity,
        isDefault: customizations.isDefault,
        createdAt: customizations.createdAt,
        unlockedAt: userCustomizations.unlockedAt,
      })
      .from(userCustomizations)
      .innerJoin(customizations, eq(userCustomizations.customizationId, customizations.id))
      .where(eq(userCustomizations.userId, userId));
    return result;
  }

  async unlockCustomization(userId: number, customizationId: number): Promise<UserCustomization> {
    const [unlock] = await db.insert(userCustomizations).values({ userId, customizationId }).returning();
    return unlock;
  }

  async getCustomization(id: number): Promise<Customization | undefined> {
    const [customization] = await db.select().from(customizations).where(eq(customizations.id, id));
    return customization || undefined;
  }

  async buyCustomization(userId: number, customizationId: number): Promise<{ success: boolean; error?: string; newBalance?: number }> {
    const user = await this.getUser(userId);
    if (!user) return { success: false, error: "User not found" };

    const customization = await this.getCustomization(customizationId);
    if (!customization) return { success: false, error: "Customization not found" };

    const alreadyOwned = await this.hasCustomization(userId, customizationId);
    if (alreadyOwned) return { success: false, error: "You already own this customization" };

    if (customization.requiredLevel && user.level < customization.requiredLevel) {
      return { success: false, error: `Requires level ${customization.requiredLevel}` };
    }

    const cost = customization.coinCost || 0;
    if (user.coins < cost) {
      return { success: false, error: `Not enough coins. Need ${cost}, have ${user.coins}` };
    }

    const newBalance = user.coins - cost;
    await db.update(users).set({ coins: newBalance }).where(eq(users.id, userId));
    await this.unlockCustomization(userId, customizationId);

    return { success: true, newBalance };
  }

  async hasCustomization(userId: number, customizationId: number): Promise<boolean> {
    const result = await db
      .select()
      .from(userCustomizations)
      .where(sql`${userCustomizations.userId} = ${userId} AND ${userCustomizations.customizationId} = ${customizationId}`);
    return result.length > 0;
  }

  async equipCustomization(userId: number, category: string, customizationId: number): Promise<User> {
    let updateData: any = {};
    if (category === 'plate') {
      updateData.equippedPlateId = customizationId;
    } else if (category === 'animation') {
      updateData.equippedAnimationId = customizationId;
    } else if (category === 'sphere') {
      updateData.equippedSphereId = customizationId;
    }
    const [user] = await db.update(users).set(updateData).where(eq(users.id, userId)).returning();
    return user;
  }

  async updateUserLevel(userId: number, level: number): Promise<void> {
    await db.update(users).set({ level }).where(eq(users.id, userId));
  }

  async completeTutorial(userId: number): Promise<void> {
    await db.update(users).set({ tutorialCompleted: true }).where(eq(users.id, userId));
  }

  async searchUsers(query: string): Promise<User[]> {
    return await db.select().from(users).where(sql`${users.name} ILIKE ${'%' + query + '%'}`).limit(10);
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.role, role)).limit(50);
  }

  async createEmailVerificationToken(userId: number): Promise<string> {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await db.insert(emailVerificationTokens).values({
      userId,
      token,
      expiresAt,
    });

    return token;
  }

  async verifyEmailToken(token: string): Promise<{ success: boolean; userId?: number; error?: string }> {
    const [record] = await db
      .select()
      .from(emailVerificationTokens)
      .where(eq(emailVerificationTokens.token, token));

    if (!record) {
      return { success: false, error: "Invalid verification token" };
    }

    if (record.consumedAt) {
      return { success: false, error: "Token has already been used" };
    }

    if (new Date() > record.expiresAt) {
      return { success: false, error: "Token has expired" };
    }

    await db
      .update(emailVerificationTokens)
      .set({ consumedAt: new Date() })
      .where(eq(emailVerificationTokens.id, record.id));

    await db
      .update(users)
      .set({ emailVerified: true })
      .where(eq(users.id, record.userId));

    return { success: true, userId: record.userId };
  }

  async createPasswordResetToken(userId: number): Promise<string> {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await db.insert(passwordResetTokens).values({
      userId,
      token,
      expiresAt,
    });

    return token;
  }

  async verifyPasswordResetToken(token: string): Promise<{ success: boolean; userId?: number; error?: string }> {
    const [record] = await db
      .select()
      .from(passwordResetTokens)
      .where(eq(passwordResetTokens.token, token));

    if (!record) {
      return { success: false, error: "Invalid reset token" };
    }

    if (record.consumedAt) {
      return { success: false, error: "Token has already been used" };
    }

    if (new Date() > record.expiresAt) {
      return { success: false, error: "Token has expired" };
    }

    await db
      .update(passwordResetTokens)
      .set({ consumedAt: new Date() })
      .where(eq(passwordResetTokens.id, record.id));

    return { success: true, userId: record.userId };
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async deleteExpiredTokens(): Promise<void> {
    const now = new Date();
    await db.delete(emailVerificationTokens).where(sql`${emailVerificationTokens.expiresAt} < ${now}`);
    await db.delete(passwordResetTokens).where(sql`${passwordResetTokens.expiresAt} < ${now}`);
  }

  async createBattleRequest(request: InsertBattleRequest): Promise<BattleRequest> {
    const [battleRequest] = await db.insert(battleRequests).values(request).returning();
    return battleRequest;
  }

  async getBattleRequest(id: number): Promise<BattleRequest | undefined> {
    const [battleRequest] = await db.select().from(battleRequests).where(eq(battleRequests.id, id));
    return battleRequest || undefined;
  }

  async getPendingBattleRequests(userId: number): Promise<Array<BattleRequest & { challengerName: string | null; challengerAvatar: string | null }>> {
    const result = await db
      .select({
        id: battleRequests.id,
        challengerId: battleRequests.challengerId,
        challengedId: battleRequests.challengedId,
        status: battleRequests.status,
        battleType: battleRequests.battleType,
        genre: battleRequests.genre,
        challengerTrack: battleRequests.challengerTrack,
        challengerAudio: battleRequests.challengerAudio,
        challengedTrack: battleRequests.challengedTrack,
        challengedAudio: battleRequests.challengedAudio,
        message: battleRequests.message,
        battleId: battleRequests.battleId,
        expiresAt: battleRequests.expiresAt,
        createdAt: battleRequests.createdAt,
        updatedAt: battleRequests.updatedAt,
        challengerName: users.name,
        challengerAvatar: users.profileImageUrl,
      })
      .from(battleRequests)
      .innerJoin(users, eq(battleRequests.challengerId, users.id))
      .where(sql`${battleRequests.challengedId} = ${userId} AND ${battleRequests.status} = 'pending'`)
      .orderBy(desc(battleRequests.createdAt));
    return result;
  }

  async getSentBattleRequests(userId: number): Promise<Array<BattleRequest & { challengedName: string | null; challengedAvatar: string | null }>> {
    const result = await db
      .select({
        id: battleRequests.id,
        challengerId: battleRequests.challengerId,
        challengedId: battleRequests.challengedId,
        status: battleRequests.status,
        battleType: battleRequests.battleType,
        genre: battleRequests.genre,
        challengerTrack: battleRequests.challengerTrack,
        challengerAudio: battleRequests.challengerAudio,
        challengedTrack: battleRequests.challengedTrack,
        challengedAudio: battleRequests.challengedAudio,
        message: battleRequests.message,
        battleId: battleRequests.battleId,
        expiresAt: battleRequests.expiresAt,
        createdAt: battleRequests.createdAt,
        updatedAt: battleRequests.updatedAt,
        challengedName: users.name,
        challengedAvatar: users.profileImageUrl,
      })
      .from(battleRequests)
      .innerJoin(users, eq(battleRequests.challengedId, users.id))
      .where(eq(battleRequests.challengerId, userId))
      .orderBy(desc(battleRequests.createdAt));
    return result;
  }

  async updateBattleRequestStatus(id: number, status: string, challengedTrack?: string, challengedAudio?: string): Promise<BattleRequest> {
    const updateData: any = { status, updatedAt: new Date() };
    if (challengedTrack) updateData.challengedTrack = challengedTrack;
    if (challengedAudio) updateData.challengedAudio = challengedAudio;
    const [battleRequest] = await db.update(battleRequests).set(updateData).where(eq(battleRequests.id, id)).returning();
    return battleRequest;
  }

  async linkBattleToRequest(requestId: number, battleId: number): Promise<void> {
    await db.update(battleRequests).set({ battleId, updatedAt: new Date() }).where(eq(battleRequests.id, requestId));
  }
}

export const storage = new DatabaseStorage();
