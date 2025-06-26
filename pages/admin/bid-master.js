// ================================
// File: pages/admin/bid-master.js
// Description: Next.js page for Bid Master (Admin).
// ================================
import React from 'react';
import BidMaster from '../../components/admin/BidMaster';
import MainLayout from '../../components/MainContent';

const AdminBidMasterPage = () => {
  return (
    <MainLayout>
      <BidMaster />
    </MainLayout>
  );
};

export default AdminBidMasterPage;