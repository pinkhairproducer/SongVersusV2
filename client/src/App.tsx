import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Battles from "@/pages/Battles";
import BattleDetail from "@/pages/BattleDetail";
import Artists from "@/pages/Artists";
import Producers from "@/pages/Producers";
import Store from "@/pages/Store";
import Leaderboard from "@/pages/Leaderboard";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/battles" component={Battles} />
      <Route path="/battle/:id" component={BattleDetail} />
      <Route path="/artists" component={Artists} />
      <Route path="/producers" component={Producers} />
      <Route path="/store" component={Store} />
      <Route path="/leaderboard" component={Leaderboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
