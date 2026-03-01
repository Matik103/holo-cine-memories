import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import MobileAppInit from "@/components/MobileAppInit";
import { AdMobBanner } from "@/components/AdMobBanner";
import { LanguageAutoDetect } from "@/components/LanguageAutoDetect";
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
import { Advertising } from "./pages/Advertising";
import { AdSenseReview } from "./pages/AdSenseReview";
import NotFound from "./pages/NotFound";
import { MovieDetail } from "./components/MovieDetail";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <a 
      href="#main-content" 
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:p-4 focus:bg-primary focus:text-primary-foreground focus:rounded-lg"
    >
      Skip to main content
    </a>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <MobileAppInit />
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <main id="main-content">
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
          <Route path="/advertising" element={<Advertising />} />
          <Route path="/review" element={<AdSenseReview />} />
          <Route path="/movie/:movieTitle" element={<MovieDetail />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        <AdMobBanner position="bottom" autoShow={true} />
          <LanguageAutoDetect />
        </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
