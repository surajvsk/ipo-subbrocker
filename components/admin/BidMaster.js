// ================================
// File: components/admin/BidMaster.js
// Description: Allows administrators to manage all bids.
//              Data fetching updated to use Next.js API routes.
// ================================
import React, { useState, useEffect } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';
import Select from '../common/Select';
import Modal from '../common/Modal';
import ConfirmationDialog from '../common/ConfirmationDialog';

const BidEditModal = ({ isOpen, onClose, bidData, onSave }) => {
  const [formData, setFormData] = useState(bidData || {});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setFormData(bidData || {});
    setErrors({});
  }, [isOpen, bidData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSave = () => {
    const newErrors = {};
    if (!formData.quantity || isNaN(formData.quantity) || formData.quantity <= 0) {
      newErrors.quantity = 'Valid quantity is required.';
    }
    if (!formData.amount || isNaN(formData.amount) || formData.amount <= 0) {
      newErrors.amount = 'Valid amount is required.';
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    onSave(formData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Bid Details">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="clientName" className="block text-sm font-medium text-gray-700">Client Name</label>
          <Input type="text" id="clientName" name="clientName" value={formData.clientName || ''} onChange={handleChange} className="mt-1" />
        </div>
        <div>
          <label htmlFor="ipoName" className="block text-sm font-medium text-gray-700">IPO Name</label>
          <Input type="text" id="ipoName" name="ipoName" value={formData.ipoName || ''} onChange={handleChange} className="mt-1" />
        </div>
        <div>
          <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Quantity</label>
          <Input type="number" id="quantity" name="quantity" value={formData.quantity || ''} onChange={handleChange} className="mt-1" />
          {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>}
        </div>
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount</label>
          <Input type="number" id="amount" name="amount" value={formData.amount || ''} onChange={handleChange} className="mt-1" />
          {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
        </div>
        <div>
          <label htmlFor="activityType" className="block text-sm font-medium text-gray-700">Activity Type</label>
          <Input type="text" id="activityType" name="activityType" value={formData.activityType || ''} onChange={handleChange} className="mt-1" />
        </div>
        <div>
          <label htmlFor="exchangeStatus" className="block text-sm font-medium text-gray-700">Exchange Status</label>
          <Input type="text" id="exchangeStatus" name="exchangeStatus" value={formData.exchangeStatus || ''} onChange={handleChange} className="mt-1" />
        </div>
        <div>
          <label htmlFor="sponsorBankStatus" className="block text-sm font-medium text-gray-700">Sponsor Bank Status</label>
          <Input type="text" id="sponsorBankStatus" name="sponsorBankStatus" value={formData.sponsorBankStatus || ''} onChange={handleChange} className="mt-1" />
        </div>
        <div>
          <label htmlFor="brokerCode" className="block text-sm font-medium text-gray-700">Broker Code</label>
          <Input type="text" id="brokerCode" name="brokerCode" value={formData.brokerCode || ''} onChange={handleChange} className="mt-1" />
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <Button onClick={onClose} className="bg-gray-400 hover:bg-gray-500 text-white">Cancel</Button>
        <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white">Save Changes</Button>
        <Button onClick={() => alert('Print ASBA for this bid functionality is simulated.')} className="bg-green-600 hover:bg-green-700 text-white">Print ASBA</Button>
      </div>
    </Modal>
  );
};


const BidMaster = () => {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState('applicationNumber');
  const [sortOrder, setSortOrder] = useState('asc');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingBid, setEditingBid] = useState(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [bidToDelete, setBidToDelete] = useState(null);
  const [filterBrokerCode, setFilterBrokerCode] = useState('');
  const [brokers, setBrokers] = useState([]);
  const [filterIpoName, setFilterIpoName] = useState('');
  const [ipos, setIpos] = useState([]);

  // Fetch brokers and IPOs for filters
  useEffect(() => {
    const fetchDataForFilters = async () => {
      try {
        const brokersRes = await fetch('/api/brokers');
        if (!brokersRes.ok) throw new Error('Failed to fetch brokers');
        const brokersData = await brokersRes.json();
        setBrokers(brokersData.map(b => ({ label: b.username, value: b.brokerCode })));

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
  }, []);

  useEffect(() => {
    const fetchBids = async () => {
      setLoading(true);
      setError('');
      try {
        let url = '/api/bids'; // Your API route for bids
        const queryParams = [];

        if (filterBrokerCode) {
          queryParams.push(`brokerCode=${filterBrokerCode}`);
        }
        if (filterIpoName) {
          queryParams.push(`ipoId=${filterIpoName}`);
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
        console.error("Error fetching bid master data:", err);
        setError("Failed to load bid data.");
      } finally {
        setLoading(false);
      }
    };

    fetchBids();
  }, [filterBrokerCode, filterIpoName]);


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

  const handleEdit = (bid) => {
    setEditingBid(bid);
    setIsEditModalOpen(true);
  };

  const handleUpdateBid = async (updatedBid) => {
    setError('');
    try {
      const response = await fetch(`/api/bids/${updatedBid._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedBid),
      });
      if (!response.ok) throw new Error('Failed to update bid.');
      setIsEditModalOpen(false);
      setEditingBid(null);
      alert("Bid updated successfully!");
      fetchBids();
    } catch (e) {
      console.error("Error updating bid:", e);
      setError("Failed to update bid.");
    }
  };

  const handleDeleteBid = async () => {
    setError('');
    if (!bidToDelete) return;
    try {
      const response = await fetch(`/api/bids/${bidToDelete._id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete bid.');
      setIsDeleteConfirmOpen(false);
      setBidToDelete(null);
      alert("Bid deleted successfully!");
      fetchBids();
    } catch (e) {
      console.error("Error deleting bid:", e);
      setError("Failed to delete bid.");
    }
  };

  const openDeleteConfirm = (bid) => {
    setBidToDelete(bid);
    setIsDeleteConfirmOpen(true);
  };

  return (
    <div className="p-6 bg-gray-50 rounded-lg shadow-inner">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Bid Master</h2>

      <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0 md:space-x-4">
        <Input
          type="text"
          placeholder="Search bids..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="md:flex-1"
        />
        <Select
          value={filterBrokerCode}
          onChange={(e) => setFilterBrokerCode(e.target.value)}
          options={[{ value: '', label: 'All Brokers' }, ...brokers]}
          className="md:w-1/4"
        />
        <Select
          value={filterIpoName}
          onChange={(e) => setFilterIpoName(e.target.value)}
          options={[{ value: '', label: 'All IPOs' }, ...ipos]}
          className="md:w-1/4"
        />
        <Button onClick={() => alert('Download Bid Master functionality is simulated.')} className="bg-purple-600 hover:bg-purple-700 w-full md:w-auto whitespace-nowrap">
          <i className="fas fa-download mr-2"></i> Download Bid Master
        </Button>
        <Button onClick={() => alert('Allotment Upload functionality is simulated.')} className="bg-green-600 hover:bg-green-700 w-full md:w-auto whitespace-nowrap">
          <i className="fas fa-upload mr-2"></i> Allotment Upload
        </Button>
      </div>

      {error && <p className="text-red-600 text-center mb-4">{error}</p>}
      {loading ? (
        <div className="text-center text-gray-600">Loading bid master data...</div>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow-md border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                {['IPO Bid Name', 'Application ID', 'Client Name', 'Activity Type', 'Mobile Number', 'Broker Code', 'PAN Card', 'DP ID', 'UPI ID', 'Quantity', 'Amount'].map(header => (
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{bid.ipoName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{bid.applicationNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{bid.clientName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{bid.activityType}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{bid.mobile || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{bid.brokerCode}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{bid.panCard}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{bid.dpId || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{bid.upiId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{bid.quantity}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{bid.amount?.toLocaleString('en-IN')}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(bid)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                      title="Edit"
                    >
                      <i className="fas fa-pencil-alt"></i>
                    </button>
                    <button
                      onClick={() => openDeleteConfirm(bid)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete"
                    >
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  </td>
                </tr>
              ))}
              {sortedBids.length === 0 && (
                <tr>
                  <td colSpan="12" className="px-6 py-4 text-center text-gray-500">
                    No bids found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {isEditModalOpen && (
        <BidEditModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          bidData={editingBid}
          onSave={handleUpdateBid}
        />
      )}
      <ConfirmationDialog
        isOpen={isDeleteConfirmOpen}
        onConfirm={handleDeleteBid}
        onCancel={() => setIsDeleteConfirmOpen(false)}
        message={`Are you sure you want to delete bid "${bidToDelete?.applicationNumber}"? This action cannot be undone.`}
      />
    </div>
  );
};

export default BidMaster;