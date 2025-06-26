// ================================
// File: pages/mainboard-ipo.js
// Description: Next.js page for Mainboard IPO Bids.
// ================================
import React from 'react';
import IPOBidPage from '../components/subbroker/IPOBidPage';
import MainLayout from '../components/MainContent';

const MainboardIpoPage = () => {
  return (
    <MainLayout>
      <IPOBidPage type="mainboard" />
    </MainLayout>
  );
};

export default MainboardIpoPage;