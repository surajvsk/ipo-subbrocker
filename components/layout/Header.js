// ================================
// File: components/layout/Header.js
// Description: Reusable Header component for the application layout.
// ================================
import React from 'react';

const Header = ({ title }) => (
  <header className="w-full bg-white shadow-md p-4 flex items-center justify-between">
    <h1 className="text-3xl font-semibold text-gray-800">{title}</h1>
  </header>
);

export default Header;