import { sql } from "drizzle-orm";
import { pgTable, text, varchar, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  coins: integer("coins").notNull().default(1000),
  xp: integer("xp").notNull().default(0),
  wins: integer("wins").notNull().default(0),
  avatar: text("avatar").notNull().default("https://github.com/shadcn.png"),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const battles = pgTable("battles", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  status: text("status").notNull().default("active"),
  leftArtist: text("left_artist").notNull(),
  leftTrack: text("left_track").notNull(),
  leftCover: text("left_cover").notNull(),
  leftUserId: integer("left_user_id").references(() => users.id),
  rightArtist: text("right_artist"),
  rightTrack: text("right_track"),
  rightCover: text("right_cover"),
  rightUserId: integer("right_user_id").references(() => users.id),
  leftVotes: integer("left_votes").notNull().default(0),
  rightVotes: integer("right_votes").notNull().default(0),
  endsAt: timestamp("ends_at").notNull(),
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

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  coins: true,
  xp: true,
  wins: true,
  avatar: true,
});

export const insertBattleSchema = createInsertSchema(battles)
  .omit({
    id: true,
    createdAt: true,
    status: true,
    leftVotes: true,
    rightVotes: true,
  })
  .extend({
    endsAt: z.union([z.date(), z.string().datetime()]).pipe(z.coerce.date()),
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

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Battle = typeof battles.$inferSelect;
export type InsertBattle = z.infer<typeof insertBattleSchema>;

export type Vote = typeof votes.$inferSelect;
export type InsertVote = z.infer<typeof insertVoteSchema>;

export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
