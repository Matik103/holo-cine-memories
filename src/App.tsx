import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MobileAppInit } from "@/components/MobileAppInit";
import Index from "./pages/Index";
import { Auth } from "./pages/Auth";
import { Profile } from "./pages/Profile";
import { AdminAnalytics } from "./pages/AdminAnalytics";
import { Discover } from "./pages/Discover";
import { Settings } from "./pages/Settings";
import { Privacy } from "./pages/Privacy";
import { Terms } from "./pages/Terms";
import { License } from "./pages/License";
import { Cookies } from "./pages/Cookies";
import { DataUsage } from "./pages/DataUsage";
import { Help } from "./pages/Help";
import { About } from "./pages/About";
import NotFound from "./pages/NotFound";
import { MovieDetail } from "./components/MovieDetail";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <MobileAppInit />
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin" element={<AdminAnalytics />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/license" element={<License />} />
          <Route path="/cookies" element={<Cookies />} />
          <Route path="/data-usage" element={<DataUsage />} />
          <Route path="/help" element={<Help />} />
          <Route path="/about" element={<About />} />
          <Route path="/movie/:movieTitle" element={<MovieDetail />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
