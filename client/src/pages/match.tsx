import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { MatchHeader } from "@/components/matches/match-header";
import { Orderbook } from "@/components/orderbook/orderbook";
import { RecentTransactions } from "@/components/transactions/recent-transactions";
import { MatchStats } from "@/components/matches/match-stats";
import { BetHistory } from "@/components/betting/bet-history";
import { BlockchainInfo } from "@/components/blockchain/blockchain-info";
import { useWallet } from "@/hooks/use-wallet";

export default function MatchPage() {
  const [, params] = useRoute<{ id: string }>("/match/:id");
  const matchId = parseInt(params?.id || "0");
  const { isConnected, userId } = useWallet();
  
  const { data: match, isLoading } = useQuery({
    queryKey: [`/api/matches/${matchId}`],
    enabled: !!matchId
  });
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="animate-pulse space-y-4">
          <div className="h-40 bg-muted rounded"></div>
          <div className="h-80 bg-muted rounded"></div>
          <div className="h-60 bg-muted rounded"></div>
        </div>
      </div>
    );
  }
  
  if (!match) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h1 className="text-2xl font-bold mb-4">Match not found</h1>
          <p className="text-muted-foreground">The match you are looking for does not exist.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Sidebar */}
        <div className="lg:w-1/4 w-full order-3 lg:order-1">
          {isConnected && userId && (
            <div className="lg:sticky lg:top-4">
              <BetHistory userId={userId} />
            </div>
          )}
        </div>
        
        {/* Main Content */}
        <div className="lg:w-2/4 w-full order-1 lg:order-2">
          <MatchHeader match={match} />
          <Orderbook matchId={matchId} />
          <RecentTransactions marketId={1} />
          <MatchStats match={match} />
        </div>
        
        {/* Right Sidebar */}
        <div className="lg:w-1/4 w-full order-2 lg:order-3">
          {isConnected && userId && (
            <div className="lg:sticky lg:top-4">
              <BlockchainInfo userId={userId} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
