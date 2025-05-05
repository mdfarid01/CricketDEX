import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Order } from "@/types";
import { format } from "date-fns";

interface RecentTransactionsProps {
  marketId: number;
}

export function RecentTransactions({ marketId }: RecentTransactionsProps) {
  const { data: orderbookEntries, isLoading } = useQuery({
    queryKey: [`/api/markets/${marketId}/orders`],
  });
  
  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <h2 className="font-semibold text-lg mb-4">Recent Transactions</h2>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-full"></div>
          <div className="h-20 bg-muted rounded w-full"></div>
        </div>
      </div>
    );
  }
  
  // Combine all orders from different selections
  let allOrders: Order[] = [];
  if (orderbookEntries) {
    orderbookEntries.forEach(entry => {
      allOrders = [...allOrders, ...entry.bids, ...entry.asks];
    });
  }
  
  // Sort by creation date, most recent first
  allOrders.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  // Take only 5 most recent orders
  const recentOrders = allOrders.slice(0, 5);
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
      <h2 className="font-semibold text-lg mb-4">Recent Transactions</h2>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Selection</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-mono">
                  {format(new Date(order.createdAt), "HH:mm:ss")}
                </TableCell>
                <TableCell>
                  <Badge variant={order.type === "buy" ? "accent" : "warning"}>
                    {order.type === "buy" ? "BUY" : "SELL"}
                  </Badge>
                </TableCell>
                <TableCell>{order.selectionName}</TableCell>
                <TableCell className="text-right font-mono">{order.price}</TableCell>
                <TableCell className="text-right font-mono">{formatCurrency(order.amount)}</TableCell>
              </TableRow>
            ))}
            
            {recentOrders.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                  No recent transactions
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
