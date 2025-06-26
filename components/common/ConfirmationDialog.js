// ================================
// File: components/common/ConfirmationDialog.js
// Description: Reusable Confirmation Dialog component using the Modal.
// ================================
import React from 'react';
import Modal from './Modal'; // Adjust path as necessary
import Button from './Button'; // Adjust path as necessary

const ConfirmationDialog = ({ isOpen, onConfirm, onCancel, message }) => {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onCancel} title="Confirm Action">
      <p className="mb-6 text-gray-700">{message}</p>
      <div className="flex justify-end gap-3">
        <Button onClick={onCancel} className="bg-gray-400 hover:bg-gray-500 text-white">Cancel</Button>
        <Button onClick={onConfirm} className="bg-red-600 hover:bg-red-700 text-white">Confirm</Button>
      </div>
    </Modal>
  );
};

export default ConfirmationDialog;