// ================================
// File: components/subbroker/BidDetailsReport.js
// Description: Provides a report on bid details for selected IPOs.
//              Data fetching updated to use Next.js API routes.
// ================================
import React, { useState, useEffect } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';
import Select from '../common/Select';

const BidDetailsReport = ({ userRole }) => {
  const [ipos, setIpos] = useState([]);
  const [selectedIpo, setSelectedIpo] = useState('');
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState('applicationNumber');
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => {
    const fetchIpos = async () => {
      try {
        const response = await fetch('/api/ipos');
        if (!response.ok) throw new Error('Failed to fetch IPOs for selection.');
        const data = await response.json();
        setIpos(data.map(ipo => ({ label: ipo.name, value: ipo.id })));
      } catch (err) {
        console.error("Error fetching IPOs:", err);
        setError("Failed to load IPOs for selection.");
      }
    };
    fetchIpos();
  }, []);

  useEffect(() => {
    const fetchBidDetails = async () => {
      if (!selectedIpo) {
        setBids([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');
      try {
        let url = `/api/bids?ipoId=${selectedIpo}`;
        if (userRole === 'subbroker') {
          url += `&brokerCode=BRK001`; // Filter by current sub-broker for demo
        }

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setBids(data);
      } catch (err) {
        console.error("Error fetching bid details:", err);
        setError("Failed to load bid details for the selected IPO.");
      } finally {
        setLoading(false);
      }
    };

    fetchBidDetails();
  }, [selectedIpo, userRole]);


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


  return (
    <div className="p-6 bg-gray-50 rounded-lg shadow-inner">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Bid Details Report</h2>

      <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0 md:space-x-4">
        <Select
          value={selectedIpo}
          onChange={(e) => setSelectedIpo(e.target.value)}
          options={[{ value: '', label: 'Select IPO' }, ...ipos]}
          className="md:w-1/3"
        />
        <Input
          type="text"
          placeholder="Search bids..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="md:flex-1"
        />
        <Button onClick={() => alert('Download Excel functionality is simulated.')} className="bg-purple-600 hover:bg-purple-700 w-full md:w-auto whitespace-nowrap">
          <i className="fas fa-download mr-2"></i> Download Excel
        </Button>
      </div>

      {error && <p className="text-red-600 text-center mb-4">{error}</p>}
      {loading ? (
        <div className="text-center text-gray-600">Loading bid details...</div>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow-md border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                {['Application Number', 'Client Name', 'PAN Card', 'Quantity', 'Bank Code', 'Exchange Code', 'Allotment'].map(header => (
                  <th
                    key={header}
                    onClick={() => handleSort(header.toLowerCase().replace(/ /g, ''))}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none"
                  >
                    {header}
                    {sortKey === header.toLowerCase().replace(/ /g, '') && (
                      <span>{sortOrder === 'asc' ? ' ▲' : ' ▼'}</span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedBids.map((bid) => (
                <tr key={bid._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{bid.applicationNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{bid.clientName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{bid.panCard}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{bid.quantity}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{bid.bankCode || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{bid.exchangeCode}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{bid.allotment || 'Pending'}</td>
                </tr>
              ))}
              {sortedBids.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    {selectedIpo ? 'No bid details found for the selected IPO.' : 'Please select an IPO to view bid details.'}
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

export default BidDetailsReport;