import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { initAuthGuard } from "@/lib/authGuard";

import AdminLogin from "@/components/internal-admin/AdminLogin";
import AdminDashboard from "@/components/internal-admin/AdminDashboard";
import Businesses from "@/components/internal-admin/Businesses";
import Activity from "@/components/internal-admin/Activity";

import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();


const App = () => {

  useEffect(() => {
    initAuthGuard();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <NotificationProvider>
          <AuthProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />

              <BrowserRouter>
                <Routes>

                  <Route path="/" element={<Index />} />

                  <Route element={<ProtectedRoute />}>
                    <Route path="/dashboard/*" element={<Dashboard />} />
                    
                  </Route>

                  {/* INTERNAL ADMIN ROUTES */}

                  <Route path="/internal-admin/login" element={<AdminLogin />} />
                  <Route path="/internal-admin" element={<AdminDashboard />} />
                  <Route path="/internal-admin/businesses" element={<Businesses />} />
                  <Route path="/internal-admin/activity" element={<Activity />} />

                  <Route path="*" element={<NotFound />} />

                </Routes>
              </BrowserRouter>

            </TooltipProvider>
          </AuthProvider>
        </NotificationProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
