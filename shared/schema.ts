import { sql } from "drizzle-orm";
import { pgTable, text, varchar, serial, integer, timestamp, boolean, index, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  replitAuthId: varchar("replit_auth_id").unique(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  name: text("name"),
  role: text("role").default("artist"),
  roleSelected: boolean("role_selected").notNull().default(false),
  coins: integer("coins").notNull().default(1000),
  xp: integer("xp").notNull().default(0),
  level: integer("level").notNull().default(1),
  wins: integer("wins").notNull().default(0),
  bio: text("bio").default(""),
  membership: text("membership").notNull().default("free"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  equippedPlateId: integer("equipped_plate_id"),
  equippedAnimationId: integer("equipped_animation_id"),
  equippedSphereId: integer("equipped_sphere_id"),
  tutorialCompleted: boolean("tutorial_completed").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const battles = pgTable("battles", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  genre: text("genre").notNull(),
  status: text("status").notNull().default("pending"),
  leftArtist: text("left_artist").notNull(),
  leftTrack: text("left_track").notNull(),
  leftAudio: text("left_audio").notNull(),
  leftUserId: integer("left_user_id").references(() => users.id),
  rightArtist: text("right_artist"),
  rightTrack: text("right_track"),
  rightAudio: text("right_audio"),
  rightUserId: integer("right_user_id").references(() => users.id),
  leftVotes: integer("left_votes").notNull().default(0),
  rightVotes: integer("right_votes").notNull().default(0),
  endsAt: timestamp("ends_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const votes = pgTable("votes", {
  id: serial("id").primaryKey(),
  battleId: integer("battle_id").notNull().references(() => battles.id),
  userId: integer("user_id").notNull().references(() => users.id),
  side: text("side").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  battleId: integer("battle_id").notNull().references(() => battles.id),
  userId: integer("user_id").notNull().references(() => users.id),
  text: text("text").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  text: text("text").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const follows = pgTable("follows", {
  id: serial("id").primaryKey(),
  followerId: integer("follower_id").notNull().references(() => users.id),
  followingId: integer("following_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  fromUserId: integer("from_user_id").references(() => users.id),
  type: text("type").notNull(),
  battleId: integer("battle_id").references(() => battles.id),
  message: text("message").notNull(),
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  fromUserId: integer("from_user_id").notNull().references(() => users.id),
  toUserId: integer("to_user_id").notNull().references(() => users.id),
  subject: text("subject").notNull(),
  content: text("content").notNull(),
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const customizations = pgTable("customizations", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  previewUrl: text("preview_url"),
  cssClass: text("css_class"),
  animationData: jsonb("animation_data"),
  unlockType: text("unlock_type").notNull().default("level"),
  requiredLevel: integer("required_level").default(1),
  coinCost: integer("coin_cost").default(0),
  rarity: text("rarity").notNull().default("common"),
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const userCustomizations = pgTable("user_customizations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  customizationId: integer("customization_id").notNull().references(() => customizations.id),
  unlockedAt: timestamp("unlocked_at").notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type UpsertUser = {
  replitAuthId: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  profileImageUrl?: string | null;
};

export const insertBattleSchema = createInsertSchema(battles)
  .omit({
    id: true,
    createdAt: true,
    status: true,
    leftVotes: true,
    rightVotes: true,
    endsAt: true,
    rightArtist: true,
    rightTrack: true,
    rightAudio: true,
    rightUserId: true,
  });

export const joinBattleSchema = z.object({
  battleId: z.number(),
  artist: z.string().min(1),
  track: z.string().min(1),
  audio: z.string().min(1),
});

export const insertVoteSchema = createInsertSchema(votes).omit({
  id: true,
  createdAt: true,
});

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  createdAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

export const insertFollowSchema = createInsertSchema(follows).omit({
  id: true,
  createdAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export type Battle = typeof battles.$inferSelect;
export type InsertBattle = z.infer<typeof insertBattleSchema>;

export type Vote = typeof votes.$inferSelect;
export type InsertVote = z.infer<typeof insertVoteSchema>;

export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;

export type Follow = typeof follows.$inferSelect;
export type InsertFollow = z.infer<typeof insertFollowSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export const insertCustomizationSchema = createInsertSchema(customizations).omit({
  id: true,
  createdAt: true,
});

export const insertUserCustomizationSchema = createInsertSchema(userCustomizations).omit({
  id: true,
  unlockedAt: true,
});

export type Customization = typeof customizations.$inferSelect;
export type InsertCustomization = z.infer<typeof insertCustomizationSchema>;

export type UserCustomization = typeof userCustomizations.$inferSelect;
export type InsertUserCustomization = z.infer<typeof insertUserCustomizationSchema>;
