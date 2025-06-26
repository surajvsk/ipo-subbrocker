
// File: components/admin/UPIHandlerManagement.js
// Description: Allows administrators to add or delete UPI handlers.
//              Data fetching updated to use Next.js API routes.
// ================================
import React, { useState, useEffect } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';

const UPIHandlerManagement = () => {
  const [handlers, setHandlers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newHandlerName, setNewHandlerName] = useState('');
  const [addError, setAddError] = useState('');

  const fetchHandlers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/upi-handlers');
      if (!response.ok) throw new Error('Failed to fetch UPI handlers.');
      const data = await response.json();
      setHandlers(data);
    } catch (err) {
      console.error("Error fetching UPI handlers:", err);
      setError("Failed to load UPI handlers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHandlers();
  }, []);

  const handleAddHandler = async () => {
    setAddError('');
    if (!newHandlerName.trim()) {
      setAddError('Handler name cannot be empty.');
      return;
    }

    try {
      const response = await fetch('/api/upi-handlers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newHandlerName.trim(), createdAt: new Date().toISOString() }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add handler.');
      }
      setNewHandlerName('');
      alert('UPI Handler added successfully!');
      fetchHandlers(); // Re-fetch to update list
    } catch (e) {
      console.error("Error adding UPI handler:", e);
      setAddError(e.message || 'Failed to add handler.');
    }
  };

  const handleDeleteHandler = async (handlerId) => {
    if (!confirm('Are you sure you want to delete this UPI handler?')) return;

    try {
      const response = await fetch(`/api/upi-handlers/${handlerId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete handler.');
      alert('UPI Handler deleted successfully!');
      fetchHandlers(); // Re-fetch to update list
    } catch (e) {
      console.error("Error deleting UPI handler:", e);
      alert('Failed to delete handler.');
    }
  };

  return (
    <div className="p-6 bg-gray-50 rounded-lg shadow-inner">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">UPI Handler Management</h2>

      <div className="mb-6 p-4 border rounded-lg bg-white shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Add New UPI Handler</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            type="text"
            placeholder="e.g., @newbank"
            value={newHandlerName}
            onChange={(e) => { setNewHandlerName(e.target.value); setAddError(''); }}
            className="flex-grow"
          />
          <Button onClick={handleAddHandler} className="whitespace-nowrap">Add Handler</Button>
        </div>
        {addError && <p className="text-red-600 text-sm mt-2">{addError}</p>}
      </div>

      {error && <p className="text-red-600 text-center mb-4">{error}</p>}
      {loading ? (
        <div className="text-center text-gray-600">Loading UPI handlers...</div>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow-md border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Handler Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created On</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {handlers.map((handler) => (
                <tr key={handler._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{handler.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(handler.createdAt).toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleDeleteHandler(handler._id)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete"
                    >
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  </td>
                </tr>
              ))}
              {handlers.length === 0 && (
                <tr>
                  <td colSpan="3" className="px-6 py-4 text-center text-gray-500">
                    No UPI handlers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      <Button onClick={() => alert('Download List functionality is simulated.')} className="mt-6 bg-purple-600 hover:bg-purple-700 w-full md:w-auto">
        <i className="fas fa-download mr-2"></i> Download List
      </Button>
    </div>
  );
};

export default UPIHandlerManagement;