import React from 'react';
import { Modal } from '../ui/Modal';
import { VirtualCard } from '../../types';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: VirtualCard;
}

export function InfoModal({ isOpen, onClose, card }: InfoModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Card Information">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">ID</label>
            <p className="mt-1 text-sm text-gray-900">{card.id}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Guest Name</label>
            <p className="mt-1 text-sm text-gray-900">{card.guestName}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Hotel</label>
            <p className="mt-1 text-sm text-gray-900">{card.hotelName}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Source</label>
            <p className="mt-1 text-sm text-gray-900">{card.source}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Check-in</label>
            <p className="mt-1 text-sm text-gray-900">{card.checkInDate}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Check-out</label>
            <p className="mt-1 text-sm text-gray-900">{card.checkOutDate}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Balance</label>
            <p className="mt-1 text-sm text-gray-900">{card.currency} {card.remainingBalance}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <span className={`mt-1 inline-flex px-2 py-1 text-xs font-medium rounded-full
              ${card.status === 'active' ? 'bg-green-100 text-green-800' : ''}
              ${card.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
              ${card.status === 'completed' ? 'bg-blue-100 text-blue-800' : ''}`}
            >
              {card.status.charAt(0).toUpperCase() + card.status.slice(1)}
            </span>
          </div>
        </div>
      </div>
    </Modal>
  );
}