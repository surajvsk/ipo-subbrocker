// ================================
// File: components/common/Select.js
// Description: Reusable Select (dropdown) component with Tailwind CSS.
// ================================
import React from 'react';

const Select = ({ value, onChange, options, className = '', disabled = false }) => (
  <select
    value={value}
    onChange={onChange}
    className={`w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ease-in-out
                ${className}`}
    disabled={disabled}
  >
    {options.map((option) => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
);

export default Select;