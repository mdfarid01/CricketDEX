import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { WalletProvider } from "@/context/wallet-context";
import Home from "@/pages/home";
import MatchPage from "@/pages/match";
import CricketMatches from "@/pages/cricket-matches";
import CricketMatchDetails from "@/pages/cricket-match-details";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/match/:id" component={MatchPage} />
      <Route path="/cricket-matches" component={CricketMatches} />
      <Route path="/cricket-match/:id" component={CricketMatchDetails} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WalletProvider>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow bg-background">
              <Router />
            </main>
            <Footer />
          </div>
          <Toaster />
        </WalletProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
