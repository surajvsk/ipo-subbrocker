// ================================
// File: FormDataPage.js
// Description: Form Data Page component for displaying and managing client data.
// ================================
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';
import Select from '../common/Select';
import Modal from '../common/Modal';
import ConfirmationDialog from '../common/ConfirmationDialog';

// Dummy ClientFormModal - you would create a separate file for this.
// For now, it's defined here for brevity since it's tightly coupled.
const ClientFormModal = ({ isOpen, onClose, clientData, onSave, isNew, userRole, upiHandlers }) => {
  const [formData, setFormData] = useState(clientData || {
    clientCode: '', userId: '', groupCode: '', clientName: '', panNumber: '',
    dpId: '', upiHandler: '', mobileNumber: '', email: '',
    bankName: '', branch: '', asbaAccount: '', brokerCode: ''
  });
  const [activeTab, setActiveTab] = useState('internal');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isNew) {
      setFormData({
        clientCode: '', userId: '', groupCode: '', clientName: '', panNumber: '',
        dpId: '', upiHandler: '', mobileNumber: '', email: '',
        bankName: '', branch: '', asbaAccount: '', brokerCode: ''
      });
      setActiveTab('internal');
    } else {
      setFormData(clientData);
      // Determine active tab based on presence of clientCode for existing clients
      // If clientData has clientCode, it's likely an internal user, otherwise external
      setActiveTab(clientData?.clientCode ? 'internal' : 'external');
    }
    setErrors({});
  }, [isOpen, clientData, isNew]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (activeTab === 'external') {
      if (!formData.clientName) newErrors.clientName = 'Name is required';
      if (!formData.panNumber) newErrors.panNumber = 'PAN is required';
      if (!formData.email) newErrors.email = 'Email is required';
      if (!formData.dpId) newErrors.dpId = 'DP ID is required';
      if (!formData.upiHandler) newErrors.upiHandler = 'UPI ID is required';
    } else {
      if (!formData.clientCode) newErrors.clientCode = 'Client Code is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }
    onSave(formData);
  };

  const handleFetchClientData = async () => {
    if (!formData.clientCode) {
      setErrors(prev => ({ ...prev, clientCode: 'Client Code is required for Fetch.' }));
      return;
    }
    setErrors(prev => ({ ...prev, clientCode: '' }));
    try {
      // Simulate fetching from an API route: /api/clients?clientCode=XYZ
      const response = await fetch(`/api/clients?clientCode=${formData.clientCode}`);
      if (!response.ok) {
        throw new Error('Failed to fetch client data.');
      }
      const data = await response.json();
      if (data && data.length > 0) {
        const fetchedClient = data[0]; // Assuming it returns an array
        setFormData(prev => ({
          ...prev,
          panNumber: fetchedClient.panNumber || '',
          clientName: fetchedClient.clientName || '',
          userId: fetchedClient.userId || '',
          groupCode: fetchedClient.groupCode || '',
          dpId: fetchedClient.dpId || '',
          upiHandler: fetchedClient.upiHandler || '',
          mobileNumber: fetchedClient.mobileNumber || '',
          email: fetchedClient.email || '',
          bankName: fetchedClient.bankName || '',
          branch: fetchedClient.branch || '',
          asbaAccount: fetchedClient.asbaAccount || '',
          brokerCode: fetchedClient.brokerCode || '',
          _id: fetchedClient._id // Use MongoDB _id for updates
        }));
        setErrors({});
        alert('Client data fetched successfully!');
      } else {
        setErrors(prev => ({ ...prev, clientCode: 'Client not found with this code.' }));
      }
    } catch (e) {
      console.error("Error fetching client:", e);
      setErrors(prev => ({ ...prev, clientCode: 'Error fetching client data.' }));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isNew ? 'Create New User' : 'Edit User Details'}>
      {isNew && (
        <div className="mb-4 flex space-x-4">
          <Button
            onClick={() => setActiveTab('internal')}
            className={`flex-1 ${activeTab === 'internal' ? 'bg-blue-600' : 'bg-gray-300 hover:bg-gray-400 text-gray-800'}`}
          >
            Internal Users (Fetch)
          </Button>
          <Button
            onClick={() => setActiveTab('external')}
            className={`flex-1 ${activeTab === 'external' ? 'bg-blue-600' : 'bg-gray-300 hover:bg-gray-400 text-gray-800'}`}
          >
            External Users (Create)
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activeTab === 'internal' && (
          <>
            <div>
              <label htmlFor="clientCode" className="block text-sm font-medium text-gray-700">Client Code</label>
              <div className="flex gap-2 mt-1">
                <Input
                  type="text"
                  id="clientCode"
                  name="clientCode"
                  value={formData.clientCode}
                  onChange={handleChange}
                  className="flex-grow"
                />
                <Button onClick={handleFetchClientData}>Fetch PAN</Button>
              </div>
              {errors.clientCode && <p className="text-red-500 text-xs mt-1">{errors.clientCode}</p>}
            </div>
            <div>
              <label htmlFor="panNumberFetched" className="block text-sm font-medium text-gray-700">PAN Card (Fetched)</label>
              <Input
                type="text"
                id="panNumberFetched"
                name="panNumberFetched"
                value={formData.panNumber}
                disabled
                className="mt-1 bg-gray-100"
              />
            </div>
            <div>
              <label htmlFor="clientName" className="block text-sm font-medium text-gray-700">Client Name</label>
              <Input type="text" id="clientName" name="clientName" value={formData.clientName} onChange={handleChange} className="mt-1" />
            </div>
            <div>
              <label htmlFor="userId" className="block text-sm font-medium text-gray-700">User ID</label>
              <Input type="text" id="userId" name="userId" value={formData.userId} onChange={handleChange} className="mt-1" />
            </div>
          </>
        )}

        {activeTab === 'external' && (
          <>
            <div>
              <label htmlFor="clientName" className="block text-sm font-medium text-gray-700">Name <span className="text-red-500">*</span></label>
              <Input type="text" id="clientName" name="clientName" value={formData.clientName} onChange={handleChange} className="mt-1" />
              {errors.clientName && <p className="text-red-500 text-xs mt-1">{errors.clientName}</p>}
            </div>
            <div>
              <label htmlFor="panNumber" className="block text-sm font-medium text-gray-700">PAN <span className="text-red-500">*</span></label>
              <Input type="text" id="panNumber" name="panNumber" value={formData.panNumber} onChange={handleChange} className="mt-1" />
              {errors.panNumber && <p className="text-red-500 text-xs mt-1">{errors.panNumber}</p>}
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email ID <span className="text-red-500">*</span></label>
              <Input type="email" id="email" name="email" value={formData.email} onChange={handleChange} className="mt-1" />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
            <div>
              <label htmlFor="dpId" className="block text-sm font-medium text-gray-700">DP ID <span className="text-red-500">*</span></label>
              <Input type="text" id="dpId" name="dpId" value={formData.dpId} onChange={handleChange} className="mt-1" />
              {errors.dpId && <p className="text-red-500 text-xs mt-1">{errors.dpId}</p>}
            </div>
            <div>
              <label htmlFor="upiHandler" className="block text-sm font-medium text-gray-700">UPI ID <span className="text-red-500">*</span></label>
              <Select
                id="upiHandler"
                name="upiHandler"
                value={formData.upiHandler}
                onChange={handleChange}
                options={[{ value: '', label: 'Select Handler' }, ...upiHandlers]}
                className="mt-1"
              />
              {errors.upiHandler && <p className="text-red-500 text-xs mt-1">{errors.upiHandler}</p>}
            </div>
            <div>
              <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-700">Mobile Number</label>
              <Input type="text" id="mobileNumber" name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} className="mt-1" />
            </div>
          </>
        )}
        <div>
          <label htmlFor="groupCode" className="block text-sm font-medium text-gray-700">Group Code (Optional)</label>
          <Input type="text" id="groupCode" name="groupCode" value={formData.groupCode} onChange={handleChange} className="mt-1" />
        </div>
        <div>
          <label htmlFor="bankName" className="block text-sm font-medium text-gray-700">Bank Name (Optional)</label>
          <Input type="text" id="bankName" name="bankName" value={formData.bankName} onChange={handleChange} className="mt-1" />
        </div>
        <div>
          <label htmlFor="branch" className="block text-sm font-medium text-gray-700">Branch (Optional)</label>
          <Input type="text" id="branch" name="branch" value={formData.branch} onChange={handleChange} className="mt-1" />
        </div>
        <div>
          <label htmlFor="asbaAccount" className="block text-sm font-medium text-gray-700">ASBA Account Number (Optional)</label>
          <Input type="text" id="asbaAccount" name="asbaAccount" value={formData.asbaAccount} onChange={handleChange} className="mt-1" />
        </div>
        {userRole === 'admin' && (
          <div>
            <label htmlFor="brokerCode" className="block text-sm font-medium text-gray-700">Broker Code</label>
            <Input type="text" id="brokerCode" name="brokerCode" value={formData.brokerCode} onChange={handleChange} className="mt-1" />
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <Button onClick={onClose} className="bg-gray-400 hover:bg-gray-500 text-white">Cancel</Button>
        <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white">Save</Button>
      </div>
    </Modal>
  );
};


const FormDataPage = ({ userRole, onAddClick }) => {
  const [clients, setClients] = useState([]);
  const [filters, setFilters] = useState({
    panNumber: '',
    fullDpId: '', // Renamed from dpId for table display
    brokerCode: '',
    branchCode: 'BR9251',
    mobileNumber: '',
    upiHandler: '', // Renamed from upiHandler for table display
    email: '',
    clientCode: '',
    clientName: '' // Added for "Name" column
  });
  const [sortKey, setSortKey] = useState('panNumber'); // Default sort key from image
  const [sortOrder, setSortOrder] = useState('asc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);
  const [filterBranchCode, setFilterBranchCode] = useState(''); // This seems to be a global filter for admin
  const [brokers, setBrokers] = useState([]);
  const [upiHandlers, setUpiHandlers] = useState([]);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // Default items per page


  // Fetch brokers for admin filter and UPI Handlers for ClientFormModal
  useEffect(() => {
    const fetchDataForFilters = async () => {
      try {
        if (userRole === 'admin') {
          const brokersRes = await fetch('/api/brokers'); // Assuming an API route for brokers
          if (!brokersRes.ok) throw new Error('Failed to fetch brokers');
          const brokersData = await brokersRes.json();
          setBrokers(brokersData.map(b => ({ label: b.username, value: b.brokerCode })));
        }

        const upiHandlersRes = await fetch('/api/upi-handlers'); // Assuming an API route for UPI handlers
        if (!upiHandlersRes.ok) throw new Error('Failed to fetch UPI handlers');
        const upiHandlersData = await upiHandlersRes.json();
        setUpiHandlers(upiHandlersData.map(h => ({ label: h.name, value: h.name })));

      } catch (err) {
        console.error("Error fetching filter data:", err);
        setError("Failed to load filter options.");
      }
    };
    fetchDataForFilters();
  }, [userRole]);


  useEffect(() => {
    const fetchClients = async () => {
      setLoading(true);
      setError('');
      try {
        let url = '/api/clients'; // Your API route for clients
        // Incorporate global broker filter for admin
        if (userRole === 'admin' && filterBranchCode) {
          url += `?branchCode=${filterBranchCode}`;
        }
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setClients(data);
      } catch (err) {
        console.error("Error fetching clients:", err);
        setError("Failed to load client data.");
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, [filterBranchCode, userRole]); // Re-fetch when filter changes or user role changes


const handleFilterChange = (e) => {
  const { name, value } = e.target;
  setFilters(prev => ({ ...prev, [name]: value }));
  setCurrentPage(1);
};

  const filteredClients = clients.filter(client => {
    return Object.keys(filters).every(key => {
      let clientValue = client[key];
      // Special handling for DP ID and UPI ID to match the image column names
      if (key === 'fullDpId') clientValue = client.dpId;
      if (key === 'upiHandler') clientValue = client.upiHandler;
      if (key === 'clientName') clientValue = client.clientName; // Map to clientName in data
      if (key === 'panNumber') clientValue = client.panNumber;
      if (key === 'clientCode') clientValue = client.clientCode;
      if (key === 'email') clientValue = client.email;
      if (key === 'mobileNumber') clientValue = client.mobileNumber;
      if (key === 'brokerCode') clientValue = client.brokerCode;


      if (typeof clientValue === 'string') {
        return clientValue.toLowerCase().includes(filters[key].toLowerCase());
      }
      return true; // If not string or no filter, consider it a match
    });
  });

  const sortedClients = [...filteredClients].sort((a, b) => {
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

  const handleEdit = (client) => {
    setEditingClient(client);
    setIsEditModalOpen(true);
  };

  const handleUpdateClient = async (updatedClient) => {
    setError('');
    try {
      // Assuming a PUT API route for updating clients: /api/clients/:id
      const response = await fetch(`/api/clients/${updatedClient._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedClient),
      });
      if (!response.ok) throw new Error('Failed to update client.');
      setIsEditModalOpen(false);
      setEditingClient(null);
      alert("Client updated successfully!");
      // Re-fetch clients to update the table
      fetchClients();
    } catch (e) {
      console.error("Error updating client:", e);
      setError("Failed to update client.");
    }
  };

  const handleCreateClient = async (newClientData) => {
    setError('');
    try {
      // Assuming a POST API route for creating clients: /api/clients
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newClientData, createdAt: new Date().toISOString() }),
      });
      if (!response.ok) throw new Error('Failed to create client.');
      alert('New client created successfully!');
      // Re-fetch clients to update the table
      fetchClients();
    } catch (e) {
      console.error("Error creating client:", e);
      setError("Failed to create client.");
    }
  };


  const handleDeleteClient = async () => {
    setError('');
    if (!clientToDelete) return;
    try {
      // Assuming a DELETE API route for deleting clients: /api/clients/:id
      const response = await fetch(`/api/clients/${clientToDelete._id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete client.');
      setIsDeleteConfirmOpen(false);
      setClientToDelete(null);
      alert("Client deleted successfully!");
      // Re-fetch clients to update the table
      fetchClients();
    } catch (e) {
      console.error("Error deleting client:", e);
      setError("Failed to delete client.");
    }
  };

  const openDeleteConfirm = (client) => {
    setClientToDelete(client);
    setIsDeleteConfirmOpen(true);
  };

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentClients = sortedClients.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedClients.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when items per page changes
  };

  const renderPaginationButtons = () => {
    const pageNumbers = [];
    // Show first two, last two, and current page +/- 1
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      pageNumbers.push(1);
      if (currentPage > 3) pageNumbers.push('...');
      if (currentPage > 2) pageNumbers.push(currentPage - 1);
      if (currentPage !== 1 && currentPage !== totalPages) pageNumbers.push(currentPage);
      if (currentPage < totalPages - 1) pageNumbers.push(currentPage + 1);
      if (currentPage < totalPages - 2) pageNumbers.push('...');
      pageNumbers.push(totalPages);

      // Remove duplicates and sort
      const uniquePageNumbers = [...new Set(pageNumbers)].sort((a, b) => {
        if (a === '...') return 1;
        if (b === '...') return -1;
        return a - b;
      });
      return uniquePageNumbers;
    }
    return pageNumbers;
  };

  return (
    <div className="p-6 bg-gray-50 rounded-lg shadow-inner">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        {userRole === 'admin' ? 'Admin Master Form' : 'Form Data Page'}
      </h2>

      {/* Top action buttons as per image */}
      <div className="flex flex-wrap gap-3 mb-6 justify-start">
        <Button onClick={() => { /* Placeholder for Fetch functionality */ }} className="bg-blue-500 hover:bg-blue-600 text-white flex items-center">
          <i className="fas fa-sync-alt mr-2"></i> Fetch
        </Button>
        <Button onClick={() => { setIsEditModalOpen(true); setEditingClient(null); }} className="bg-green-500 hover:bg-green-600 text-white flex items-center">
          <i className="fas fa-plus mr-2"></i> Create
        </Button>
        <Button onClick={() => alert('Export To Excel functionality is simulated.')} className="bg-purple-600 hover:bg-purple-700 text-white flex items-center">
          <i className="fas fa-file-excel mr-2"></i> Export To Excel
        </Button>
        <Button onClick={() => alert('Upload File functionality is simulated.')} className="bg-orange-500 hover:bg-orange-600 text-white flex items-center">
          <i className="fas fa-upload mr-2"></i> Upload
        </Button>
      </div>

      {error && <p className="text-red-600 text-center mb-4">{error}</p>}
      {loading ? (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
          <p className="ml-4 text-gray-600">Loading client data...</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow-md border border-gray-200" style={{
            overflowX: 'auto',
            overflowY: 'auto',
            maxHeight: '480px', // adjust as needed for your page
          }}>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr className='sticky top-0 z-10 bg-gray-100'>
                <th  
                  onClick={() => handleSort('panNumber')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none"
                >
                  Pan Number {sortKey === 'panNumber' && (<span>{sortOrder === 'asc' ? ' ▲' : ' ▼'}</span>)}
                </th>
                <th
                  onClick={() => handleSort('dpId')} // Sort by actual data key
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none"
                >
                  Full DP ID {sortKey === 'dpId' && (<span>{sortOrder === 'asc' ? ' ▲' : ' ▼'}</span>)}
                </th>
                <th
                  onClick={() => handleSort('brokerCode')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none"
                >
                  Broker Code {sortKey === 'brokerCode' && (<span>{sortOrder === 'asc' ? ' ▲' : ' ▼'}</span>)}
                </th>
                <th
                  onClick={() => handleSort('mobileNumber')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none"
                >
                  Mobile {sortKey === 'mobileNumber' && (<span>{sortOrder === 'asc' ? ' ▲' : ' ▼'}</span>)}
                </th>
                <th
                  onClick={() => handleSort('upiHandler')} // Sort by actual data key
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none"
                >
                  UPI Id {sortKey === 'upiHandler' && (<span>{sortOrder === 'asc' ? ' ▲' : ' ▼'}</span>)}
                </th>
                <th
                  onClick={() => handleSort('email')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none"
                >
                  Email {sortKey === 'email' && (<span>{sortOrder === 'asc' ? ' ▲' : ' ▼'}</span>)}
                </th>
                <th
                  onClick={() => handleSort('clientCode')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none"
                >
                  Trading Code {sortKey === 'clientCode' && (<span>{sortOrder === 'asc' ? ' ▲' : ' ▼'}</span>)}
                </th>
                {/* Actions column header */}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
              {/* Filter row */}
              <tr className="bg-white">
                <td className="px-3 py-2">
                  <Input
                    type="text"
                    name="panNumber"
                    value={filters.panNumber}
                    onChange={handleFilterChange}
                    className="w-full text-sm"
                    placeholder="Filter panNumber"
                  />
                </td>
                <td className="px-3 py-2">
                  <Input
                    type="text"
                    name="fullDpId" // Use the key from filters state
                    value={filters.fullDpId}
                    onChange={handleFilterChange}
                    className="w-full text-sm"
                    placeholder="Filter DP ID"
                  />
                </td>
                <td className="px-3 py-2">
                  {userRole === 'admin' ? (
                    <Select
                      name="brokerCode"
                      value={filters.brokerCode}
                      onChange={handleFilterChange}
                      options={[{ value: '', label: 'All' }, ...brokers]}
                      className="w-full text-sm"
                    />
                  ) : (
                    <Input
                      type="text"
                      name="brokerCode"
                      value={filters.brokerCode}
                      onChange={handleFilterChange}
                      className="w-full text-sm"
                      placeholder="Filter Broker Code"
                    />
                  )}
                </td>
                <td className="px-3 py-2">
                  <Input
                    type="text"
                    name="mobileNumber"
                    value={filters.mobileNumber}
                    onChange={handleFilterChange}
                    className="w-full text-sm"
                    placeholder="Filter Mobile"
                  />
                </td>
                <td className="px-3 py-2">
                  <Input
                    type="text"
                    name="upiHandler" // Use the key from filters state
                    value={filters.upiHandler}
                    onChange={handleFilterChange}
                    className="w-full text-sm"
                    placeholder="Filter UPI ID"
                  />
                </td>
                <td className="px-3 py-2">
                  <Input
                    type="text"
                    name="email"
                    value={filters.email}
                    onChange={handleFilterChange}
                    className="w-full text-sm"
                    placeholder="Filter Email"
                  />
                </td>
                <td className="px-3 py-2">
                  <Input
                    type="text"
                    name="clientCode"
                    value={filters.clientCode}
                    onChange={handleFilterChange}
                    className="w-full text-sm"
                    placeholder="Filter Trading Code"
                  />
                </td>
                <td className="px-3 py-2"></td> {/* Empty for Actions column */}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentClients.map((client) => (
                <tr key={client._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{client.panNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{client.dpId}</td> {/* dpId is Full DP ID */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{client.brokerCode || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{client.mobileNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{client.upiCode}{client.upiHandler}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{client.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{client.clientCode}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(client)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Edit"
                    >
                      <i className="fas fa-pencil-alt"></i> Edit
                    </button>
                    <button
                      onClick={() => openDeleteConfirm(client)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete"
                    >
                      <i className="fas fa-trash-alt"></i> Delete
                    </button>
                    {/* "Add" button next to Delete (as seen in image) - might need clarification for its exact purpose */}
                    <button
                      onClick={() => { /* Specific Add logic based on deletion? Or add new? */ alert('Add functionality (contextual) is simulated.') }}
                      className="text-green-600 hover:text-green-900"
                      title="Add"
                    >
                      <i className="fas fa-plus"></i> Add
                    </button>
                  </td>
                </tr>
              ))}
              {currentClients.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-6 py-4 text-center text-gray-500">
                    No clients found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4">
        <div className="text-sm text-gray-600">
          Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, sortedClients.length)} of {sortedClients.length} entries
        </div>
        <div className="flex items-center space-x-2">
          <label htmlFor="itemsPerPage" className="text-sm text-gray-600">Per page:</label>
          <Select
            id="itemsPerPage"
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
            options={[
              { value: 5, label: '5' },
              { value: 10, label: '10' },
              { value: 20, label: '20' },
              { value: 50, label: '50' },
            ]}
            className="w-20 text-sm"
          />
        </div>
        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
          >
            Previous
          </button>
          {renderPaginationButtons().map((page, index) => (
            page === '...' ? (
              <span key={index} className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                ...
              </span>
            ) : (
              <button
                key={index}
                onClick={() => paginate(page)}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium ${currentPage === page ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
              >
                {page}
              </button>
            )
          ))}
          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
          >
            Next
          </button>
        </nav>
      </div>


      {isEditModalOpen && (
        <ClientFormModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          clientData={editingClient}
          onSave={editingClient ? handleUpdateClient : handleCreateClient}
          isNew={!editingClient}
          userRole={userRole}
          upiHandlers={upiHandlers}
        />
      )}
      <ConfirmationDialog
        isOpen={isDeleteConfirmOpen}
        onConfirm={handleDeleteClient}
        onCancel={() => setIsDeleteConfirmOpen(false)}
        message={`Are you sure you want to delete client "${clientToDelete?.clientName}"? This action cannot be undone.`}
      />
    </div>
  );
};

export default FormDataPage;