import { pgTable, text, serial, integer, boolean, timestamp, numeric, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  walletAddress: text("wallet_address"),
  balance: numeric("balance", { precision: 10, scale: 2 }).default("0").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Team table for IPL teams
export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  shortName: text("short_name").notNull(),
  logoUrl: text("logo_url"),
});

// Status enum for matches
export const matchStatusEnum = pgEnum("match_status", [
  "upcoming",
  "live",
  "completed",
  "cancelled",
]);

// Match table for IPL matches
export const matches = pgTable("matches", {
  id: serial("id").primaryKey(),
  homeTeamId: integer("home_team_id").notNull().references(() => teams.id),
  awayTeamId: integer("away_team_id").notNull().references(() => teams.id),
  startTime: timestamp("start_time").notNull(),
  status: matchStatusEnum("status").default("upcoming").notNull(),
  homeTeamScore: text("home_team_score"),
  awayTeamScore: text("away_team_score"),
  venue: text("venue"),
  result: text("result"),
});

// Market types enum
export const marketTypeEnum = pgEnum("market_type", [
  "match_winner",
  "run_totals",
  "player_props",
]);

// Markets for betting
export const markets = pgTable("markets", {
  id: serial("id").primaryKey(),
  matchId: integer("match_id").notNull().references(() => matches.id),
  name: text("name").notNull(),
  type: marketTypeEnum("type").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});

// Order types enum
export const orderTypeEnum = pgEnum("order_type", ["buy", "sell"]);

// Status enum for orders
export const orderStatusEnum = pgEnum("order_status", [
  "open",
  "matched",
  "cancelled",
  "settled",
]);

// Orders in the orderbook
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  marketId: integer("market_id").notNull().references(() => markets.id),
  type: orderTypeEnum("type").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  selectionName: text("selection_name").notNull(),
  status: orderStatusEnum("status").default("open").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  txHash: text("tx_hash"),
});

// Bet outcomes enum
export const betOutcomeEnum = pgEnum("bet_outcome", [
  "pending",
  "won",
  "lost",
]);

// Bets placed by users
export const bets = pgTable("bets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  orderId: integer("order_id").notNull().references(() => orders.id),
  outcome: betOutcomeEnum("outcome").default("pending").notNull(),
  potentialReturn: numeric("potential_return", { precision: 10, scale: 2 }).notNull(),
  settledAt: timestamp("settled_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Transactions for the blockchain records
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  txHash: text("tx_hash").notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  type: text("type").notNull(), // deposit, withdrawal, bet, win
  status: text("status").notNull(), // pending, confirmed, failed
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertTeamSchema = createInsertSchema(teams).omit({
  id: true,
});

export const insertMatchSchema = createInsertSchema(matches).omit({
  id: true,
});

export const insertMarketSchema = createInsertSchema(markets).omit({
  id: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBetSchema = createInsertSchema(bets).omit({
  id: true,
  createdAt: true,
  settledAt: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertTeam = z.infer<typeof insertTeamSchema>;
export type Team = typeof teams.$inferSelect;

export type InsertMatch = z.infer<typeof insertMatchSchema>;
export type Match = typeof matches.$inferSelect;

export type InsertMarket = z.infer<typeof insertMarketSchema>;
export type Market = typeof markets.$inferSelect;

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

export type InsertBet = z.infer<typeof insertBetSchema>;
export type Bet = typeof bets.$inferSelect;

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;
