import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertTeamSchema, 
  insertMatchSchema, 
  insertMarketSchema, 
  insertOrderSchema, 
  insertBetSchema, 
  insertTransactionSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // API Routes

  // Teams
  app.get("/api/teams", async (req: Request, res: Response) => {
    const teams = await storage.getTeams();
    res.json(teams);
  });

  app.get("/api/teams/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid team ID" });
    }
    
    const team = await storage.getTeam(id);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }
    
    res.json(team);
  });

  // Matches
  app.get("/api/matches", async (req: Request, res: Response) => {
    const status = req.query.status as string;
    let matches;
    
    if (status === "upcoming") {
      matches = await storage.getUpcomingMatches();
    } else if (status === "live") {
      matches = await storage.getLiveMatches();
    } else if (status === "completed") {
      matches = await storage.getCompletedMatches();
    } else {
      matches = await storage.getMatches();
    }
    
    res.json(matches);
  });

  app.get("/api/matches/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid match ID" });
    }
    
    const match = await storage.getMatch(id);
    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }
    
    // Get the teams for this match
    const homeTeam = await storage.getTeam(match.homeTeamId);
    const awayTeam = await storage.getTeam(match.awayTeamId);
    
    res.json({
      ...match,
      homeTeam,
      awayTeam
    });
  });

  // Markets
  app.get("/api/matches/:matchId/markets", async (req: Request, res: Response) => {
    const matchId = parseInt(req.params.matchId);
    if (isNaN(matchId)) {
      return res.status(400).json({ message: "Invalid match ID" });
    }
    
    const markets = await storage.getMarketsByMatchId(matchId);
    res.json(markets);
  });

  // Orders
  app.get("/api/markets/:marketId/orders", async (req: Request, res: Response) => {
    const marketId = parseInt(req.params.marketId);
    if (isNaN(marketId)) {
      return res.status(400).json({ message: "Invalid market ID" });
    }
    
    const orders = await storage.getOrdersByMarketId(marketId);
    
    // Group by selection name and organize into bids and asks
    const groupedOrders = orders.reduce((acc, order) => {
      const selectionKey = order.selectionName.toLowerCase().replace(/\s+/g, '_');
      
      if (!acc[selectionKey]) {
        acc[selectionKey] = {
          selection: order.selectionName,
          bids: [],
          asks: []
        };
      }
      
      if (order.type === "buy") {
        acc[selectionKey].bids.push(order);
      } else {
        acc[selectionKey].asks.push(order);
      }
      
      return acc;
    }, {} as Record<string, { selection: string, bids: any[], asks: any[] }>);
    
    // Sort bids (descending) and asks (ascending) by price
    for (const key in groupedOrders) {
      groupedOrders[key].bids.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
      groupedOrders[key].asks.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    }
    
    res.json(Object.values(groupedOrders));
  });

  // Place a new order
  app.post("/api/orders", async (req: Request, res: Response) => {
    try {
      const orderData = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(orderData);
      
      // If this is a real order with a user, we would create a corresponding bet
      if (order.userId) {
        const order_price = parseFloat(order.price);
        const order_amount = parseFloat(order.amount);
        
        const potentialReturn = order.type === "buy" 
          ? order_price * order_amount 
          : order_amount;
        
        await storage.createBet({
          userId: order.userId,
          orderId: order.id,
          outcome: "pending",
          potentialReturn: potentialReturn.toString()
        });
      }
      
      res.status(201).json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid order data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create order" });
      }
    }
  });

  // Get user bet history
  app.get("/api/users/:userId/bets", async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    const bets = await storage.getBetsByUserId(userId);
    
    // Enrich bet data with order and market information
    const enrichedBets = await Promise.all(bets.map(async (bet) => {
      const order = await storage.getOrder(bet.orderId);
      
      if (!order) {
        return { ...bet, order: null, market: null };
      }
      
      const market = await storage.getMarket(order.marketId);
      const match = market ? await storage.getMatch(market.matchId) : null;
      
      return {
        ...bet,
        order,
        market,
        match
      };
    }));
    
    res.json(enrichedBets);
  });

  // Transactions
  app.get("/api/users/:userId/transactions", async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    const transactions = await storage.getTransactionsByUserId(userId);
    res.json(transactions);
  });

  // Create a blockchain transaction record
  app.post("/api/transactions", async (req: Request, res: Response) => {
    try {
      const transactionData = insertTransactionSchema.parse(req.body);
      const transaction = await storage.createTransaction(transactionData);
      res.status(201).json(transaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid transaction data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create transaction" });
      }
    }
  });

  // User wallet connection
  app.post("/api/connect-wallet", async (req: Request, res: Response) => {
    try {
      const { walletAddress } = req.body;
      
      if (!walletAddress) {
        return res.status(400).json({ message: "Wallet address is required" });
      }
      
      // Check if a user with this wallet already exists
      let user = await storage.getUserByWalletAddress(walletAddress);
      
      if (!user) {
        // Create a new user with this wallet address
        const username = `user_${Math.floor(Math.random() * 1000000)}`;
        user = await storage.createUser({
          username,
          password: "blockchain_auth", // Placeholder password
          walletAddress,
          balance: "1000" // Give some initial balance for testing
        });
      }
      
      res.json({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          walletAddress: user.walletAddress,
          balance: user.balance
        }
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to connect wallet" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
