// ================================
// File: components/admin/AdminDashboard.js
// Description: Admin Dashboard with overall statistics.
//              Data fetching updated to use Next.js API routes.
// ================================
import React, { useState, useEffect } from 'react';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    totalIPOs: 0,
    activeIPOs: 0,
    totalApplications: 0,
    totalClients: 0,
    totalBrokers: 0,
    acceptedSponsorBank: 0,
    acceptedInvestmentBank: 0,
    pendingSponsorBank: 0,
    rejectedUPI: 0,
    rejectedInvestor: 0,
    rejectedInvestorBank: 0,
    rejectedSponsorBank: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const iposRes = await fetch('/api/ipos');
        if (!iposRes.ok) throw new Error('Failed to fetch IPOs.');
        const iposData = await iposRes.json();
        const activeIposCount = iposData.filter(ipo => ipo.status === 'Active').length;

        const clientsRes = await fetch('/api/clients');
        if (!clientsRes.ok) throw new Error('Failed to fetch clients.');
        const clientsData = await clientsRes.json();

        const bidsRes = await fetch('/api/bids');
        if (!bidsRes.ok) throw new Error('Failed to fetch bids.');
        const allBids = await bidsRes.json();

        const brokersRes = await fetch('/api/brokers');
        if (!brokersRes.ok) throw new Error('Failed to fetch brokers.');
        const brokersData = await brokersRes.json();


        let acceptedSponsorBank = 0;
        let acceptedInvestmentBank = 0;
        let pendingSponsorBank = 0;
        let rejectedUPI = 0;
        let rejectedInvestor = 0;
        let rejectedInvestorBank = 0;
        let rejectedSponsorBank = 0;

        allBids.forEach(bid => {
          if (bid.sponsorBankStatus === 'Accepted') acceptedSponsorBank++;
          if (bid.exchangeStatus === 'Accepted') acceptedInvestmentBank++;
          if (bid.sponsorBankStatus === 'Pending') pendingSponsorBank++;
          if (bid.exchangeStatus === 'Rejected by UPI') rejectedUPI++;
          if (bid.exchangeStatus === 'Rejected by Investor') rejectedInvestor++;
          if (bid.exchangeStatus === 'Rejected by Investor Bank') rejectedInvestorBank++;
          if (bid.exchangeStatus === 'Rejected by Sponsor Bank') rejectedSponsorBank++;
        });

        setDashboardData({
          totalIPOs: iposData.length,
          activeIPOs: activeIposCount,
          totalApplications: allBids.length,
          totalClients: clientsData.length,
          totalBrokers: brokersData.length,
          acceptedSponsorBank,
          acceptedInvestmentBank,
          pendingSponsorBank,
          rejectedUPI,
          rejectedInvestor,
          rejectedInvestorBank,
          rejectedSponsorBank,
        });
      } catch (fetchError) {
        console.error("Error fetching admin dashboard data:", fetchError);
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <div className="p-6 text-gray-600">Loading Dashboard...</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;

  return (
    <div className="p-6 bg-gray-50 rounded-lg shadow-inner">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Admin Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(dashboardData).map(([key, value]) => (
          <div key={key} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <p className="text-sm font-medium text-gray-500 uppercase">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
            <p className="mt-1 text-4xl font-bold text-blue-600">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;


