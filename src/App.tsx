import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import PlayerSetup from "./pages/PlayerSetup";
import RoomLobby from "./pages/RoomLobby";
import GameScreen from "./pages/GameScreen";
import FinalResults from "./pages/FinalResults";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/setup" element={<PlayerSetup />} />
          <Route path="/lobby/:code" element={<RoomLobby />} />
          <Route path="/game/:code" element={<GameScreen />} />
          <Route path="/results/:code" element={<FinalResults />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
