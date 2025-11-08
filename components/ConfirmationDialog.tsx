import React from 'react';

interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
      role="dialog" 
      aria-modal="true" 
      aria-labelledby="dialog-title"
      onClick={onCancel}
    >
      <div 
        className="bg-white dark:bg-brand-900 rounded-lg shadow-xl p-6 w-full max-w-sm border border-gray-200 dark:border-brand-800 animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="dialog-title" className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
        <p className="text-gray-600 dark:text-gray-300 mt-2 mb-6">{message}</p>
        <div className="flex justify-end gap-4">
          <button 
            onClick={onCancel} 
            className="px-5 py-2.5 rounded-md bg-gray-200 dark:bg-brand-700 text-gray-800 dark:text-white font-semibold hover:bg-gray-300 dark:hover:bg-brand-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-brand-900 focus:ring-gray-400"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm} 
            className="px-5 py-2.5 rounded-md bg-red-600 text-white font-semibold hover:bg-red-500 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-brand-900 focus:ring-red-400"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};