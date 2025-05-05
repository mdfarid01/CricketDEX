import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, Clock, MapPin, Calendar, Star } from 'lucide-react';

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

interface CricketMatchInfo {
  id: string;
  name: string;
  status: string;
  venue: string;
  date: string;
  dateTimeGMT: string;
  teams: string[];
  teamInfo: CricketTeam[];
  score: CricketScore[];
  tossWinner: string;
  tossChoice: string;
  matchType: string;
  matchWinner: string;
  series_id: string;
  matchStarted: boolean;
  matchEnded: boolean;
}

interface BattingStats {
  batsman: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  dismissal: string;
}

interface BowlingStats {
  bowler: string;
  overs: number;
  runs: number;
  wickets: number;
  economy: number;
}

interface InningScorecard {
  inning: string;
  battingStats: BattingStats[];
  bowlingStats: BowlingStats[];
}

interface CricketScorecard {
  id: string;
  name: string;
  status: string;
  venue: string;
  date: string;
  dateTimeGMT: string;
  teams: string[];
  teamInfo: CricketTeam[];
  score: CricketScore[];
  scorecard: InningScorecard[];
  matchStarted: boolean;
  matchEnded: boolean;
}

export default function CricketMatchDetails() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState('overview');

  const { data: matchInfo, isLoading: infoLoading } = useQuery<CricketMatchInfo>({
    queryKey: ['/api/cricket/matches', id],
    queryFn: async () => {
      const response = await fetch(`/api/cricket/matches/${id}`);
      if (!response.ok) throw new Error('Failed to fetch match details');
      return response.json();
    },
  });

  const { data: scorecard, isLoading: scorecardLoading } = useQuery<CricketScorecard>({
    queryKey: ['/api/cricket/matches', id, 'scorecard'],
    queryFn: async () => {
      const response = await fetch(`/api/cricket/matches/${id}/scorecard`);
      if (!response.ok) throw new Error('Failed to fetch scorecard');
      return response.json();
    },
    enabled: activeTab === 'scorecard',
  });

  if (infoLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!matchInfo) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h2 className="text-xl font-semibold mb-4">Match not found</h2>
        <Button asChild>
          <Link href="/cricket-matches">Back to Matches</Link>
        </Button>
      </div>
    );
  }

  const teamAInfo = matchInfo.teamInfo?.[0] || { name: matchInfo.teams?.[0] || 'Team A', shortname: 'TMA' };
  const teamBInfo = matchInfo.teamInfo?.[1] || { name: matchInfo.teams?.[1] || 'Team B', shortname: 'TMB' };
  
  // Find scores for each team
  const teamAScore = matchInfo.score?.find(s => s.inning.includes(teamAInfo.name));
  const teamBScore = matchInfo.score?.find(s => s.inning.includes(teamBInfo.name));

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6 space-x-2">
        <Button variant="outline" size="sm" asChild>
          <Link href="/cricket-matches">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Matches
          </Link>
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader className="bg-primary/5">
          <div className="flex justify-between items-center">
            <CardTitle>{matchInfo.name}</CardTitle>
            <Badge variant={matchInfo.matchStarted && !matchInfo.matchEnded ? 'default' : 
                  !matchInfo.matchStarted ? 'outline' : 'secondary'}>
              {matchInfo.matchStarted && !matchInfo.matchEnded ? 'LIVE' : 
               !matchInfo.matchStarted ? 'UPCOMING' : 'COMPLETED'}
            </Badge>
          </div>
          <CardDescription className="flex flex-col space-y-1 mt-2">
            <div className="flex items-center text-sm">
              <MapPin className="h-4 w-4 mr-1" />
              {matchInfo.venue}
            </div>
            <div className="flex items-center text-sm">
              <Calendar className="h-4 w-4 mr-1" />
              {new Date(matchInfo.dateTimeGMT).toLocaleDateString(undefined, { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
            <div className="flex items-center text-sm">
              <Clock className="h-4 w-4 mr-1" />
              {new Date(matchInfo.dateTimeGMT).toLocaleTimeString(undefined, {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-4">
          <div className="grid grid-cols-5 items-center py-4">
            <div className="col-span-2 flex flex-col items-center">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center text-2xl font-bold mb-2">
                {teamAInfo.shortname}
              </div>
              <div className="text-center">
                <div className="font-semibold text-lg">{teamAInfo.name}</div>
                {teamAScore && (
                  <div className="text-lg font-bold">
                    {teamAScore.r}/{teamAScore.w}
                    <span className="text-sm font-normal text-muted-foreground ml-1">
                      ({teamAScore.o} ov)
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="col-span-1 flex flex-col items-center">
              <div className="text-lg font-semibold mb-2">vs</div>
              <div className="text-xs px-3 py-1 rounded-full bg-primary/5 text-center">
                {matchInfo.matchType}
              </div>
            </div>
            
            <div className="col-span-2 flex flex-col items-center">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center text-2xl font-bold mb-2">
                {teamBInfo.shortname}
              </div>
              <div className="text-center">
                <div className="font-semibold text-lg">{teamBInfo.name}</div>
                {teamBScore && (
                  <div className="text-lg font-bold">
                    {teamBScore.r}/{teamBScore.w}
                    <span className="text-sm font-normal text-muted-foreground ml-1">
                      ({teamBScore.o} ov)
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <div className="bg-muted/20 p-3 rounded-md text-center font-medium">
            {matchInfo.status}
          </div>
          
          {matchInfo.tossWinner && (
            <div className="mt-4 text-sm">
              <span className="font-medium">Toss:</span> {matchInfo.tossWinner} won the toss and elected to {matchInfo.tossChoice}
            </div>
          )}
          
          {matchInfo.matchWinner && (
            <div className="mt-2 text-sm">
              <span className="font-medium">Result:</span> {matchInfo.matchWinner} won the match
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Match Overview</TabsTrigger>
          <TabsTrigger value="scorecard">Scorecard</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Match Information</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Series</TableCell>
                    <TableCell>IPL 2025</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Match Type</TableCell>
                    <TableCell>{matchInfo.matchType || 'T20'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Venue</TableCell>
                    <TableCell>{matchInfo.venue}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Status</TableCell>
                    <TableCell>{matchInfo.status}</TableCell>
                  </TableRow>
                  {matchInfo.tossWinner && (
                    <TableRow>
                      <TableCell className="font-medium">Toss</TableCell>
                      <TableCell>{matchInfo.tossWinner} won and chose to {matchInfo.tossChoice}</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="scorecard" className="mt-4">
          {scorecardLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : scorecard && scorecard.scorecard && scorecard.scorecard.length > 0 ? (
            <div className="space-y-6">
              {scorecard.scorecard.map((inning, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle>{inning.inning}</CardTitle>
                    {scorecard.score.find(s => s.inning === inning.inning) && (
                      <CardDescription className="text-base font-medium">
                        {scorecard.score.find(s => s.inning === inning.inning)?.r || 0}/
                        {scorecard.score.find(s => s.inning === inning.inning)?.w || 0} 
                        ({scorecard.score.find(s => s.inning === inning.inning)?.o || 0} overs)
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <h3 className="font-semibold mb-2">Batting</h3>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Batsman</TableHead>
                              <TableHead className="w-[80px]">Runs</TableHead>
                              <TableHead className="w-[80px]">Balls</TableHead>
                              <TableHead className="w-[50px]">4s</TableHead>
                              <TableHead className="w-[50px]">6s</TableHead>
                              <TableHead className="w-[80px]">SR</TableHead>
                              <TableHead>Dismissal</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {inning.battingStats && inning.battingStats.map((stat, i) => (
                              <TableRow key={i}>
                                <TableCell className="font-medium">{stat.batsman}</TableCell>
                                <TableCell>{stat.runs}</TableCell>
                                <TableCell>{stat.balls}</TableCell>
                                <TableCell>{stat.fours}</TableCell>
                                <TableCell>{stat.sixes}</TableCell>
                                <TableCell>
                                  {stat.balls > 0 ? ((stat.runs / stat.balls) * 100).toFixed(2) : '0.00'}
                                </TableCell>
                                <TableCell>{stat.dismissal}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold mb-2">Bowling</h3>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Bowler</TableHead>
                              <TableHead className="w-[80px]">Overs</TableHead>
                              <TableHead className="w-[80px]">Maidens</TableHead>
                              <TableHead className="w-[80px]">Runs</TableHead>
                              <TableHead className="w-[80px]">Wickets</TableHead>
                              <TableHead className="w-[80px]">Economy</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {inning.bowlingStats && inning.bowlingStats.map((stat, i) => (
                              <TableRow key={i}>
                                <TableCell className="font-medium">{stat.bowler}</TableCell>
                                <TableCell>{stat.overs}</TableCell>
                                <TableCell>0</TableCell> {/* Maidens data might not be available */}
                                <TableCell>{stat.runs}</TableCell>
                                <TableCell>{stat.wickets}</TableCell>
                                <TableCell>{stat.economy}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Scorecard not available for this match.
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
