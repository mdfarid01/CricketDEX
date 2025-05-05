import { Badge } from "@/components/ui/badge";
import { Match } from "@/types";
import { getStatusColor } from "@/lib/utils";

interface MatchHeaderProps {
  match: Match;
}

export function MatchHeader({ match }: MatchHeaderProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">
          {match.homeTeam?.shortName} vs {match.awayTeam?.shortName}
        </h1>
        <Badge variant="live">{match.status.toUpperCase()}</Badge>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold mr-3">
            {match.homeTeam?.shortName}
          </div>
          <div>
            <div className="font-semibold">{match.homeTeam?.name}</div>
            <div className="text-sm text-muted-foreground">{match.homeTeamScore || 'TBD'}</div>
          </div>
        </div>
        
        <div className="text-center px-4">
          <div className="text-sm text-muted-foreground mb-1">Match Status</div>
          <div className="font-medium capitalize">{match.status}</div>
        </div>
        
        <div className="flex items-center">
          <div className="text-right mr-3">
            <div className="font-semibold">{match.awayTeam?.name}</div>
            <div className="text-sm text-muted-foreground">{match.awayTeamScore || 'TBD'}</div>
          </div>
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
            {match.awayTeam?.shortName}
          </div>
        </div>
      </div>
      
      {match.status === "live" && match.homeTeamScore && match.awayTeamScore && (
        <div className="mt-4 text-sm text-muted-foreground">
          {match.homeTeam?.shortName} requires 66 runs from 34 balls
        </div>
      )}
      
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-background p-3 rounded-md">
          <div className="text-xs text-muted-foreground mb-1">Match Winner</div>
          <div className="font-medium">{match.homeTeam?.shortName}: 1.85 | {match.awayTeam?.shortName}: 1.95</div>
        </div>
        <div className="bg-background p-3 rounded-md">
          <div className="text-xs text-muted-foreground mb-1">{match.homeTeam?.shortName} Score</div>
          <div className="font-medium">O/U 165.5</div>
        </div>
        <div className="bg-background p-3 rounded-md">
          <div className="text-xs text-muted-foreground mb-1">Next Wicket</div>
          <div className="font-medium">Under 10 balls: 3.4</div>
        </div>
        <div className="bg-background p-3 rounded-md">
          <div className="text-xs text-muted-foreground mb-1">Top Batsman</div>
          <div className="font-medium">Dhoni: 4.2 | Gill: 3.6</div>
        </div>
      </div>
    </div>
  );
}
