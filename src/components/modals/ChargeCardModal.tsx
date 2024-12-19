import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { VirtualCard } from '../../types';
import { CreditCard, DollarSign } from 'lucide-react';

interface ChargeCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: VirtualCard;
}

export function ChargeCardModal({ isOpen, onClose, card }: ChargeCardModalProps) {
  const [amount, setAmount] = useState(card.remainingBalance.toString());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle charge submission
    console.log('Processing charge:', { amount, card });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Charge Card">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <CreditCard className="h-5 w-5 text-blue-500" />
            <div className="text-sm text-blue-700">
              Processing payment for {card.guestName}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Amount to Charge
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-12 sm:text-sm border-gray-300 rounded-md"
                placeholder="0.00"
                step="0.01"
                required
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">{card.currency}</span>
              </div>
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
                <p className="font-medium">{card.Hotel}</p>
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
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Process Payment
          </button>
        </div>
      </form>
    </Modal>
  );
}