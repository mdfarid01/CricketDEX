import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatTimeToMatch } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface CricketTeam {
  name: string;
  shortname: string;
}

interface CricketScore {
  r: number; // runs
  w: number; // wickets
  o: number; // overs
  inning: string;
}

interface CricketMatch {
  id: string;
  name: string;
  status: string;
  venue: string;
  date: string;
  dateTimeGMT: string;
  teams: string[];
  teamInfo: CricketTeam[];
  score: CricketScore[];
  series_id: string;
  matchStarted: boolean;
  matchEnded: boolean;
}

export default function CricketMatches() {
  const [activeTab, setActiveTab] = useState('live');

  const { data: liveMatches, isLoading: liveLoading } = useQuery<CricketMatch[]>({
    queryKey: ['/api/cricket/matches', 'live'],
    queryFn: async () => {
      const response = await fetch('/api/cricket/matches?status=live');
      if (!response.ok) throw new Error('Failed to fetch live matches');
      return response.json();
    },
  });

  const { data: upcomingMatches, isLoading: upcomingLoading } = useQuery<CricketMatch[]>({
    queryKey: ['/api/cricket/matches', 'upcoming'],
    queryFn: async () => {
      const response = await fetch('/api/cricket/matches?status=upcoming');
      if (!response.ok) throw new Error('Failed to fetch upcoming matches');
      return response.json();
    },
  });

  const { data: completedMatches, isLoading: completedLoading } = useQuery<CricketMatch[]>({
    queryKey: ['/api/cricket/matches', 'completed'],
    queryFn: async () => {
      const response = await fetch('/api/cricket/matches?status=completed');
      if (!response.ok) throw new Error('Failed to fetch completed matches');
      return response.json();
    },
  });

  // Display cricket match card
  const CricketMatchCard = ({ match }: { match: CricketMatch }) => {
    const teamAInfo = match.teamInfo?.[0] || { name: match.teams?.[0] || 'Team A', shortname: 'TMA' };
    const teamBInfo = match.teamInfo?.[1] || { name: match.teams?.[1] || 'Team B', shortname: 'TMB' };
    
    // Find scores for each team
    const teamAScore = match.score?.find(s => s.inning.includes(teamAInfo.name));
    const teamBScore = match.score?.find(s => s.inning.includes(teamBInfo.name));

    return (
      <Card className="w-full mb-4 overflow-hidden hover:shadow-md transition-shadow">
        <CardHeader className="bg-primary/5 pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-base font-medium">{match.name}</CardTitle>
            <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded">
              {match.matchStarted && !match.matchEnded ? 'LIVE' : 
               !match.matchStarted ? 'UPCOMING' : 'COMPLETED'}
            </span>
          </div>
          <CardDescription className="text-xs">{match.venue}</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center text-lg font-bold">
                {teamAInfo.shortname}
              </div>
              <div>
                <div className="font-medium">{teamAInfo.name}</div>
                {teamAScore && (
                  <div className="text-sm text-muted-foreground">
                    {teamAScore.r}/{teamAScore.w} ({teamAScore.o} ov)
                  </div>
                )}
              </div>
            </div>
            
            <div className="text-sm font-semibold px-2 py-1 rounded bg-primary/5">
              vs
            </div>
            
            <div className="flex items-center space-x-2">
              <div>
                <div className="font-medium text-right">{teamBInfo.name}</div>
                {teamBScore && (
                  <div className="text-sm text-muted-foreground text-right">
                    {teamBScore.r}/{teamBScore.w} ({teamBScore.o} ov)
                  </div>
                )}
              </div>
              <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center text-lg font-bold">
                {teamBInfo.shortname}
              </div>
            </div>
          </div>
          
          <div className="mt-2 text-sm text-center font-medium text-primary">
            {match.status}
          </div>
        </CardContent>
        <CardFooter className="bg-muted/20 flex justify-between pt-2 pb-2">
          <div className="text-xs text-muted-foreground">
            {formatTimeToMatch(match.dateTimeGMT)}
          </div>
          <div>
            <Button variant="outline" size="sm" asChild>
              <Link to={`/cricket-match/${match.id}`}>View Details</Link>
            </Button>
          </div>
        </CardFooter>
      </Card>
    );
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Cricket Matches</h1>
      </div>
      
      <Tabs defaultValue="live" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="live">Live Matches</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        
        <TabsContent value="live" className="mt-4">
          {liveLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : liveMatches && liveMatches.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {liveMatches.map((match) => (
                <CricketMatchCard key={match.id} match={match} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No live matches at the moment.
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="upcoming" className="mt-4">
          {upcomingLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : upcomingMatches && upcomingMatches.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcomingMatches.map((match) => (
                <CricketMatchCard key={match.id} match={match} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No upcoming matches scheduled.
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="completed" className="mt-4">
          {completedLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : completedMatches && completedMatches.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {completedMatches.map((match) => (
                <CricketMatchCard key={match.id} match={match} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No completed matches found.
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
