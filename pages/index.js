// ================================
// File: pages/index.js
// Description: The main landing page.
// NOTE: For Pages Router, if you have `pages/index.js`, it will be the root `/` route.
// If you used --app flag during `create-next-app`, ensure you've deleted `app/page.tsx`
// as it would conflict with this file.
// ================================
import React from 'react';
import Link from 'next/link';

const HomePage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200 p-4">
      <div className="bg-white rounded-xl shadow-2xl p-10 max-w-md w-full text-center space-y-6 transform transition-transform duration-300 hover:scale-105">
        <h1 className="text-5xl font-extrabold text-blue-800 leading-tight">
          Welcome to <span className="text-indigo-600">IPO Portal</span>
        </h1>
        <p className="text-lg text-gray-700">
          Your comprehensive platform for managing IPO applications and client data.
        </p>
        <div className="space-y-4">
          <Link href="/clients" className="block w-full">
            <button className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75">
              View Clients
              <i className="fas fa-arrow-right ml-2"></i>
            </button>
          </Link>
          <Link href="/dashboard" className="block w-full">
             <button className="w-full px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:bg-indigo-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75">
              Go to Dashboard (Coming Soon)
              <i className="fas fa-chart-line ml-2"></i>
            </button>
          </Link>
        </div>
        <p className="text-sm text-gray-500 mt-8">
          This is a demonstration of Next.js with MongoDB integration.
        </p>
      </div>
    </div>
  );
};

export default HomePage;