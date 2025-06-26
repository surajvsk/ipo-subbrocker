// ================================
// File: pages/admin/upi-handler-management.js
// Description: Next.js page for UPI Handler Management (Admin).
// ================================
import React from 'react';
import UPIHandlerManagement from '../../components/admin/UPIHandlerManagement';
import MainLayout from '../../components/MainContent';

const AdminUpiHandlerManagementPage = () => {
  return (
    <MainLayout>
      <UPIHandlerManagement />
    </MainLayout>
  );
};

export default AdminUpiHandlerManagementPage;