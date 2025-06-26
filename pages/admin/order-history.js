// ================================
// File: pages/admin/order-history.js
// Description: Next.js page for Order History Dashboard (Admin).
// ================================
import React from 'react';
import OrderHistoryDashboard from '../../components/admin/OrderHistoryDashboard';
import MainLayout from '../../components/MainContent';

const AdminOrderHistoryPage = () => {
  return (
    <MainLayout>
      <OrderHistoryDashboard />
    </MainLayout>
  );
};

export default AdminOrderHistoryPage;