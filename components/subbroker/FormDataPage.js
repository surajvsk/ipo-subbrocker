// ================================
// File: components/subbroker/FormDataPage.js
// Description: Manages client data for sub-brokers and admin.
//              Data fetching updated to use Next.js API routes.
// ================================
import React, { useState, useEffect } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';
import Select from '../common/Select';
import Modal from '../common/Modal';
import ConfirmationDialog from '../common/ConfirmationDialog';

// Dummy ClientFormModal - you would create a separate file for this.
// For now, it's defined here for brevity since it's tightly coupled.
const ClientFormModal = ({ isOpen, onClose, clientData, onSave, isNew, userRole, upiHandlers }) => {
  const [formData, setFormData] = useState(clientData || {
    tradingCode: '', userId: '', groupCode: '', clientName: '', panCard: '',
    dpId: '', upiHandle: '', mobile: '', email: '',
    bankName: '', branch: '', asbaAccount: '', brokerCode: ''
  });
  const [activeTab, setActiveTab] = useState('internal');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isNew) {
      setFormData({
        tradingCode: '', userId: '', groupCode: '', clientName: '', panCard: '',
        dpId: '', upiHandle: '', mobile: '', email: '',
        bankName: '', branch: '', asbaAccount: '', brokerCode: ''
      });
      setActiveTab('internal');
    } else {
      setFormData(clientData);
      setActiveTab(clientData?.tradingCode ? 'internal' : 'external');
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
      if (!formData.panCard) newErrors.panCard = 'PAN is required';
      if (!formData.email) newErrors.email = 'Email is required';
      if (!formData.dpId) newErrors.dpId = 'DP ID is required';
      if (!formData.upiHandle) newErrors.upiHandle = 'UPI ID is required';
    } else {
      if (!formData.tradingCode) newErrors.tradingCode = 'Client Code is required';
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
    if (!formData.tradingCode) {
      setErrors(prev => ({ ...prev, tradingCode: 'Client Code is required for Fetch.' }));
      return;
    }
    setErrors(prev => ({ ...prev, tradingCode: '' }));
    try {
      // Simulate fetching from an API route: /api/clients?tradingCode=XYZ
      const response = await fetch(`/api/clients?tradingCode=${formData.tradingCode}`);
      if (!response.ok) {
        throw new Error('Failed to fetch client data.');
      }
      const data = await response.json();
      if (data && data.length > 0) {
        const fetchedClient = data[0]; // Assuming it returns an array
        setFormData(prev => ({
          ...prev,
          panCard: fetchedClient.panCard || '',
          clientName: fetchedClient.clientName || '',
          userId: fetchedClient.userId || '',
          groupCode: fetchedClient.groupCode || '',
          dpId: fetchedClient.dpId || '',
          upiHandle: fetchedClient.upiHandle || '',
          mobile: fetchedClient.mobile || '',
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
        setErrors(prev => ({ ...prev, tradingCode: 'Client not found with this code.' }));
      }
    } catch (e) {
      console.error("Error fetching client:", e);
      setErrors(prev => ({ ...prev, tradingCode: 'Error fetching client data.' }));
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
              <label htmlFor="tradingCode" className="block text-sm font-medium text-gray-700">Client Code</label>
              <div className="flex gap-2 mt-1">
                <Input
                  type="text"
                  id="tradingCode"
                  name="tradingCode"
                  value={formData.tradingCode}
                  onChange={handleChange}
                  className="flex-grow"
                />
                <Button onClick={handleFetchClientData}>Fetch PAN</Button>
              </div>
              {errors.tradingCode && <p className="text-red-500 text-xs mt-1">{errors.tradingCode}</p>}
            </div>
            <div>
              <label htmlFor="panCardFetched" className="block text-sm font-medium text-gray-700">PAN Card (Fetched)</label>
              <Input
                type="text"
                id="panCardFetched"
                name="panCardFetched"
                value={formData.panCard}
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
              <label htmlFor="panCard" className="block text-sm font-medium text-gray-700">PAN <span className="text-red-500">*</span></label>
              <Input type="text" id="panCard" name="panCard" value={formData.panCard} onChange={handleChange} className="mt-1" />
              {errors.panCard && <p className="text-red-500 text-xs mt-1">{errors.panCard}</p>}
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
              <label htmlFor="upiHandle" className="block text-sm font-medium text-gray-700">UPI ID <span className="text-red-500">*</span></label>
              <Select
                id="upiHandle"
                name="upiHandle"
                value={formData.upiHandle}
                onChange={handleChange}
                options={[{ value: '', label: 'Select Handler' }, ...upiHandlers]}
                className="mt-1"
              />
              {errors.upiHandle && <p className="text-red-500 text-xs mt-1">{errors.upiHandle}</p>}
            </div>
            <div>
              <label htmlFor="mobile" className="block text-sm font-medium text-gray-700">Mobile Number</label>
              <Input type="text" id="mobile" name="mobile" value={formData.mobile} onChange={handleChange} className="mt-1" />
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
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState('clientName');
  const [sortOrder, setSortOrder] = useState('asc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);
  const [filterBrokerCode, setFilterBrokerCode] = useState('');
  const [brokers, setBrokers] = useState([]);
  const [upiHandlers, setUpiHandlers] = useState([]);


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
        if (userRole === 'admin' && filterBrokerCode) {
          url += `?brokerCode=${filterBrokerCode}`;
        }
        // In a real scenario, for subbroker, you'd filter by their logged-in brokerCode
        // For this demo, we'll assume subbroker views all their associated clients
        // if (userRole === 'subbroker' && loggedInBrokerCode) {
        //   url += `?brokerCode=${loggedInBrokerCode}`;
        // }

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
  }, [filterBrokerCode, userRole]); // Re-fetch when filter changes or user role changes


  const filteredClients = clients.filter(client =>
    Object.values(client).some(value =>
      String(value).toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

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
      // You might optimize this with local state updates if you have many clients
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


  return (
    <div className="p-6 bg-gray-50 rounded-lg shadow-inner">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        {userRole === 'admin' ? 'Admin Master Form' : 'Form Data Page'}
      </h2>

      <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0 md:space-x-4">
        <Input
          type="text"
          placeholder="Search clients..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="md:w-1/4"
        />
        {userRole === 'admin' && (
          <Select
            value={filterBrokerCode}
            onChange={(e) => setFilterBrokerCode(e.target.value)}
            options={[{ value: '', label: 'All Brokers' }, ...brokers]}
            className="md:w-1/4"
          />
        )}
        <div className="flex gap-4 w-full md:w-auto">
          <Button onClick={() => { setIsEditModalOpen(true); setEditingClient(null); }} className="w-full md:w-auto whitespace-nowrap">
            <i className="fas fa-plus mr-2"></i> Create New User
          </Button>
          <Button onClick={() => alert('Upload File functionality is simulated.')} className="bg-green-600 hover:bg-green-700 w-full md:w-auto whitespace-nowrap">
            <i className="fas fa-upload mr-2"></i> Upload File
          </Button>
          <Button onClick={() => alert('Download Records functionality is simulated.')} className="bg-purple-600 hover:bg-purple-700 w-full md:w-auto whitespace-nowrap">
            <i className="fas fa-download mr-2"></i> Download Excel
          </Button>
        </div>
      </div>

      {error && <p className="text-red-600 text-center mb-4">{error}</p>}
      {loading ? (
        <div className="text-center text-gray-600">Loading client data...</div>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow-md border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                {['Trading code', 'User ID', 'Group Code', 'Client Name', 'PAN Card', 'DP ID', 'UPI Handle', 'Mobile Number', 'Email ID', userRole === 'admin' ? 'Broker Code' : ''].filter(Boolean).map(header => (
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedClients.map((client) => (
                <tr key={client._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{client.tradingCode}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{client.userId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{client.groupCode || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{client.clientName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{client.panCard}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{client.dpId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{client.upiHandle}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{client.mobile}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{client.email}</td>
                  {userRole === 'admin' && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{client.brokerCode || 'N/A'}</td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(client)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                      title="Edit"
                    >
                      <i className="fas fa-pencil-alt"></i>
                    </button>
                    <button
                      onClick={() => openDeleteConfirm(client)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete"
                    >
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  </td>
                </tr>
              ))}
              {sortedClients.length === 0 && (
                <tr>
                  <td colSpan={userRole === 'admin' ? 11 : 10} className="px-6 py-4 text-center text-gray-500">
                    No clients found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

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