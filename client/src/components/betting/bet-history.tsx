import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bet } from "@/types";
import { getOutcomeColor, formatCurrency, formatMatchTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface BetHistoryProps {
  userId: number;
}

export function BetHistory({ userId }: BetHistoryProps) {
  const { data: bets, isLoading } = useQuery({
    queryKey: [`/api/users/${userId}/bets`],
    enabled: !!userId
  });
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Bet History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-6 bg-muted rounded"></div>
            <div className="h-6 bg-muted rounded"></div>
            <div className="h-6 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!bets || bets.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Bet History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No betting history yet.</p>
        </CardContent>
      </Card>
    );
  }
  
  // Sort bets by creation date, most recent first
  const sortedBets = [...bets].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  // Take only the most recent 3 bets
  const recentBets = sortedBets.slice(0, 3);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Bet History</CardTitle>
      </CardHeader>
      <CardContent>
        {recentBets.map((bet: Bet) => (
          <div className="border-b border-neutral-200 py-3" key={bet.id}>
            <div className="flex justify-between">
              <div>
                <div className="font-medium">{bet.order?.selectionName}</div>
                <div className="text-sm text-muted-foreground">
                  {bet.match?.homeTeam?.shortName} vs {bet.match?.awayTeam?.shortName} • {formatMatchTime(bet.createdAt)}
                </div>
              </div>
              <div className={cn(
                "font-medium",
                bet.outcome === "won" ? "text-accent" : 
                bet.outcome === "lost" ? "text-warning" : 
                "text-muted-foreground"
              )}>
                {bet.outcome === "won" && "+"}
                {formatCurrency(bet.potentialReturn)}
              </div>
            </div>
          </div>
        ))}
        
        <a href="#" className="text-primary text-sm font-medium mt-4 inline-block hover:underline">
          View full history
        </a>
      </CardContent>
    </Card>
  );
}
