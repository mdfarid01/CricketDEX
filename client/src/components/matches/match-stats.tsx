import { Match } from "@/types";

interface MatchStatsProps {
  match: Match;
}

export function MatchStats({ match }: MatchStatsProps) {
  const getRunRate = (score?: string) => {
    if (!score) return "0.00";
    const runsPart = score.split("/")[0];
    const oversPart = score.match(/\(([^)]+)\)/)?.[1];
    
    if (!runsPart || !oversPart) return "0.00";
    
    const runs = parseInt(runsPart);
    const overs = parseFloat(oversPart.split(" ")[0]);
    
    if (isNaN(runs) || isNaN(overs) || overs === 0) return "0.00";
    
    return (runs / overs).toFixed(2);
  };
  
  const getWickets = (score?: string) => {
    if (!score) return "0/10";
    const wicketsPart = score.split("/")[1];
    if (!wicketsPart) return "0/10";
    return `${wicketsPart.split(" ")[0]}/10`;
  };
  
  const getRunsScored = (score?: string) => {
    if (!score) return "0";
    const runsPart = score.split("/")[0];
    return runsPart || "0";
  };
  
  // Demo win probabilities
  const homeTeamWinProb = 45;
  const awayTeamWinProb = 55;
  
  const homeTeamRunRate = getRunRate(match.homeTeamScore);
  const awayTeamRunRate = getRunRate(match.awayTeamScore);
  
  const homeTeamRuns = getRunsScored(match.homeTeamScore);
  const awayTeamRuns = getRunsScored(match.awayTeamScore);
  
  const homeTeamWickets = getWickets(match.homeTeamScore);
  const awayTeamWickets = getWickets(match.awayTeamScore);
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="font-semibold text-lg mb-4">Match Statistics</h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-medium mb-3">{match.homeTeam?.name}</h3>
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Runs</span>
              <span className="font-mono">{homeTeamRuns}</span>
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full" 
                style={{ width: `${Math.min((parseInt(homeTeamRuns) / 200) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Wickets</span>
              <span className="font-mono">{homeTeamWickets}</span>
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-2">
              <div 
                className="bg-warning h-2 rounded-full" 
                style={{ width: `${parseInt(homeTeamWickets) * 10}%` }}
              ></div>
            </div>
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Run Rate</span>
              <span className="font-mono">{homeTeamRunRate}</span>
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-2">
              <div 
                className="bg-accent h-2 rounded-full" 
                style={{ width: `${Math.min((parseFloat(homeTeamRunRate) / 12) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Win Probability</span>
              <span className="font-mono">{homeTeamWinProb}%</span>
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full" 
                style={{ width: `${homeTeamWinProb}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="font-medium mb-3">{match.awayTeam?.name}</h3>
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Runs</span>
              <span className="font-mono">{awayTeamRuns}</span>
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full" 
                style={{ width: `${Math.min((parseInt(awayTeamRuns) / 200) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Wickets</span>
              <span className="font-mono">{awayTeamWickets}</span>
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-2">
              <div 
                className="bg-warning h-2 rounded-full" 
                style={{ width: `${parseInt(awayTeamWickets) * 10}%` }}
              ></div>
            </div>
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Run Rate</span>
              <span className="font-mono">{awayTeamRunRate}</span>
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-2">
              <div 
                className="bg-accent h-2 rounded-full" 
                style={{ width: `${Math.min((parseFloat(awayTeamRunRate) / 12) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Win Probability</span>
              <span className="font-mono">{awayTeamWinProb}%</span>
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full" 
                style={{ width: `${awayTeamWinProb}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
