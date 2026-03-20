import React from "react";
import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store/store";
import { HelmetProvider } from "react-helmet-async";
import Index from "./pages/Index";
import SubscriptionWizard from "./pages/SubscriptionWizard";
import SubscriptionSuccess from "./pages/SubscriptionSuccess";
import NotFound from "./pages/NotFound";
import TermsAndConditions from "./pages/TermsAndConditions";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import HelpCenter from "./pages/HelpCenter";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route
                path="/subscription-wizard"
                element={<SubscriptionWizard />}
              />
              <Route
                path="/subscription/success"
                element={<SubscriptionSuccess />}
              />
              <Route path="/terms" element={<TermsAndConditions />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/ayuda" element={<HelpCenter />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </Provider>
  </HelmetProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
