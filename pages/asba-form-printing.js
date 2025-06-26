// ================================
// File: pages/asba-form-printing.js
// Description: Next.js page for ASBA Form Printing.
// ================================
import React from 'react';
import ASBAFormPrinting from '../components/subbroker/ASBAFormPrinting';
import MainLayout from '../components/MainContent';

const AsbaFormPrintingPage = () => {
  return (
    <MainLayout>
      <ASBAFormPrinting />
    </MainLayout>
  );
};

export default AsbaFormPrintingPage;