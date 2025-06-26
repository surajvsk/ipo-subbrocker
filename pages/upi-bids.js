// ================================
// File: pages/upi-bids.js
// Description: Next.js page for UPI Bids Dashboard.
// ================================
import React from 'react';
import UPIBidsDashboard from '../components/subbroker/UPIBidsDashboard';
import MainLayout from '../components/MainContent';

const UpiBidsPage = () => {
  return (
    <MainLayout>
      <UPIBidsDashboard userRole="subbroker" /> {/* Or dynamically pass from auth context */}
    </MainLayout>
  );
};

export default UpiBidsPage;