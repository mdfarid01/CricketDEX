import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatMatchTime, getStatusColor } from "@/lib/utils";
import { Link } from "wouter";
import { Match } from "@/types";

interface MatchCardProps {
  match: Match;
}

export function MatchCard({ match }: MatchCardProps) {
  const formattedTime = formatMatchTime(match.startTime);
  const isTrending = Math.random() > 0.7; // Just for demo purposes
  
  return (
    <Link href={`/match/${match.id}`}>
      <Card className="cursor-pointer hover:border-primary transition-colors">
        <CardContent className="py-3">
          <div className="flex justify-between items-center">
            <div>
              <div className="font-medium">
                {match.homeTeam?.shortName} vs {match.awayTeam?.shortName}
              </div>
              <div className="text-sm text-muted-foreground">{formattedTime}</div>
            </div>
            {match.status === "live" && (
              <Badge variant="live">LIVE</Badge>
            )}
            {isTrending && match.status === "upcoming" && (
              <Badge variant="accent">Trending</Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
