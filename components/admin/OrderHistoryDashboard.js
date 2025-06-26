// ================================
// File: components/admin/OrderHistoryDashboard.js
// Description: Displays a historical view of all mainboard and SME IPO orders.
//              Data fetching updated to use Next.js API routes.
// ================================
import React, { useState, useEffect } from 'react';
import Button from '../common/Button';

const OrderHistoryDashboard = () => {
  const [mainboardBids, setMainboardBids] = useState([]);
  const [smeBids, setSmeBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('mainboard');

  useEffect(() => {
    const fetchOrderHistory = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch('/api/bids'); // Fetch all bids
        if (!response.ok) throw new Error('Failed to fetch order history.');
        const fetchedBids = await response.json();

        // Assuming IPO type can be inferred from ipoId or ipoName for categorization
        const mbBids = fetchedBids.filter(bid => bid.ipoId === 'IPO001' || bid.ipoName?.includes('Tech Innovations Ltd.')); // Example
        const smBids = fetchedBids.filter(bid => bid.ipoId === 'IPO002' || bid.ipoName?.includes('Green Energy Solutions')); // Example

        setMainboardBids(mbBids);
        setSmeBids(smBids);
      } catch (fetchError) {
        console.error("Error fetching order history:", fetchError);
        setError("Failed to load order history.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderHistory();
  }, []);

  const currentBids = activeTab === 'mainboard' ? mainboardBids : smeBids;

  if (loading) return <div className="p-6 text-gray-600">Loading Order History...</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;

  return (
    <div className="p-6 bg-gray-50 rounded-lg shadow-inner">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Order History Dashboard</h2>

      <div className="mb-6 flex space-x-4">
        <Button
          onClick={() => setActiveTab('mainboard')}
          className={`flex-1 ${activeTab === 'mainboard' ? 'bg-blue-600' : 'bg-gray-300 hover:bg-gray-400 text-gray-800'}`}
        >
          Mainboard IPOs
        </Button>
        <Button
          onClick={() => setActiveTab('sme')}
          className={`flex-1 ${activeTab === 'sme' ? 'bg-blue-600' : 'bg-gray-300 hover:bg-gray-400 text-gray-800'}`}
        >
          SME IPOs
        </Button>
      </div>

      {currentBids.length === 0 ? (
        <p className="px-6 py-4 text-center text-gray-500">
          No order history found for {activeTab} IPOs.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow-md border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                {['IPO Bid Name', 'Application Number', 'Client Name', 'DP ID', 'Exchange Code', 'Client Code', 'Broker Code', 'Created On'].map(header => (
                  <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentBids.map((bid) => (
                <tr key={bid._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{bid.ipoName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{bid.applicationNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{bid.clientName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{bid.dpId || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{bid.exchangeCode}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{bid.clientCode}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{bid.brokerCode}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(bid.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OrderHistoryDashboard;