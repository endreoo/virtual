import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { VirtualCard } from '../../types';

interface NotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: VirtualCard;
}

export function NotesModal({ isOpen, onClose, card }: NotesModalProps) {
  const [notes, setNotes] = useState(''); // In a real app, this would be loaded from the card data

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle notes submission
    console.log('Saving notes:', { notes, card });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Card Notes">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
            Notes for {card.guestName}'s card
          </label>
          <div className="mt-1">
            <textarea
              id="notes"
              rows={4}
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
              placeholder="Add notes about this card..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Add any relevant information about this card or payment.
          </p>
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
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Save Notes
          </button>
        </div>
      </form>
    </Modal>
  );
}