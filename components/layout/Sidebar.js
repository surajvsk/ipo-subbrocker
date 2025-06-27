// ================================
// File: components/layout/Sidebar.js
// Description: Reusable Sidebar navigation component.
//              In a real app, this would use Context for userRole/logout and Link from 'next/link'.
// ================================
import React from 'react';
import Link from 'next/link'; // For client-side navigation in Next.js
import Button from '../common/Button'; // Assuming relative path

const Sidebar = ({ userRole, onNavigate, onLogout, userId }) => {
  const subbrokerNav = [
    { name: 'Dashboard', page: '/dashboard' }, // Adjusted to Next.js page paths
    { name: 'Form Data', page: '/form-data' },
    { name: 'Mainboard IPOs', page: '/mainboard-ipo' },
    { name: 'SME IPOs', page: '/sme-ipo' },
    { name: 'ASBA Form Printing', page: '/asba-form-printing' },
    { name: 'UPI Bids', page: '/upi-bids' },
    { name: 'Bid Details Report', page: '/bid-details-report' },
  ];

  const adminNav = [
    { name: 'Dashboard', page: '/admin/dashboard' },
    { name: 'Admin Master Form', page: '/admin/master-form' },
    { name: 'Bid Master', page: '/admin/bid-master' },
    { name: 'Order History', page: '/admin/order-history' },
    { name: 'Broker Management', page: '/admin/broker-management' },
    { name: 'UPI Handler Management', page: '/admin/upi-handler-management' },
    { name: 'Admin UPI Bids', page: '/admin/upi-bids' },
    { name: 'Admin ASBA Bids', page: '/admin/asba-bids' },
  ];

  const navItems = userRole === 'admin' ? adminNav : subbrokerNav;

  return (
    <div className="w-64 bg-blue-800 text-white flex flex-col min-h-screen shadow-lg">
      <div className="p-6 text-2xl font-bold border-b border-blue-700 text-center">
        IPO Portal
      </div>
      <div className="p-4 text-sm text-gray-300 border-b border-blue-700">
        Logged in as: <span className="font-semibold capitalize">{userRole}</span>
        <br/>
        User ID: <span className="text-xs break-all">{userId}</span>
      </div>
      <nav className="flex-grow p-4 space-y-2">
        {navItems.map((item) => (
          <Link key={item.page} href={item.page} className="w-full">
            <button
              onClick={() => onNavigate(item.page)} // This would trigger client-side page change if not full refresh
              className="w-full text-left px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors duration-200"
            >
              {item.name}
            </button>
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-blue-700">
        <Button onClick={onLogout} className="w-full bg-red-600 hover:bg-red-700">Logout</Button>
      </div>
    </div>
  );
};

export default Sidebar;