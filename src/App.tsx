import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AccessibilityProvider } from "@/contexts/AccessibilityContext";
import Index from "./pages/Index";
import { Auth } from "./pages/Auth";
import { Profile } from "./pages/Profile";
import { Discover } from "./pages/Discover";
import { Settings } from "./pages/Settings";
import { Support } from "./pages/Support";
import { Marketing } from "./pages/Marketing";
import { PrivacyPolicyPage } from "./pages/PrivacyPolicyPage";
import { TermsOfServicePage } from "./pages/TermsOfServicePage";
import { LicenseAgreement } from "./pages/LicenseAgreement";
import { CookiePolicy } from "./pages/CookiePolicy";
import { DataUsagePolicy } from "./pages/DataUsagePolicy";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AccessibilityProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/discover" element={<Discover />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/support" element={<Support />} />
            <Route path="/marketing" element={<Marketing />} />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            <Route path="/terms" element={<TermsOfServicePage />} />
            <Route path="/license" element={<LicenseAgreement />} />
            <Route path="/cookies" element={<CookiePolicy />} />
            <Route path="/data-usage" element={<DataUsagePolicy />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AccessibilityProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
