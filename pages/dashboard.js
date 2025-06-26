// ================================
// File: pages/dashboard.js
// Description: Next.js page for the Sub-Broker Dashboard.
// ================================
import React from 'react';
import SubBrokerDashboard from '../components/subbroker/SubBrokerDashboard';
import MainLayout from '../components/MainContent'; // Using MainContent as a layout wrapper

const DashboardPage = () => {
  return (
    // MainContent is used here to provide the common layout (sidebar, header)
    // and handle the authentication/role-based rendering of this specific component.
    // In a real app, this might be handled by _app.js or a dedicated layout component.
    <MainLayout>
      <SubBrokerDashboard />
    </MainLayout>
  );
};

export default DashboardPage;