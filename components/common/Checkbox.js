// ================================
// File: components/common/Checkbox.js
// Description: Reusable Checkbox component with Tailwind CSS.
// ================================
import React from 'react';

const Checkbox = ({ id, label, checked, onChange, className = '' }) => (
  <div className={`flex items-center ${className}`}>
    <input
      type="checkbox"
      id={id}
      checked={checked}
      onChange={onChange}
      className="form-checkbox h-4 w-4 text-blue-600 rounded"
    />
    <label htmlFor={id} className="ml-2 text-gray-700 text-sm">{label}</label>
  </div>
);

export default Checkbox;