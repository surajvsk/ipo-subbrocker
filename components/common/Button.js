// ================================
// File: components/common/Button.js
// Description: Reusable Button component with Tailwind CSS.
// ================================
import React from 'react';

const Button = ({ onClick, children, className = '', disabled = false }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ease-in-out
                ${disabled ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'}
                ${className}`}
    disabled={disabled}
  >
    {children}
  </button>
);

export default Button;
