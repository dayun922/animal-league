import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import { GameProvider } from "./contexts/GameContext";
import { PlayerProvider } from "./contexts/PlayerContext";
import { DB_FEATURES_ENABLED } from "./contexts/PlayerContext";
import Home from "./pages/Home";
import Entry from "./pages/Entry";
import GameSelect from "./pages/GameSelect";
import Game1 from "./pages/Game1";
import Game2 from "./pages/Game2";
import Game3 from "./pages/Game3";
import Game4 from "./pages/Game4";
import Leaderboard from "./pages/Leaderboard";

const queryClient = new QueryClient();

function GuardedRouter() {
  return (
    <Switch>
      {/* DB 기능 활성화 시에만 Entry/Leaderboard 노출 */}
      {DB_FEATURES_ENABLED ? (
        <>
          <Route path="/entry" component={Entry} />
          <Route path="/leaderboard" component={Leaderboard} />
        </>
      ) : (
        <>
          <Route path="/entry">{() => <Redirect to="/" />}</Route>
          <Route path="/leaderboard">{() => <Redirect to="/" />}</Route>
        </>
      )}

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
      <PlayerProvider>
        <GameProvider>
          <TooltipProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <GuardedRouter />
            </WouterRouter>
            <Toaster />
          </TooltipProvider>
        </GameProvider>
      </PlayerProvider>
    </QueryClientProvider>
  );
}

export default App;
