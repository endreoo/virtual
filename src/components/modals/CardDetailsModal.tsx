import React from 'react';
import { Modal } from '../ui/Modal';
import { VirtualCard } from '../../types';
import { CreditCard } from 'lucide-react';

interface CardDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: VirtualCard;
}

export function CardDetailsModal({ isOpen, onClose, card }: CardDetailsModalProps) {
  // Mock card details - in a real app, these would come from the backend
  const cardDetails = {
    number: '4111 1111 1111 1234',
    expiry: '12/25',
    cvv: '123'
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Card Details">
      <div className="space-y-6">
        <div className="relative bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
          <div className="absolute top-4 right-4">
            <CreditCard className="h-8 w-8 opacity-50" />
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-sm opacity-75">Card Number</p>
              <p className="font-mono text-xl">{cardDetails.number}</p>
            </div>
            <div className="flex justify-between">
              <div>
                <p className="text-sm opacity-75">Expiry</p>
                <p className="font-mono">{cardDetails.expiry}</p>
              </div>
              <div>
                <p className="text-sm opacity-75">CVV</p>
                <p className="font-mono">{cardDetails.cvv}</p>
              </div>
            </div>
            <div>
              <p className="text-sm opacity-75">Card Holder</p>
              <p className="font-medium">{card.guestName}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Card Information</h4>
          <div className="grid grid-cols-2 gap-4">
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
            <div>
              <p className="text-sm text-gray-500">Check-in</p>
              <p className="font-medium">{card.checkInDate}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Check-out</p>
              <p className="font-medium">{card.checkOutDate}</p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}