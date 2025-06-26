// ================================
// File: pages/admin/asba-bids.js
// Description: Next.js page for Admin ASBA Bids (reusing component).
// ================================
import React from 'react';
import ASBAFormPrinting from '../../components/subbroker/ASBAFormPrinting'; // Reusing the component
import MainLayout from '../../components/MainContent';

const AdminAsbaBidsPage = () => {
  return (
    <MainLayout>
      <ASBAFormPrinting />
    </MainLayout>
  );
};

export default AdminAsbaBidsPage;