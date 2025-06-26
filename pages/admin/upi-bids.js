// ================================
// File: pages/admin/upi-bids.js
// Description: Next.js page for Admin UPI Bids Dashboard (reusing component).
// ================================
import React from 'react';
import UPIBidsDashboard from '../../components/subbroker/UPIBidsDashboard'; // Reusing the component
import MainLayout from '../../components/MainContent';

const AdminUpiBidsPage = () => {
  return (
    <MainLayout>
      <UPIBidsDashboard userRole="admin" />
    </MainLayout>
  );
};

export default AdminUpiBidsPage;