import React from 'react';
import { VirtualCard } from '../../types';
import { CreditCard, DollarSign, Clock } from 'lucide-react';

interface DashboardSummaryProps {
  cards: VirtualCard[];
}

export function DashboardSummary({ cards }: DashboardSummaryProps) {
  const cardsToCharge = cards.filter(card => card.status === 'pending').length;
  const totalAmountToCharge = cards
    .filter(card => card.status === 'pending')
    .reduce((sum, card) => sum + card.remainingBalance, 0);
  const expiredCards = 3; // This would come from actual data in a real app

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Cards to Charge</h3>
            <p className="text-4xl font-semibold mb-1">{cardsToCharge}</p>
            <p className="text-gray-500 text-sm">{cardsToCharge} cards pending charge</p>
          </div>
          <div className="bg-blue-500 p-3 rounded-full">
            <CreditCard className="h-6 w-6 text-white" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Total Amount to Charge</h3>
            <p className="text-4xl font-semibold mb-1">${totalAmountToCharge.toLocaleString()}</p>
            <p className="text-gray-500 text-sm">Pending charges</p>
          </div>
          <div className="bg-green-500 p-3 rounded-full">
            <DollarSign className="h-6 w-6 text-white" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Expired Cards</h3>
            <p className="text-4xl font-semibold mb-1">{expiredCards}</p>
            <p className="text-gray-500 text-sm">Older than 6 months</p>
          </div>
          <div className="bg-red-500 p-3 rounded-full">
            <Clock className="h-6 w-6 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
}