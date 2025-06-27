// ================================
// File: components/MainContent.js
// Description: Main content area, handles routing based on user role and current page.
//              This replaces the AppProvider/App structure from the previous React setup.
// ================================
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router'; // Next.js router
import Login from './auth/Login_apo';
import Sidebar from './layout/Sidebar';
import Header from './layout/Header';

// Import all your page components
import AdminDashboard from './admin/AdminDashboard';
import BidMaster from './admin/BidMaster';
import BrokerManagement from './admin/BrokerManagement';
import OrderHistoryDashboard from './admin/OrderHistoryDashboard';
import UPIHandlerManagement from './admin/UPIHandlerManagement';

import SubBrokerDashboard from './subbroker/SubBrokerDashboard';
import FormDataPage from './subbroker/FormDataPage';
import IPOBidPage from './subbroker/IPOBidPage';
import ASBAFormPrinting from './subbroker/ASBAFormPrinting';
import UPIBidsDashboard from './subbroker/UPIBidsDashboard';
import BidDetailsReport from './subbroker/BidDetailsReport';


const MainContent = () => {
  const router = useRouter(); // Initialize Next.js router
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null); // 'admin' or 'subbroker'
  // Next.js automatically handles page changes via file-system routing.
  // We can derive the current "page" from the router's pathname.
  const [currentPage, setCurrentPage] = useState('/'); // Default route

  // Simulate persistent login and user role fetching
  useEffect(() => {
    // In a real Next.js app, this would involve checking for a session cookie
    // or token. For this simplified example, we'll use local storage.
    const storedRole = localStorage.getItem('userRole');
    if (storedRole) {
      setIsAuthenticated(true);
      setUserRole(storedRole);
      // Redirect to appropriate dashboard after "login"
      if (router.pathname === '/') { // Only redirect if on the home page
         router.push(storedRole === 'admin' ? '/admin/dashboard' : '/dashboard');
      }
    }
  }, [router]); // Depend on router to ensure it's ready

  const handleLoginSuccess = (role) => {
    setIsAuthenticated(true);
    setUserRole(role);
    localStorage.setItem('userRole', role); // Simulate session persistence
    // Redirect to the appropriate dashboard based on role
    router.push(role === 'admin' ? '/admin/dashboard' : '/dashboard');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    localStorage.removeItem('userRole'); // Clear simulated session
    router.push('/'); // Go back to login/home page
  };

  // Effect to update currentPage when router path changes
  useEffect(() => {
    setCurrentPage(router.pathname);
  }, [router.pathname]);


  const renderPageContent = () => {
    if (!isAuthenticated) {
      return <Login onLoginSuccess={handleLoginSuccess} />;
    }

    // Determine which page component to render based on the current path
    // For simplicity, we're mapping paths to components directly.
    // In a larger app, you might have a more complex routing system or layout components.
    if (userRole === 'admin') {
      switch (currentPage) {
        case '/admin/dashboard': return <AdminDashboard />;
        case '/admin/master-form': return <FormDataPage userRole="admin" />;
        case '/admin/bid-master': return <BidMaster />;
        case '/admin/order-history': return <OrderHistoryDashboard />;
        case '/admin/broker-management': return <BrokerManagement />;
        case '/admin/upi-handler-management': return <UPIHandlerManagement />;
        case '/admin/upi-bids': return <UPIBidsDashboard userRole="admin" />;
        case '/admin/asba-bids': return <ASBAFormPrinting />; // Admin can also access this for form generation/printing
        default: return <AdminDashboard />; // Fallback
      }
    } else if (userRole === 'subbroker') {
      switch (currentPage) {
        case '/dashboard': return <SubBrokerDashboard />;
        case '/form-data': return <FormDataPage userRole="subbroker" />;
        case '/mainboard-ipo': return <IPOBidPage type="mainboard" />;
        case '/sme-ipo': return <IPOBidPage type="sme" />;
        case '/asba-form-printing': return <ASBAFormPrinting />;
        case '/upi-bids': return <UPIBidsDashboard userRole="subbroker" />;
        case '/bid-details-report': return <BidDetailsReport userRole="subbroker" />;
        default: return <SubBrokerDashboard />; // Fallback
      }
    }

    return <Login onLoginSuccess={handleLoginSuccess} />;
  };


  return (
    <div className="flex min-h-screen bg-gray-100">
      {isAuthenticated && userRole && (
        <Sidebar userRole={userRole} onNavigate={(path) => router.push(path)} onLogout={handleLogout} userId={userRole === 'admin' ? 'admin_demo_uid' : 'subbroker_demo_uid'} />
      )}
      <main className="flex-grow flex flex-col">
        {isAuthenticated && userRole && (
          <Header title={userRole === 'admin' ? 'Admin Panel' : 'Sub-Broker Panel'} />
        )}
        <div className="flex-grow p-6">
          {renderPageContent()}
        </div>
      </main>
    </div>
  );
};

export default MainContent;