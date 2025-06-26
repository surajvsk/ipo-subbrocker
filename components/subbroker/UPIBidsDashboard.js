// ================================
// File: components/subbroker/UPIBidsDashboard.js
// Description: Displays UPI bids, with search, sort, rebid, and edit functionalities.
//              Data fetching updated to use Next.js API routes.
// ================================
import React, { useState, useEffect } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';
import Select from '../common/Select';

const UPIBidsDashboard = ({ userRole }) => {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState('exchangeDateTime');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterBrokerCode, setFilterBrokerCode] = useState('');
  const [brokers, setBrokers] = useState([]);
  const [selectedIpo, setSelectedIpo] = useState('');
  const [ipos, setIpos] = useState([]);

  // Fetch brokers for admin filter and IPOs for filter
  useEffect(() => {
    const fetchDataForFilters = async () => {
      try {
        if (userRole === 'admin') {
          const brokersRes = await fetch('/api/brokers');
          if (!brokersRes.ok) throw new Error('Failed to fetch brokers');
          const brokersData = await brokersRes.json();
          setBrokers(brokersData.map(b => ({ label: b.username, value: b.brokerCode })));
        }

        const iposRes = await fetch('/api/ipos');
        if (!iposRes.ok) throw new Error('Failed to fetch IPOs');
        const iposData = await iposRes.json();
        setIpos(iposData.map(ipo => ({ label: ipo.name, value: ipo.id })));

      } catch (err) {
        console.error("Error fetching filter data:", err);
        setError("Failed to load filter options.");
      }
    };
    fetchDataForFilters();
  }, [userRole]);


  useEffect(() => {
    const fetchBids = async () => {
      setLoading(true);
      setError('');
      try {
        let url = '/api/bids'; // Your API route for bids
        const queryParams = [];

        if (userRole === 'subbroker') {
          queryParams.push('brokerCode=BRK001'); // Assume BRK001 for demo
        } else if (userRole === 'admin' && filterBrokerCode) {
          queryParams.push(`brokerCode=${filterBrokerCode}`);
        }

        if (selectedIpo) {
          queryParams.push(`ipoId=${selectedIpo}`);
        }

        if (queryParams.length > 0) {
          url += `?${queryParams.join('&')}`;
        }

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setBids(data);
      } catch (err) {
        console.error("Error fetching UPI bids:", err);
        setError("Failed to load UPI bid data.");
      } finally {
        setLoading(false);
      }
    };

    fetchBids();
  }, [filterBrokerCode, selectedIpo, userRole]);

  const filteredBids = bids.filter(bid =>
    Object.values(bid).some(value =>
      String(value).toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const sortedBids = [...filteredBids].sort((a, b) => {
    const aValue = String(a[sortKey] || '').toLowerCase();
    const bValue = String(b[sortKey] || '').toLowerCase();

    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const handleRebid = async (bid) => {
    if (confirm(`Are you sure you want to rebid for application ${bid.applicationNumber}? This will remove the current bid.`)) {
      try {
        const response = await fetch(`/api/bids/${bid._id}`, {
          method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to rebid (delete) the bid.');
        alert('Bid removed for rebid. Please navigate to the IPO bid page to place a new one.');
        // Re-fetch bids after deletion
        fetchBids();
      } catch (e) {
        console.error("Error rebidding:", e);
        alert('Failed to remove bid for rebid.');
      }
    }
  };

  const handleEditBid = (bid) => {
    alert(`Editing bid for Application Number: ${bid.applicationNumber}\n\nActual edit functionality for bid amount/quantity and ASBA form will open a modal for modification.`);
  };

  return (
    <div className="p-6 bg-gray-50 rounded-lg shadow-inner">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">UPI Bids Dashboard</h2>

      <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0 md:space-x-4">
        <Input
          type="text"
          placeholder="Search bids..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="md:flex-1"
        />
        {userRole === 'admin' && (
          <Select
            value={filterBrokerCode}
            onChange={(e) => setFilterBrokerCode(e.target.value)}
            options={[{ value: '', label: 'All Brokers' }, ...brokers]}
            className="md:w-1/4"
          />
        )}
        <Select
          value={selectedIpo}
          onChange={(e) => setSelectedIpo(e.target.value)}
          options={[{ value: '', label: 'All IPOs' }, ...ipos]}
          className="md:w-1/4"
        />
        <Button onClick={() => alert('Export to Excel functionality is simulated.')} className="bg-purple-600 hover:bg-purple-700 w-full md:w-auto whitespace-nowrap">
          <i className="fas fa-file-excel mr-2"></i> Export to Excel
        </Button>
      </div>

      {error && <p className="text-red-600 text-center mb-4">{error}</p>}
      {loading ? (
        <div className="text-center text-gray-600">Loading UPI bids...</div>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow-md border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                {['Application Number', 'UPI ID', 'Client Code', 'PAN Number', 'Quantity', 'Amount Bid', 'Exchange Code', 'Exchange Status', 'Activity Type', 'DP Status', 'Exchange Date/Time', 'Sponsor Bank Status', userRole === 'admin' ? 'Broker Code' : ''].filter(Boolean).map(header => (
                  <th
                    key={header}
                    onClick={() => handleSort(header.toLowerCase().replace(/ |\//g, ''))}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none"
                  >
                    {header}
                    {sortKey === header.toLowerCase().replace(/ |\//g, '') && (
                      <span>{sortOrder === 'asc' ? ' ▲' : ' ▼'}</span>
                    )}
                  </th>
                ))}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedBids.map((bid) => (
                <tr key={bid._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{bid.applicationNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{bid.upiId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{bid.clientCode}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{bid.panCard}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{bid.quantity}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className="font-semibold text-yellow-700">₹{bid.amount?.toLocaleString('en-IN')}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{bid.exchangeCode}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{bid.exchangeStatus}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{bid.activityType}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{bid.dpStatus}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(bid.exchangeDateTime).toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{bid.sponsorBankStatus}</td>
                  {userRole === 'admin' && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{bid.brokerCode || 'N/A'}</td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleRebid(bid)}
                      className="text-orange-600 hover:text-orange-900 mr-3"
                      title="Rebid"
                    >
                      <i className="fas fa-redo"></i>
                    </button>
                    <button
                      onClick={() => handleEditBid(bid)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Edit Bid"
                    >
                      <i className="fas fa-pencil-alt"></i>
                    </button>
                  </td>
                </tr>
              ))}
              {sortedBids.length === 0 && (
                <tr>
                  <td colSpan={userRole === 'admin' ? 14 : 13} className="px-6 py-4 text-center text-gray-500">
                    No UPI bids found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UPIBidsDashboard;