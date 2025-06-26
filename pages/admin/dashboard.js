// ================================
// File: pages/admin/dashboard.js
// Description: Next.js page for the Admin Dashboard.
// ================================
import React from 'react';
import AdminDashboard from '../../components/admin/AdminDashboard';
import MainLayout from '../../components/MainContent';

const AdminDashboardPage = () => {
  return (
    <MainLayout>
      <AdminDashboard />
    </MainLayout>
  );
};

export default AdminDashboardPage;