// ================================
// File: pages/bid-details-report.js
// Description: Next.js page for Bid Details Report.
// ================================
import React from 'react';
import BidDetailsReport from '../components/subbroker/BidDetailsReport';
import MainLayout from '../components/MainContent';

const BidDetailsReportPage = () => {
  return (
    <MainLayout>
      <BidDetailsReport userRole="subbroker" /> {/* Or dynamically pass from auth context */}
    </MainLayout>
  );
};

export default BidDetailsReportPage;