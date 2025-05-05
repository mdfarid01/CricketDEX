import { useQuery } from "@tanstack/react-query";
import { Match } from "@/types";
import { MatchCard } from "@/components/matches/match-card";
import { BetHistory } from "@/components/betting/bet-history";
import { useWallet } from "@/hooks/use-wallet";

export default function Home() {
  const { isConnected, userId } = useWallet();
  
  const { data: upcomingMatches, isLoading: upcomingLoading } = useQuery({
    queryKey: ['/api/matches?status=upcoming'],
  });
  
  const { data: liveMatches, isLoading: liveLoading } = useQuery({
    queryKey: ['/api/matches?status=live'],
  });
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Sidebar */}
        <div className="lg:w-1/4 w-full order-3 lg:order-1">
          <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
            <h2 className="font-semibold text-lg mb-4">Upcoming Matches</h2>
            
            {upcomingLoading ? (
              <div className="space-y-3">
                <div className="h-16 bg-muted animate-pulse rounded"></div>
                <div className="h-16 bg-muted animate-pulse rounded"></div>
                <div className="h-16 bg-muted animate-pulse rounded"></div>
              </div>
            ) : upcomingMatches?.length > 0 ? (
              <div className="space-y-3">
                {upcomingMatches.map((match: Match) => (
                  <MatchCard key={match.id} match={match} />
                ))}
                
                <a href="#" className="text-primary text-sm font-medium mt-4 inline-block hover:underline">
                  View all matches
                </a>
              </div>
            ) : (
              <p className="text-muted-foreground">No upcoming matches</p>
            )}
          </div>
          
          {isConnected && userId && (
            <BetHistory userId={userId} />
          )}
        </div>
        
        {/* Main Content */}
        <div className="lg:w-3/4 w-full order-1 lg:order-2">
          <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
            <h1 className="text-2xl font-bold mb-6">Welcome to CricketDEX</h1>
            
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Live Matches</h2>
              
              {liveLoading ? (
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="h-40 bg-muted animate-pulse rounded"></div>
                  <div className="h-40 bg-muted animate-pulse rounded"></div>
                </div>
              ) : liveMatches?.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {liveMatches.map((match: Match) => (
                    <div key={match.id} className="border border-neutral-200 rounded-lg p-4 hover:border-primary transition-colors">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="font-semibold">
                          {match.homeTeam?.shortName} vs {match.awayTeam?.shortName}
                        </h3>
                        <div className="bg-secondary text-white text-xs px-2 py-1 rounded">LIVE</div>
                      </div>
                      
                      <div className="flex justify-between mb-4">
                        <div>
                          <div className="font-medium">{match.homeTeam?.shortName}</div>
                          <div className="text-sm text-muted-foreground">{match.homeTeamScore || 'TBD'}</div>
                        </div>
                        <div>
                          <div className="font-medium">{match.awayTeam?.shortName}</div>
                          <div className="text-sm text-muted-foreground">{match.awayTeamScore || 'TBD'}</div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <div>{match.homeTeam?.shortName} to win: <span className="font-semibold">1.85</span></div>
                        <div>{match.awayTeam?.shortName} to win: <span className="font-semibold">1.95</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-muted/20 rounded-lg">
                  <p className="text-muted-foreground">No live matches at the moment</p>
                  <p className="text-sm mt-2">Check back later for live matches</p>
                </div>
              )}
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-4">How CricketDEX Works</h2>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="border border-neutral-200 rounded-lg p-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-3">1</div>
                  <h3 className="font-semibold mb-2">Connect Your Wallet</h3>
                  <p className="text-sm text-muted-foreground">Link your blockchain wallet to place bets and receive winnings directly.</p>
                </div>
                
                <div className="border border-neutral-200 rounded-lg p-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-3">2</div>
                  <h3 className="font-semibold mb-2">Place Bets</h3>
                  <p className="text-sm text-muted-foreground">Choose your cricket market, select odds, and place your bet on our transparent orderbook.</p>
                </div>
                
                <div className="border border-neutral-200 rounded-lg p-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-3">3</div>
                  <h3 className="font-semibold mb-2">Collect Winnings</h3>
                  <p className="text-sm text-muted-foreground">Winnings are automatically credited to your wallet after the match settlement.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
