// ================================
// File: pages/admin/broker-management.js
// Description: Next.js page for Broker Management (Admin).
// ================================
import React from 'react';
import BrokerManagement from '../../components/admin/BrokerManagement';
import MainLayout from '../../components/MainContent';

const AdminBrokerManagementPage = () => {
  return (
    <MainLayout>
      <BrokerManagement />
    </MainLayout>
  );
};

export default AdminBrokerManagementPage;