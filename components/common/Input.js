// ================================
// File: components/common/Input.js
// Description: Reusable Input component with Tailwind CSS.
// ================================
import React from 'react';

const Input = ({ type = 'text', placeholder, value, onChange, className = '', disabled = false }) => (
  <input
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    className={`w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ease-in-out
                ${className}`}
    disabled={disabled}
  />
);

export default Input;