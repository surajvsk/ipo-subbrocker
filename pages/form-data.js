// ================================
// File: pages/form-data.js
// Description: Next.js page for the Form Data (Client Management).
// ================================
import React from 'react';
import FormDataPage from '../components/subbroker/FormDataPage';
import MainLayout from '../components/MainContent';

const FormDataNextPage = () => {
  // Pass a simulated userRole to FormDataPage for rendering purposes in this context.
  // In a full application, this would come from an authentication context.
  return (
    <MainLayout>
      <FormDataPage userRole="subbroker" /> {/* Or dynamically pass from auth context */}
    </MainLayout>
  );
};

export default FormDataNextPage;