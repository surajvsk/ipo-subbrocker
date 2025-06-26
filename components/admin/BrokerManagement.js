// ================================
// File: components/admin/BrokerManagement.js
// Description: Allows administrators to manage sub-broker accounts.
//              Data fetching updated to use Next.js API routes.
// ================================
import React, { useState, useEffect } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';
import Checkbox from '../common/Checkbox';
import Modal from '../common/Modal';

const BrokerFormModal = ({ isOpen, onClose, brokerData, onSave, isNew }) => {
  const [formData, setFormData] = useState(brokerData || {
    brokerCode: '', username: '', password: '', mobile: '', email: '', pan: '',
    bidPermission: true, loginAccess: true, billPermission: true, role: 'subbroker'
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setFormData(brokerData || {
      brokerCode: '', username: '', password: '', mobile: '', email: '', pan: '',
      bidPermission: true, loginAccess: true, billPermission: true, role: 'subbroker'
    });
    setErrors({});
  }, [isOpen, brokerData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.brokerCode) newErrors.brokerCode = 'Broker Code is required.';
    if (!formData.username) newErrors.username = 'Username is required.';
    if (isNew && !formData.password) newErrors.password = 'Password is required.';
    if (!formData.mobile) newErrors.mobile = 'Mobile Number is required.';
    if (!formData.email) newErrors.email = 'Email is required.';
    if (!formData.pan) newErrors.pan = 'PAN is required.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }
    onSave(formData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isNew ? 'Create New Broker' : 'Edit Broker Details'}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="brokerCode" className="block text-sm font-medium text-gray-700">Broker Code <span className="text-red-500">*</span></label>
          <Input type="text" id="brokerCode" name="brokerCode" value={formData.brokerCode} onChange={handleChange} className="mt-1" disabled={!isNew} />
          {errors.brokerCode && <p className="text-red-500 text-xs mt-1">{errors.brokerCode}</p>}
        </div>
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username <span className="text-red-500">*</span></label>
          <Input type="text" id="username" name="username" value={formData.username} onChange={handleChange} className="mt-1" />
          {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
        </div>
        {isNew && (
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password <span className="text-red-500">*</span></label>
            <Input type="password" id="password" name="password" value={formData.password} onChange={handleChange} className="mt-1" />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>
        )}
        {!isNew && (
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">Change Password</label>
            <Input type="password" id="newPassword" name="password" value={formData.password} onChange={handleChange} placeholder="Enter new password to change" className="mt-1" />
            <p className="text-xs text-gray-500 mt-1">Leave blank to keep current password.</p>
          </div>
        )}
        <div>
          <label htmlFor="mobile" className="block text-sm font-medium text-gray-700">Mobile Number <span className="text-red-500">*</span></label>
          <Input type="text" id="mobile" name="mobile" value={formData.mobile} onChange={handleChange} className="mt-1" />
          {errors.mobile && <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>}
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email ID <span className="text-red-500">*</span></label>
          <Input type="email" id="email" name="email" value={formData.email} onChange={handleChange} className="mt-1" />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
        </div>
        <div>
          <label htmlFor="pan" className="block text-sm font-medium text-gray-700">PAN <span className="text-red-500">*</span></label>
          <Input type="text" id="pan" name="pan" value={formData.pan} onChange={handleChange} className="mt-1" />
          {errors.pan && <p className="text-red-500 text-xs mt-1">{errors.pan}</p>}
        </div>

        <div className="col-span-2 grid grid-cols-3 gap-4 mt-2">
          <Checkbox id="bidPermission" name="bidPermission" label="Bid Permission" checked={formData.bidPermission} onChange={handleChange} />
          <Checkbox id="loginAccess" name="loginAccess" label="Login Access" checked={formData.loginAccess} onChange={handleChange} />
          <Checkbox id="billPermission" name="billPermission" label="Bill Permission" checked={formData.billPermission} onChange={handleChange} />
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <Button onClick={onClose} className="bg-gray-400 hover:bg-gray-500 text-white">Cancel</Button>
        <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white">Save</Button>
      </div>
    </Modal>
  );
};


const BrokerManagement = () => {
  const [brokers, setBrokers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState('brokerCode');
  const [sortOrder, setSortOrder] = useState('asc');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingBroker, setEditingBroker] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);


  useEffect(() => {
    const fetchBrokers = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch('/api/brokers');
        if (!response.ok) throw new Error('Failed to fetch brokers.');
        const data = await response.json();
        setBrokers(data);
      } catch (err) {
        console.error("Error fetching brokers:", err);
        setError("Failed to load broker data.");
      } finally {
        setLoading(false);
      }
    };
    fetchBrokers();
  }, []);

  const filteredBrokers = brokers.filter(broker =>
    Object.values(broker).some(value =>
      String(value).toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const sortedBrokers = [...filteredBrokers].sort((a, b) => {
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

  const handleEdit = (broker) => {
    setEditingBroker(broker);
    setIsEditModalOpen(true);
  };

  const handleUpdateBroker = async (updatedBroker) => {
    setError('');
    try {
      const response = await fetch(`/api/brokers/${updatedBroker._id}`, { // Using MongoDB's _id
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedBroker),
      });
      if (!response.ok) throw new Error('Failed to update broker.');
      setIsEditModalOpen(false);
      setEditingBroker(null);
      alert("Broker updated successfully!");
      fetchBrokers();
    } catch (e) {
      console.error("Error updating broker:", e);
      setError("Failed to update broker.");
    }
  };

  const handleCreateBroker = async (newBrokerData) => {
    setError('');
    try {
      const response = await fetch('/api/brokers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newBrokerData, createdAt: new Date().toISOString() }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create broker.');
      }
      setIsCreateModalOpen(false);
      alert("New broker created successfully!");
      fetchBrokers();
    } catch (e) {
      console.error("Error creating broker:", e);
      setError(e.message || "Failed to create broker.");
    }
  };


  return (
    <div className="p-6 bg-gray-50 rounded-lg shadow-inner">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Broker Management</h2>

      <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0 md:space-x-4">
        <Input
          type="text"
          placeholder="Search brokers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="md:flex-1"
        />
        <Button onClick={() => setIsCreateModalOpen(true)} className="w-full md:w-auto whitespace-nowrap">
          <i className="fas fa-plus mr-2"></i> Create Broker
        </Button>
        <Button onClick={() => alert('Branch Import functionality is simulated.')} className="bg-green-600 hover:bg-green-700 w-full md:w-auto whitespace-nowrap">
          <i className="fas fa-upload mr-2"></i> Branch Import
        </Button>
      </div>

      {error && <p className="text-red-600 text-center mb-4">{error}</p>}
      {loading ? (
        <div className="text-center text-gray-600">Loading broker data...</div>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow-md border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                {['Broker Code', 'Username', 'Mobile Number', 'Email', 'PAN', 'Bid Permission', 'Login Access', 'Bill Permission'].map(header => (
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
              {sortedBrokers.map((broker) => (
                <tr key={broker._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{broker.brokerCode}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{broker.username}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{broker.mobile}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{broker.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{broker.pan}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{broker.bidPermission ? 'Yes' : 'No'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{broker.loginAccess ? 'Yes' : 'No'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{broker.billPermission ? 'Yes' : 'No'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(broker)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Edit"
                    >
                      <i className="fas fa-pencil-alt"></i>
                    </button>
                  </td>
                </tr>
              ))}
              {sortedBrokers.length === 0 && (
                <tr>
                  <td colSpan="9" className="px-6 py-4 text-center text-gray-500">
                    No brokers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {isEditModalOpen && (
        <BrokerFormModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          brokerData={editingBroker}
          onSave={handleUpdateBroker}
          isNew={false}
        />
      )}
      {isCreateModalOpen && (
        <BrokerFormModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSave={handleCreateBroker}
          isNew={true}
        />
      )}
    </div>
  );
};

export default BrokerManagement;