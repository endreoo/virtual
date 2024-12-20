import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { VirtualCard } from '../../types';

interface NotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: VirtualCard;
}

export function NotesModal({ isOpen, onClose, card }: NotesModalProps) {
  if (!card) return null;

  const [notes, setNotes] = useState(card.notes || '');

  const handleSave = async () => {
    try {
      // Save notes logic here
      onClose();
    } catch (error) {
      console.error('Failed to save notes:', error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Notes - ${card.guestName || 'Guest'}`}>
      <div className="space-y-4">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full h-40 p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
          placeholder="Add notes here..."
        />
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    </Modal>
  );
}