export interface Team {
  id: number;
  name: string;
  shortName: string;
  logoUrl?: string;
}

export interface Match {
  id: number;
  homeTeamId: number;
  awayTeamId: number;
  startTime: string;
  status: 'upcoming' | 'live' | 'completed' | 'cancelled';
  homeTeamScore?: string;
  awayTeamScore?: string;
  venue?: string;
  result?: string;
  homeTeam?: Team;
  awayTeam?: Team;
}

export interface Market {
  id: number;
  matchId: number;
  name: string;
  type: 'match_winner' | 'run_totals' | 'player_props';
  isActive: boolean;
}

export type OrderType = 'buy' | 'sell';
export type OrderStatus = 'open' | 'matched' | 'cancelled' | 'settled';

export interface Order {
  id: number;
  userId: number;
  marketId: number;
  type: OrderType;
  price: string;
  amount: string;
  selectionName: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  txHash?: string;
}

export type BetOutcome = 'pending' | 'won' | 'lost';

export interface Bet {
  id: number;
  userId: number;
  orderId: number;
  outcome: BetOutcome;
  potentialReturn: string;
  settledAt?: string;
  createdAt: string;
  order?: Order;
  market?: Market;
  match?: Match;
}

export interface Transaction {
  id: number;
  userId: number;
  txHash: string;
  amount: string;
  type: string;
  status: string;
  createdAt: string;
}

export interface User {
  id: number;
  username: string;
  walletAddress?: string;
  balance: string;
}

export interface NewOrder {
  userId: number;
  marketId: number;
  type: OrderType;
  price: string;
  amount: string;
  selectionName: string;
}

export interface OrderbookEntry {
  selection: string;
  bids: Order[];
  asks: Order[];
}

export interface BetSlipItem {
  marketId: number;
  matchId: number;
  selectionName: string;
  price: string;
  type: OrderType;
  amount: string;
  potentialReturn: string;
  potentialProfit: string;
}

export interface WalletInfo {
  connected: boolean;
  address?: string;
  balance?: string;
  network?: string;
}
