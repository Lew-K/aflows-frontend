import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { AnalyticsPage } from '@/components/dashboard/AnalyticsPage';
import { SalesPage } from '@/components/dashboard/SalesPage';
import { OperationsPage } from '@/components/dashboard/OperationsPage'; 
import { UploadsPage } from '@/components/dashboard/UploadsPage';
import { CustomersPage } from '@/components/dashboard/CustomersPage';
import { InventoryPage } from '@/components/dashboard/InventoryPage';

import AdminLogin from "../components/internal-admin/AdminLogin"
import AdminDashboard from "../components/internal-admin/AdminDashboard"
import Businesses from "../components/internal-admin/Businesses"

import { DashboardContactPage } from '@/components/dashboard/DashboardContactPage';

const Dashboard = () => {
  return (
    <DashboardLayout>
      <Routes>
        <Route index element={<AnalyticsPage />} />
        <Route path="sales" element={<SalesPage />} />
        <Route path="operations" element={<OperationsPage />} />
        <Route path="uploads" element={<UploadsPage />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="inventory" element={<InventoryPage />} />
        <Route path="contact" element={<DashboardContactPage />} />

        
      </Routes>
    </DashboardLayout>
  );
};

export default Dashboard;
