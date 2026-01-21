import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { AnalyticsPage } from '@/components/dashboard/AnalyticsPage';
import { SalesPage } from '@/components/dashboard/SalesPage';
import { ReceiptsPage } from '@/components/dashboard/ReceiptsPage';
import { UploadsPage } from '@/components/dashboard/UploadsPage';
import { DashboardContactPage } from '@/components/dashboard/DashboardContactPage';

const Dashboard = () => {
  return (
    <DashboardLayout>
      <Routes>
        <Route index element={<AnalyticsPage />} />
        <Route path="sales" element={<SalesPage />} />
        <Route path="receipts" element={<ReceiptsPage />} />
        <Route path="uploads" element={<UploadsPage />} />
        <Route path="contact" element={<DashboardContactPage />} />
      </Routes>
    </DashboardLayout>
  );
};

export default Dashboard;
