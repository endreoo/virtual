import React from 'react';
import { Modal } from '../ui/Modal';
import { VirtualCard } from '../../types';

interface AdjustAmountModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: VirtualCard;
}

export function AdjustAmountModal({ isOpen, onClose, card }: AdjustAmountModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Adjust Amount">
      <div>
        {/* Placeholder for future implementation */}
        <p>Adjust Amount functionality coming soon...</p>
      </div>
    </Modal>
  );
} 