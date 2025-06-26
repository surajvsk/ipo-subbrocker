// ================================
// File: pages/admin/master-form.js
// Description: Next.js page for Admin Master Form (Client Management for Admin).
// ================================
import React from 'react';
import FormDataPage from '../../components/subbroker/FormDataPage'; // Reusing FormDataPage
import MainLayout from '../../components/MainContent';

const AdminMasterFormPage = () => {
  return (
    <MainLayout>
      <FormDataPage userRole="admin" />
    </MainLayout>
  );
};

export default AdminMasterFormPage;