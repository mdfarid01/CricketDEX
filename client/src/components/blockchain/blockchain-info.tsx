import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { truncateAddress, formatCurrency } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";

interface BlockchainInfoProps {
  userId: number;
}

export function BlockchainInfo({ userId }: BlockchainInfoProps) {
  const { data: transactions, isLoading } = useQuery({
    queryKey: [`/api/users/${userId}/transactions`],
    enabled: !!userId
  });
  
  // Get mock block info - in a real app this would come from a blockchain API
  const blockNumber = "14,258,693";
  const contractAddress = "0x7f3d...a291";
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Blockchain Verification</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-background rounded-md p-3 mb-4">
          <div className="flex items-center mb-2">
            <div className="w-2 h-2 rounded-full bg-accent mr-2"></div>
            <div className="text-sm font-medium">Last Block: #{blockNumber}</div>
          </div>
          <div className="text-xs text-muted-foreground mb-2">All bets are recorded on-chain for maximum transparency</div>
          <a href="#" className="text-xs text-primary hover:underline">View Smart Contract</a>
        </div>
        
        <div className="border border-neutral-200 rounded-md p-3">
          <h3 className="font-medium text-sm mb-2">Recent Transactions</h3>
          
          {isLoading ? (
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded"></div>
            </div>
          ) : transactions && transactions.length > 0 ? (
            transactions.slice(0, 3).map((tx) => (
              <div className="text-xs mb-2" key={tx.id}>
                <div className="flex justify-between mb-1">
                  <div className="truncate w-24">{truncateAddress(tx.txHash)}</div>
                  <div className="font-mono">
                    {parseInt(tx.amount) >= 0 ? "+" : ""}{formatCurrency(tx.amount)}
                  </div>
                </div>
                <div className="text-muted-foreground">
                  {formatDistanceToNow(new Date(tx.createdAt), { addSuffix: true })}
                </div>
              </div>
            ))
          ) : (
            <div className="text-xs text-muted-foreground">
              No blockchain transactions yet
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
