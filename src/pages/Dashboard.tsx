import React from 'react';
import { OnboardingTour } from '@/components/dashboard/modals/OnboardingTour';
import { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { AnalyticsPage } from '@/components/dashboard/AnalyticsPage';
import { SalesPage } from '@/components/dashboard/SalesPage';
import { TasksPage } from '@/components/dashboard/TasksPage'; 
import { UploadsPage } from '@/components/dashboard/UploadsPage';
import { CustomersPage } from '@/components/dashboard/CustomersPage';
import { InventoryPage } from '@/components/dashboard/InventoryPage';
import { SettingsPage } from "@/components/dashboard/SettingsPage";
import { ReportsPage } from "@/components/dashboard/ReportsPage";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";

import AdminLogin from "../components/internal-admin/AdminLogin"
import AdminDashboard from "../components/internal-admin/AdminDashboard"
import Businesses from "../components/internal-admin/Businesses"

import { DashboardContactPage } from '@/components/dashboard/DashboardContactPage';



const Dashboard = () => {

  const { user } = useAuth();
  const { prefetchAll } = useData();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (user?.mustChangePassword) {
      navigate('/change-password');
    }
  }, [user?.mustChangePassword]);

  const [showTour, setShowTour] = useState(() => {
    return !localStorage.getItem('aflows_tour_completed');
  });
  
  const handleTourClose = () => {
    localStorage.setItem('aflows_tour_completed', '1');
  setShowTour(false);
}; 
  
  useEffect(() => {
    if (user?.businessId) {
      prefetchAll(user.businessId);
    }
  }, [user?.businessId]);
    
  return (
    <DashboardLayout>
      <Routes>
        <Route index element={<AnalyticsPage />} />
        <Route path="sales" element={<SalesPage />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="uploads" element={<UploadsPage />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="inventory" element={<InventoryPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="contact" element={<DashboardContactPage />} />

        
      </Routes>
    </DashboardLayout>
  );
  {showTour && <OnboardingTour onClose={handleTourClose} />}
};

export default Dashboard;
