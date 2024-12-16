import React, { useEffect } from 'react';
import { VirtualCard } from '../utils/mockData';
import { VirtualCardActions } from './actions/VirtualCardActions';

interface VirtualCardListProps {
  cards: VirtualCard[];
}

export const VirtualCardList: React.FC<VirtualCardListProps> = ({ cards }) => {
  useEffect(() => {
    console.log('VirtualCardList mounted, cards:', cards);
  }, [cards]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map((card) => {
        console.log('Rendering card:', card);
        return (
          <div key={card.id} className="p-4 bg-white rounded-lg shadow">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold">{card.guestName}</h3>
              <VirtualCardActions card={card} />
            </div>
            <div className="mt-2">
              <p className="text-sm text-gray-600">{card.hotelName}</p>
              <p className="text-sm">Check In: {card.checkInDate}</p>
              <p className="text-sm">Check Out: {card.checkOutDate}</p>
              <p className="text-sm font-medium mt-2">
                Balance: {card.currency} {card.remainingBalance.toFixed(2)}
              </p>
              <span className={`mt-2 inline-flex px-2 py-1 text-xs font-medium rounded-full
                ${card.status === 'active' ? 'bg-green-100 text-green-800' : 
                  card.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  card.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'}`}>
                {card.status}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};