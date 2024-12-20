import React from 'react';
import { Modal } from '../ui/Modal';
import { VirtualCard } from '../../types';
import { XCircle } from 'lucide-react';

interface MassDoNotChargeModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCards: VirtualCard[];
  onConfirm: (cardIds: string[]) => void;
}

export function MassDoNotChargeModal({ isOpen, onClose, selectedCards, onConfirm }: MassDoNotChargeModalProps) {
  const handleConfirm = () => {
    onConfirm(selectedCards.map(card => card.id));
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirm Do Not Charge">
      <div className="space-y-6">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <XCircle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                You are about to mark {selectedCards.length} cards as "Do Not Charge". This action cannot be undone.
              </p>
            </div>
          </div>
        </div>

        <div className="max-h-60 overflow-y-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guest</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hotel</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {selectedCards.map((card) => (
                <tr key={card.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{card.guestName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{card.Hotel}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${card.remainingBalance?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Confirm Do Not Charge
          </button>
        </div>
      </div>
    </Modal>
  );
} 