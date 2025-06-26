// ================================
// File: pages/clients.js
// Description: React page component to display client data fetched from the API route.
// ================================
import React, { useState, useEffect } from 'react';

const ClientsPage = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Function to fetch data from your Next.js API route
    const fetchClients = async () => {
      try {
        // Make a fetch request to your Next.js API route for clients
        const response = await fetch('/api/clients');
        if (!response.ok) {
          // If the response is not OK (e.g., 404, 500), throw an error
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        // Parse the JSON response
        const data = await response.json();
        setClients(data); // Update the state with fetched clients
      } catch (err) {
        // Catch and log any errors during the fetch operation
        console.error("Failed to fetch clients:", err);
        setError("Failed to load client data. Please try again later.");
      } finally {
        // Set loading to false once the fetch operation completes ( चाहे सफल हो या विफल )
        setLoading(false);
      }
    };

    fetchClients(); // Call the fetch function when the component mounts
  }, []); // Empty dependency array means this effect runs only once after the initial render

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <p className="text-xl text-blue-600">Loading clients...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-red-100">
        <p className="text-xl text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">Our Clients</h1>

      {clients.length === 0 ? (
        <p className="text-center text-gray-600 text-lg">No clients found. (Add dummy data directly to your MongoDB 'ipo_portal_db.clients' collection for testing)</p>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow-md border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PAN Card</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mobile</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {clients.map((client, index) => (
                <tr key={client._id || index}> {/* Use client._id if available, otherwise index */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{client.clientName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{client.panCard}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{client.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{client.mobile}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ClientsPage;



