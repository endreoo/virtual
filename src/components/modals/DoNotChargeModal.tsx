import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { VirtualCard } from '../../types';
import { AlertTriangle } from 'lucide-react';

interface DoNotChargeModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: VirtualCard;
}

export function DoNotChargeModal({ isOpen, onClose, card }: DoNotChargeModalProps) {
  const [reason, setReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle do not charge submission
    console.log('Setting do not charge:', { reason, card });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Do Not Charge">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <div className="text-sm text-red-700">
              This action will mark the card as "Do Not Charge"
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Reason for Do Not Charge
          </label>
          <div className="mt-1">
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md"
              placeholder="Please provide a reason..."
              required
            />
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Card Information</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Guest</p>
              <p className="font-medium">{card.guestName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Hotel</p>
              <p className="font-medium">{card.hotelName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Balance</p>
              <p className="font-medium">{card.currency} {card.remainingBalance}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full
                ${card.status === 'active' ? 'bg-green-100 text-green-800' : ''}
                ${card.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                ${card.status === 'completed' ? 'bg-blue-100 text-blue-800' : ''}`}
              >
                {card.status.charAt(0).toUpperCase() + card.status.slice(1)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
          >
            Confirm Do Not Charge
          </button>
        </div>
      </form>
    </Modal>
  );
}