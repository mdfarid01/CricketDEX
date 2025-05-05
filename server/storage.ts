import {
  User, InsertUser, Team, InsertTeam, Match, InsertMatch,
  Market, InsertMarket, Order, InsertOrder, Bet, InsertBet,
  Transaction, InsertTransaction
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByWalletAddress(walletAddress: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserBalance(id: number, amount: number): Promise<User | undefined>;

  // Team operations
  getTeam(id: number): Promise<Team | undefined>;
  getTeams(): Promise<Team[]>;
  createTeam(team: InsertTeam): Promise<Team>;

  // Match operations
  getMatch(id: number): Promise<Match | undefined>;
  getMatches(): Promise<Match[]>;
  getUpcomingMatches(): Promise<Match[]>;
  getLiveMatches(): Promise<Match[]>;
  getCompletedMatches(): Promise<Match[]>;
  createMatch(match: InsertMatch): Promise<Match>;
  updateMatchStatus(id: number, status: string, homeTeamScore?: string, awayTeamScore?: string): Promise<Match | undefined>;

  // Market operations
  getMarket(id: number): Promise<Market | undefined>;
  getMarketsByMatchId(matchId: number): Promise<Market[]>;
  createMarket(market: InsertMarket): Promise<Market>;
  updateMarketStatus(id: number, isActive: boolean): Promise<Market | undefined>;

  // Order operations
  getOrder(id: number): Promise<Order | undefined>;
  getOrdersByUserId(userId: number): Promise<Order[]>;
  getOrdersByMarketId(marketId: number): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;

  // Bet operations
  getBet(id: number): Promise<Bet | undefined>;
  getBetsByUserId(userId: number): Promise<Bet[]>;
  createBet(bet: InsertBet): Promise<Bet>;
  updateBetOutcome(id: number, outcome: string): Promise<Bet | undefined>;

  // Transaction operations
  getTransaction(id: number): Promise<Transaction | undefined>;
  getTransactionsByUserId(userId: number): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private teams: Map<number, Team>;
  private matches: Map<number, Match>;
  private markets: Map<number, Market>;
  private orders: Map<number, Order>;
  private bets: Map<number, Bet>;
  private transactions: Map<number, Transaction>;
  
  private userId: number;
  private teamId: number;
  private matchId: number;
  private marketId: number;
  private orderId: number;
  private betId: number;
  private transactionId: number;

  constructor() {
    this.users = new Map();
    this.teams = new Map();
    this.matches = new Map();
    this.markets = new Map();
    this.orders = new Map();
    this.bets = new Map();
    this.transactions = new Map();
    
    this.userId = 1;
    this.teamId = 1;
    this.matchId = 1;
    this.marketId = 1;
    this.orderId = 1;
    this.betId = 1;
    this.transactionId = 1;

    // Initialize with some demo data
    this.initializeData();
  }

  private initializeData() {
    // Create IPL teams
    const teamNames = [
      { name: "Chennai Super Kings", shortName: "CSK" },
      { name: "Mumbai Indians", shortName: "MI" },
      { name: "Royal Challengers Bangalore", shortName: "RCB" },
      { name: "Kolkata Knight Riders", shortName: "KKR" },
      { name: "Delhi Capitals", shortName: "DC" },
      { name: "Punjab Kings", shortName: "PBKS" },
      { name: "Rajasthan Royals", shortName: "RR" },
      { name: "Sunrisers Hyderabad", shortName: "SRH" }
    ];

    const teamIds: number[] = [];
    
    for (const teamData of teamNames) {
      const team = this.createTeam({
        name: teamData.name,
        shortName: teamData.shortName,
        logoUrl: ""
      });
      teamIds.push(team.id);
    }

    // Create matches
    const now = new Date();
    
    // Live match
    const liveMatch = this.createMatch({
      homeTeamId: teamIds[0], // CSK
      awayTeamId: teamIds[1], // MI
      startTime: new Date(now.getTime() - 3600 * 1000), // 1 hour ago
      status: "live",
      homeTeamScore: "120/3 (14.2 ov)",
      awayTeamScore: "185/6 (20 ov)",
      venue: "M.A. Chidambaram Stadium, Chennai",
      result: ""
    });

    // Upcoming matches
    const upcomingMatches = [
      {
        homeTeamId: teamIds[2], // RCB
        awayTeamId: teamIds[3], // KKR
        startTime: new Date(now.getTime() + 2 * 24 * 3600 * 1000), // 2 days later
        venue: "M. Chinnaswamy Stadium, Bangalore"
      },
      {
        homeTeamId: teamIds[4], // DC
        awayTeamId: teamIds[5], // PBKS
        startTime: new Date(now.getTime() + 4 * 24 * 3600 * 1000), // 4 days later
        venue: "Arun Jaitley Stadium, Delhi"
      },
      {
        homeTeamId: teamIds[6], // RR
        awayTeamId: teamIds[7], // SRH
        startTime: new Date(now.getTime() + 7 * 24 * 3600 * 1000), // 7 days later
        venue: "Sawai Mansingh Stadium, Jaipur"
      }
    ];

    for (const match of upcomingMatches) {
      this.createMatch({
        ...match,
        status: "upcoming",
        homeTeamScore: "",
        awayTeamScore: "",
        result: ""
      });
    }

    // Create markets for the live match
    const matchWinnerMarket = this.createMarket({
      matchId: liveMatch.id,
      name: "Match Winner",
      type: "match_winner",
      isActive: true
    });

    const runTotalsMarket = this.createMarket({
      matchId: liveMatch.id,
      name: "Run Totals",
      type: "run_totals",
      isActive: true
    });

    // Create some orders for match winner market
    const cskOrders = [
      { price: 1.95, amount: 50000, type: "buy" },
      { price: 1.90, amount: 25000, type: "buy" },
      { price: 1.85, amount: 15000, type: "buy" },
      { price: 1.80, amount: 8000, type: "buy" }
    ];

    const miOrders = [
      { price: 2.00, amount: 35000, type: "sell" },
      { price: 2.05, amount: 10000, type: "sell" },
      { price: 2.10, amount: 25000, type: "sell" },
      { price: 2.15, amount: 14500, type: "sell" }
    ];

    // Add the orders
    for (const order of cskOrders) {
      this.createOrder({
        userId: 1, // Placeholder user
        marketId: matchWinnerMarket.id,
        selectionName: "CSK to win",
        price: order.price.toString(),
        amount: order.amount.toString(),
        type: order.type,
        status: "open",
        txHash: `0x${Math.random().toString(16).substring(2, 14)}`
      });
    }

    for (const order of miOrders) {
      this.createOrder({
        userId: 1, // Placeholder user
        marketId: matchWinnerMarket.id,
        selectionName: "MI to win",
        price: order.price.toString(),
        amount: order.amount.toString(),
        type: order.type,
        status: "open",
        txHash: `0x${Math.random().toString(16).substring(2, 14)}`
      });
    }
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async getUserByWalletAddress(walletAddress: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.walletAddress === walletAddress
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const now = new Date();
    const user: User = { ...insertUser, id, createdAt: now, balance: "0" };
    this.users.set(id, user);
    return user;
  }

  async updateUserBalance(id: number, amount: number): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const newBalance = parseFloat(user.balance) + amount;
    user.balance = newBalance.toString();
    this.users.set(id, user);
    return user;
  }

  // Team operations
  async getTeam(id: number): Promise<Team | undefined> {
    return this.teams.get(id);
  }

  async getTeams(): Promise<Team[]> {
    return Array.from(this.teams.values());
  }

  async createTeam(insertTeam: InsertTeam): Promise<Team> {
    const id = this.teamId++;
    const team: Team = { ...insertTeam, id };
    this.teams.set(id, team);
    return team;
  }

  // Match operations
  async getMatch(id: number): Promise<Match | undefined> {
    return this.matches.get(id);
  }

  async getMatches(): Promise<Match[]> {
    return Array.from(this.matches.values());
  }

  async getUpcomingMatches(): Promise<Match[]> {
    return Array.from(this.matches.values()).filter(
      (match) => match.status === "upcoming"
    );
  }

  async getLiveMatches(): Promise<Match[]> {
    return Array.from(this.matches.values()).filter(
      (match) => match.status === "live"
    );
  }

  async getCompletedMatches(): Promise<Match[]> {
    return Array.from(this.matches.values()).filter(
      (match) => match.status === "completed"
    );
  }

  async createMatch(insertMatch: InsertMatch): Promise<Match> {
    const id = this.matchId++;
    const match: Match = { ...insertMatch, id };
    this.matches.set(id, match);
    return match;
  }

  async updateMatchStatus(
    id: number, 
    status: string, 
    homeTeamScore?: string, 
    awayTeamScore?: string
  ): Promise<Match | undefined> {
    const match = this.matches.get(id);
    if (!match) return undefined;
    
    match.status = status as any;
    if (homeTeamScore) match.homeTeamScore = homeTeamScore;
    if (awayTeamScore) match.awayTeamScore = awayTeamScore;
    
    this.matches.set(id, match);
    return match;
  }

  // Market operations
  async getMarket(id: number): Promise<Market | undefined> {
    return this.markets.get(id);
  }

  async getMarketsByMatchId(matchId: number): Promise<Market[]> {
    return Array.from(this.markets.values()).filter(
      (market) => market.matchId === matchId
    );
  }

  async createMarket(insertMarket: InsertMarket): Promise<Market> {
    const id = this.marketId++;
    const market: Market = { ...insertMarket, id };
    this.markets.set(id, market);
    return market;
  }

  async updateMarketStatus(id: number, isActive: boolean): Promise<Market | undefined> {
    const market = this.markets.get(id);
    if (!market) return undefined;
    
    market.isActive = isActive;
    this.markets.set(id, market);
    return market;
  }

  // Order operations
  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async getOrdersByUserId(userId: number): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(
      (order) => order.userId === userId
    );
  }

  async getOrdersByMarketId(marketId: number): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(
      (order) => order.marketId === marketId
    );
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = this.orderId++;
    const now = new Date();
    const order: Order = { 
      ...insertOrder, 
      id, 
      createdAt: now, 
      updatedAt: now 
    };
    this.orders.set(id, order);
    return order;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    order.status = status as any;
    order.updatedAt = new Date();
    this.orders.set(id, order);
    return order;
  }

  // Bet operations
  async getBet(id: number): Promise<Bet | undefined> {
    return this.bets.get(id);
  }

  async getBetsByUserId(userId: number): Promise<Bet[]> {
    return Array.from(this.bets.values()).filter(
      (bet) => bet.userId === userId
    );
  }

  async createBet(insertBet: InsertBet): Promise<Bet> {
    const id = this.betId++;
    const now = new Date();
    const bet: Bet = { ...insertBet, id, createdAt: now, settledAt: null };
    this.bets.set(id, bet);
    return bet;
  }

  async updateBetOutcome(id: number, outcome: string): Promise<Bet | undefined> {
    const bet = this.bets.get(id);
    if (!bet) return undefined;
    
    bet.outcome = outcome as any;
    if (outcome !== "pending") {
      bet.settledAt = new Date();
    }
    this.bets.set(id, bet);
    return bet;
  }

  // Transaction operations
  async getTransaction(id: number): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }

  async getTransactionsByUserId(userId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(
      (tx) => tx.userId === userId
    );
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = this.transactionId++;
    const now = new Date();
    const transaction: Transaction = { ...insertTransaction, id, createdAt: now };
    this.transactions.set(id, transaction);
    return transaction;
  }
}

export const storage = new MemStorage();
