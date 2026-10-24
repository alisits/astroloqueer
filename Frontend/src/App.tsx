import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import React, { Suspense, lazy } from "react";

const Index = lazy(() => import("./pages/Index"));
const Reading = lazy(() => import("./pages/Reading"));
const NatalChartPage = lazy(() => import("./pages/NatalChart"));
const PrivacyPolicy = lazy(() => import("./pages/privacy"));

import LogoHeader from "./components/LogoHeader";
import { AstrologyProvider } from "@/context/AstrologyContext";
import ErrorBoundary from "./components/ErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AstrologyProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <LogoHeader />
            <Suspense fallback={<div className="p-8 text-white">Loading...</div>}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route 
                  path="/reading" 
                  element={
                    <ProtectedRoute 
                      requiredData="horoscope"
                      fallbackMessage="You need to generate your horoscope first. Please fill out your birth details and get your reading."
                    >
                      <Reading />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/natal-chart" 
                  element={
                    <ProtectedRoute 
                      requiredData="natal-chart"
                      fallbackMessage="You need to fill out your birth details first to generate your natal chart."
                    >
                      <NatalChartPage />
                    </ProtectedRoute>
                  } 
                />
                <Route path="/privacy" element={<PrivacyPolicy />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </AstrologyProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
