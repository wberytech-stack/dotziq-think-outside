import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider } from "@/context/AppContext";
import SplashScreen from "./pages/SplashScreen";
import ModeSelector from "./pages/ModeSelector";
import GameScreen from "./pages/GameScreen";
import PuzzlesMenu from "./pages/PuzzlesMenu";
import DailyPuzzle from "./pages/DailyPuzzle";
import ProfileScreen from "./pages/ProfileScreen";
import LeaderboardScreen from "./pages/LeaderboardScreen";
import SettingsScreen from "./pages/SettingsScreen";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<SplashScreen />} />
            <Route path="/modes" element={<ModeSelector />} />
            <Route path="/play" element={<GameScreen />} />
            <Route path="/puzzles" element={<PuzzlesMenu />} />
            <Route path="/daily" element={<DailyPuzzle />} />
            <Route path="/profile" element={<ProfileScreen />} />
            <Route path="/leaderboard" element={<LeaderboardScreen />} />
            <Route path="/settings" element={<SettingsScreen />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
