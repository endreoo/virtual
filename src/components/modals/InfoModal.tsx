import React from 'react';
import { Modal } from '../ui/Modal';
import { VirtualCard } from '../../types';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: VirtualCard;
}

export function InfoModal({ isOpen, onClose, card }: InfoModalProps) {
  if (!card) return null;

  const formatText = (text: string | undefined) => {
    if (!text) return 'N/A';
    return text.split('\n').map((line, i) => (
      <React.Fragment key={i}>
        {line}
        <br />
      </React.Fragment>
    ));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Reservation Information">
      <div className="space-y-6">
        <div className="bg-white px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900">Guest Information</h3>
              <div className="mt-2 text-sm text-gray-500">
                {formatText(card.fullSidePanelText)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}