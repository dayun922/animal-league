import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { Suspense, lazy } from "react";

import { GameProvider } from "./contexts/GameContext";
import { PlayerProvider } from "./contexts/PlayerContext";
import { DB_FEATURES_ENABLED } from "./contexts/PlayerContext";

// 즉시 로드 (초기 화면)
import Home from "./pages/Home";
import GameSelect from "./pages/GameSelect";

// 지연 로드 (게임 진입 후 필요)
const Game1 = lazy(() => import("./pages/Game1"));
const Game2 = lazy(() => import("./pages/Game2"));
const Game3 = lazy(() => import("./pages/Game3"));
const Game4 = lazy(() => import("./pages/Game4"));

// DB 기능 활성화 시에만 사용
const Entry      = lazy(() => import("./pages/Entry"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));

const queryClient = new QueryClient();

const Loader = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100dvh', background: '#0f172a' }}>
    <div style={{ color: '#f97316', fontSize: 32 }}>🎮</div>
  </div>
);

function GuardedRouter() {
  return (
    <Suspense fallback={<Loader />}>
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
    </Suspense>
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
