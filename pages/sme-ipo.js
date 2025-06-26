// ================================
// File: pages/sme-ipo.js
// Description: Next.js page for SME IPO Bids.
// ================================
import React from 'react';
import IPOBidPage from '../components/subbroker/IPOBidPage';
import MainLayout from '../components/MainContent';

const SmeIpoPage = () => {
  return (
    <MainLayout>
      <IPOBidPage type="sme" />
    </MainLayout>
  );
};

export default SmeIpoPage;