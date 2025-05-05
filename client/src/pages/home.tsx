import { useQuery } from "@tanstack/react-query";
import { Match } from "@/types";
import { MatchCard } from "@/components/matches/match-card";
import { BetHistory } from "@/components/betting/bet-history";
import { useWallet } from "@/hooks/use-wallet";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SmartContractVerification } from "@/components/blockchain/smart-contract-verification";
import { Link } from "wouter";
import { ArrowRight, Award, BarChart3, CheckCircle, Clock, LucideBitcoin, TrendingUp, Wallet, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { formatTimeToMatch } from "@/lib/utils";

export default function Home() {
  const { isConnected, userId, connectWallet } = useWallet();
  const [isCricketApiLoaded, setIsCricketApiLoaded] = useState(false);
  
  // Regular cricket matches
  const { data: upcomingMatches = [], isLoading: upcomingLoading } = useQuery({
    queryKey: ['/api/matches?status=upcoming'],
  });
  
  const { data: liveMatches = [], isLoading: liveLoading } = useQuery({
    queryKey: ['/api/matches?status=live'],
  });

  // Cricket API matches
  const { data: cricketMatches = [], isLoading: cricketLoading } = useQuery<any[]>({
    queryKey: ['/api/cricket/matches'],
  });

  // Set cricket API loaded after a delay to simulate API loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsCricketApiLoaded(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary/90 to-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]" />
        <div className="container mx-auto px-4 py-16 sm:py-24 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
              Cricket Betting on <span className="text-white/90">Blockchain</span>
            </h1>
            <p className="text-white/80 text-lg sm:text-xl mb-8 max-w-2xl mx-auto">
              The first decentralized platform for cricket betting with transparent orderbook and instant settlements.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-primary hover:bg-white/90"
                onClick={() => !isConnected && connectWallet("metamask")}
              >
                {isConnected ? "View Live Matches" : "Connect Wallet"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
                Learn More
              </Button>
            </div>
            
            <div className="flex items-center justify-center mt-12 gap-6 flex-wrap">
              <div className="flex items-center bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
                <TrendingUp className="h-5 w-5 text-white/70 mr-2" />
                <span className="text-white/90 text-sm">24/7 Live Orderbook</span>
              </div>
              <div className="flex items-center bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
                <LucideBitcoin className="h-5 w-5 text-white/70 mr-2" />
                <span className="text-white/90 text-sm">Blockchain Verified</span>
              </div>
              <div className="flex items-center bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
                <Clock className="h-5 w-5 text-white/70 mr-2" />
                <span className="text-white/90 text-sm">Instant Settlements</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Cricket Matches */}
      <div className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Live Cricket Matches</h2>
            <p className="text-muted-foreground">Place bets on ongoing cricket matches</p>
          </div>
          <Link href="/cricket-matches">
            <Button variant="outline" className="hidden md:flex">
              View All Matches
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {cricketLoading || !isCricketApiLoaded ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-muted animate-pulse rounded-lg"></div>
            ))}
          </div>
        ) : cricketMatches && cricketMatches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cricketMatches.slice(0, 3).map((match: any, index: number) => (
              <Card key={index} className="overflow-hidden hover:shadow-md transition-shadow border border-muted">
                <div className="h-2 bg-primary w-full" />
                <CardContent className="p-6 pt-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-1">{match.teams.join(' vs ')}</h3>
                      <p className="text-muted-foreground text-sm">{match.venue}</p>
                    </div>
                    <div className="px-2 py-1 rounded text-xs font-medium bg-primary/10 text-primary">
                      LIVE
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center">
                      <div className="text-lg font-bold mb-1">{match.teamInfo[0]?.shortname || match.teams[0]}</div>
                      {match.score && match.score[0] ? (
                        <div className="text-sm">
                          {match.score[0].r}/{match.score[0].w} ({match.score[0].o} ov)
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground">Waiting to bat</div>
                      )}
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold mb-1">{match.teamInfo[1]?.shortname || match.teams[1]}</div>
                      {match.score && match.score[1] ? (
                        <div className="text-sm">
                          {match.score[1].r}/{match.score[1].w} ({match.score[1].o} ov)
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground">Waiting to bat</div>
                      )}
                    </div>
                  </div>

                  <div className="text-sm text-muted-foreground mb-4">{match.status}</div>

                  <Button className="w-full" asChild>
                    <Link href={`/cricket-match/${match.id}`}>
                      Place Bets
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-muted/10 rounded-lg border border-dashed border-muted">
            <Loader2 className="h-12 w-12 text-muted mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Live Matches</h3>
            <p className="text-muted-foreground mb-6">There are no cricket matches live at the moment.</p>
            <Button variant="outline">
              <Link href="/cricket-matches?status=upcoming">View Upcoming Matches</Link>
            </Button>
          </div>
        )}

        <div className="mt-4 text-center md:hidden">
          <Link href="/cricket-matches">
            <Button variant="outline">
              View All Matches
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How CricketDEX Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our platform combines the excitement of cricket betting with the transparency of blockchain technology.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-white border-none">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Wallet className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Connect Your Wallet</h3>
                <p className="text-muted-foreground">
                  Link your blockchain wallet securely to place bets and receive winnings directly. No middlemen, no delays.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-white border-none">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Trade on Orderbook</h3>
                <p className="text-muted-foreground">
                  Our transparent orderbook system allows you to place bets at the best available odds or set your own price.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-white border-none">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Award className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Instant Settlements</h3>
                <p className="text-muted-foreground">
                  Once the match ends, smart contracts automatically settle bets and credit winnings to your wallet.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Upcoming Matches + Your Bets/Verification */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Upcoming Matches</h2>
              <Link href="/matches">
                <Button variant="ghost" size="sm">
                  View all
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            {upcomingLoading ? (
              <div className="space-y-4">
                <div className="h-24 bg-muted animate-pulse rounded-lg"></div>
                <div className="h-24 bg-muted animate-pulse rounded-lg"></div>
                <div className="h-24 bg-muted animate-pulse rounded-lg"></div>
              </div>
            ) : upcomingMatches && upcomingMatches.length > 0 ? (
              <div className="space-y-4">
                {upcomingMatches.slice(0, 3).map((match: any) => {
                  // Check if homeTeam and awayTeam exist first
                  if (!match?.homeTeam || !match?.awayTeam) return null;
                  
                  return (
                    <Link key={match.id} href={`/match/${match.id}`}>
                      <Card className="overflow-hidden hover:border-primary transition-all cursor-pointer">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <div className="text-xs px-2 py-1 rounded-full bg-accent/10 text-accent">
                                  {formatTimeToMatch(match.startTime)}
                                </div>
                              </div>
                              <h3 className="font-medium">
                                {match.homeTeam.name} vs {match.awayTeam.name}
                              </h3>
                              <p className="text-sm text-muted-foreground mt-1">
                                {new Date(match.startTime).toLocaleString(undefined, {
                                  weekday: 'short',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                            
                            <div className="flex gap-4 text-center">
                              <div>
                                <div className="text-sm font-semibold">{match.homeTeam.shortName}</div>
                                <div className="text-lg font-mono font-bold text-accent">1.75</div>
                              </div>
                              <div>
                                <div className="text-sm font-semibold">{match.awayTeam.shortName}</div>
                                <div className="text-lg font-mono font-bold text-warning">2.10</div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">No upcoming matches</p>
                </CardContent>
              </Card>
            )}
          </div>

          <div>
            {isConnected && userId ? (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-4">Your Bets</h2>
                  <BetHistory userId={userId} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-4">Blockchain</h2>
                  <SmartContractVerification userId={userId} />
                </div>
              </div>
            ) : (
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Wallet className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Connect Your Wallet</h3>
                  <p className="text-muted-foreground mb-6">
                    Connect your blockchain wallet to place bets and track your betting history.
                  </p>
                  <Button 
                    className="w-full" 
                    onClick={() => connectWallet("metamask")}
                  >
                    Connect Wallet
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-primary/5 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose CricketDEX</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our platform offers unique advantages over traditional cricket betting sites
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg">
              <CheckCircle className="h-8 w-8 text-primary mb-4" />
              <h3 className="font-semibold mb-2">100% Transparent</h3>
              <p className="text-sm text-muted-foreground">All bets are recorded on the blockchain for complete transparency.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg">
              <CheckCircle className="h-8 w-8 text-primary mb-4" />
              <h3 className="font-semibold mb-2">Better Odds</h3>
              <p className="text-sm text-muted-foreground">Peer-to-peer betting means better odds than traditional bookmakers.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg">
              <CheckCircle className="h-8 w-8 text-primary mb-4" />
              <h3 className="font-semibold mb-2">No KYC Required</h3>
              <p className="text-sm text-muted-foreground">Connect your wallet and start betting - no personal information needed.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg">
              <CheckCircle className="h-8 w-8 text-primary mb-4" />
              <h3 className="font-semibold mb-2">Instant Withdrawals</h3>
              <p className="text-sm text-muted-foreground">Withdraw your winnings instantly to your blockchain wallet.</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-primary relative">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">Ready to Place Your First Bet?</h2>
          <p className="text-white/80 mb-8 max-w-2xl mx-auto">
            Join thousands of cricket fans who are already betting on CricketDEX. Connect your wallet and start betting in minutes.  
          </p>
          <Button 
            size="lg" 
            className="bg-white text-primary hover:bg-white/90"
            onClick={() => !isConnected && connectWallet("metamask")}
          >
            {isConnected ? "View Live Matches" : "Connect Wallet"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
