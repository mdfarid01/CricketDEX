import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow, format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: string | number, currency = "₹", decimals = 2): string {
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  return `${currency}${numAmount.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

export function calculatePotentialReturn(amount: string, price: string): string {
  const numAmount = parseFloat(amount);
  const numPrice = parseFloat(price);
  return (numAmount * numPrice).toFixed(2);
}

export function calculatePotentialProfit(amount: string, price: string): string {
  const numAmount = parseFloat(amount);
  const numPrice = parseFloat(price);
  return ((numAmount * numPrice) - numAmount).toFixed(2);
}

export function formatTimeToMatch(date: string | Date): string {
  const matchDate = typeof date === "string" ? new Date(date) : date;
  return formatDistanceToNow(matchDate, { addSuffix: true });
}

export function formatMatchTime(date: string | Date): string {
  const matchDate = typeof date === "string" ? new Date(date) : date;
  return format(matchDate, "MMM d, HH:mm");
}

export function truncateAddress(address: string, startChars = 6, endChars = 4): string {
  if (!address) return "";
  if (address.length <= startChars + endChars) return address;
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

export function getOrderbookDepthPercentage(amount: string, maxAmount: string): number {
  const numAmount = parseFloat(amount);
  const numMaxAmount = parseFloat(maxAmount);
  return Math.min(Math.round((numAmount / numMaxAmount) * 100), 100);
}

export function getMaxOrderAmount(orders: { amount: string }[]): string {
  if (!orders.length) return "0";
  return Math.max(...orders.map(order => parseFloat(order.amount))).toString();
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'live':
      return 'bg-accent text-white';
    case 'upcoming':
      return 'bg-primary text-white';
    case 'completed':
      return 'bg-secondary text-white';
    case 'cancelled':
      return 'bg-warning text-white';
    default:
      return 'bg-muted text-muted-foreground';
  }
}

export function getTransactionStatusColor(status: string): string {
  switch (status) {
    case 'confirmed':
      return 'text-accent';
    case 'pending':
      return 'text-primary';
    case 'failed':
      return 'text-warning';
    default:
      return 'text-muted-foreground';
  }
}

export function getTransactionTypeIcon(type: string): string {
  switch (type) {
    case 'deposit':
      return 'arrow-down';
    case 'withdrawal':
      return 'arrow-up';
    case 'bet':
      return 'ticket';
    case 'win':
      return 'trophy';
    default:
      return 'circle';
  }
}

export function getTypeColor(type: 'buy' | 'sell'): string {
  return type === 'buy' ? 'text-accent' : 'text-warning';
}

export function getOutcomeColor(outcome: 'pending' | 'won' | 'lost'): string {
  switch (outcome) {
    case 'won':
      return 'text-accent';
    case 'lost':
      return 'text-warning';
    default:
      return 'text-muted-foreground';
  }
}
