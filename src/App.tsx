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
import { DataProvider } from "@/contexts/DataContext";
import { initAuthGuard } from "@/lib/authGuard";
import { initializePaystack } from "@/lib/paystack";

import Login from "./pages/Login";
import Register from "./pages/Register";
import About from "./pages/About";
import FAQ from "./pages/FAQ";
import Contact from "./pages/Contact";
import HowItWorks from "./pages/HowItWorks";
import VerifyEmail from "./pages/VerifyEmail";
import ChangePassword from "./pages/ChangePassword";
import ResetPassword from "./pages/ChangePassword";
import RequestPasswordReset from "./pages/RequestPasswordReset";

import { PricingPage } from "./pages/PricingPage";
import { PaymentVerifyPage } from "./pages/PaymentVerifyPage";



import AdminLogin from "@/components/internal-admin/AdminLogin";
import AdminDashboard from "@/components/internal-admin/AdminDashboard";
import Businesses from "@/components/internal-admin/Businesses";
import Activity from "@/components/internal-admin/Activity";
import ContactsPage from "../components/internal-admin/ContactsPage";

import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();


const App = () => {
  useEffect(() => {
  initAuthGuard();

  initializePaystack().catch((err) => {
    console.warn(
      'Paystack preload failed (will retry on payment):',
      err
    );
  });
}, []);
  
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <NotificationProvider>
          <AuthProvider>
            <DataProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />

              <BrowserRouter>
                <Routes>

                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/verify-email" element={<VerifyEmail />} />
                  <Route path="/reset-password" element={<ChangePassword />} />
                  <Route path="/change-password" element={<ChangePassword />} />
                  <Route path="/request-password-reset" element={<RequestPasswordReset />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/pricing" element={<PricingPage />} />
                  <Route path="/payment/verify" element={<PaymentVerifyPage />} />
                  <Route path="/faq" element={<FAQ />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/how-it-works" element={<HowItWorks />} />
                  

                  <Route element={<ProtectedRoute />}>
                    <Route path="/dashboard/*" element={<Dashboard />} />

                    
                    
                  </Route>

                  {/* INTERNAL ADMIN ROUTES */}

                  <Route path="/internal-admin/login" element={<AdminLogin />} />
                  <Route path="/internal-admin" element={<AdminDashboard />} />
                  <Route path="/internal-admin/businesses" element={<Businesses />} />
                  <Route path="/internal-admin/activity" element={<Activity />} />
                  <Route path="/internal-admin/contacts" element={<ContactsPage />} />

                  <Route path="*" element={<NotFound />} />

                </Routes>
              </BrowserRouter>

            </TooltipProvider>
          </DataProvider>
          </AuthProvider>
        </NotificationProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
