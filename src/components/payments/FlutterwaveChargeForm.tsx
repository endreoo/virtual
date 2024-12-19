import React from 'react';
import { VirtualCard } from '../../types';

interface FlutterwaveChargeFormProps {
  card: VirtualCard;
  onSuccess?: () => void;
}

export function FlutterwaveChargeForm({ card, onSuccess }: FlutterwaveChargeFormProps) {
  return (
    <div className="p-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Payment Details</h3>
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-sm text-gray-600">Guest: {card.guestName}</p>
          <p className="text-sm text-gray-600">Hotel: {card.Hotel}</p>
          <p className="text-sm text-gray-600">Amount: {card.remainingBalance} {card.currency}</p>
        </div>
      </div>
      {/* Add Flutterwave payment form here */}
    </div>
  );
}