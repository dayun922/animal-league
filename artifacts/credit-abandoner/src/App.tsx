import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import { GameProvider } from "./contexts/GameContext";
import Home from "./pages/Home";
import GameSelect from "./pages/GameSelect";
import Game1 from "./pages/Game1";
import Game2 from "./pages/Game2";
import Game3 from "./pages/Game3";
import Game4 from "./pages/Game4";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/select" component={GameSelect} />
      <Route path="/game1" component={Game1} />
      <Route path="/game2" component={Game2} />
      <Route path="/game3" component={Game3} />
      <Route path="/game4" component={Game4} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <GameProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </GameProvider>
    </QueryClientProvider>
  );
}

export default App;
