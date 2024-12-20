import React, { useState, useEffect } from 'react';
import { VirtualCard } from '../types/VirtualCard';
import { ChargeCardModal } from './ChargeCardModal';
import { formatCurrency } from '../utils/formatCurrency';
import { Checkbox } from './ui/checkbox';

interface VirtualCardTableProps {
  data: VirtualCard[];
  onMassDoNotCharge: (selectedCards: VirtualCard[]) => void;
}

export function VirtualCardTable({ data, onMassDoNotCharge }: VirtualCardTableProps): JSX.Element {
  const [selectedCard, setSelectedCard] = useState<VirtualCard | null>(null);
  const [selectedCards, setSelectedCards] = useState<VirtualCard[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    setSelectedCards([]);
  }, [data]);

  const handleRowClick = (card: VirtualCard): void => {
    setSelectedCard(card);
    setIsModalOpen(true);
  };

  const handleModalClose = (): void => {
    setIsModalOpen(false);
    setSelectedCard(null);
  };

  const handleCheckboxChange = (checked: boolean, card: VirtualCard): void => {
    setSelectedCards((prev) => {
      if (checked) {
        return [...prev, card];
      }
      return prev.filter((c) => c.id !== card.id);
    });
  };

  const handleMassDoNotCharge = (): void => {
    onMassDoNotCharge(selectedCards);
    setSelectedCards([]);
  };

  return (
    <div className="relative overflow-x-auto">
      {selectedCards.length > 0 && (
        <div className="mb-4 p-4 bg-blue-50 rounded-lg flex justify-between items-center">
          <span className="text-blue-700">
            {selectedCards.length} record{selectedCards.length !== 1 ? 's' : ''} selected
          </span>
          <button
            type="button"
            onClick={handleMassDoNotCharge}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Mass Do Not Charge
          </button>
        </div>
      )}
      <table className="w-full text-sm text-left text-gray-500">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
          <tr>
            <th scope="col" className="p-4">
              <Checkbox
                checked={selectedCards.length === data.length && data.length > 0}
                onCheckedChange={(checked: boolean) => {
                  if (checked) {
                    setSelectedCards(data);
                  } else {
                    setSelectedCards([]);
                  }
                }}
              />
            </th>
            <th scope="col" className="px-6 py-3">Guest Name</th>
            <th scope="col" className="px-6 py-3">Card Number</th>
            <th scope="col" className="px-6 py-3">Expiry</th>
            <th scope="col" className="px-6 py-3">CVV</th>
            <th scope="col" className="px-6 py-3">Amount</th>
            <th scope="col" className="px-6 py-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {data.map((card) => (
            <tr
              key={card.id}
              className="bg-white border-b hover:bg-gray-50 cursor-pointer"
              onClick={(e) => {
                const target = e.target as HTMLElement;
                if (!target.closest('.checkbox-cell')) {
                  handleRowClick(card);
                }
              }}
            >
              <td className="p-4 checkbox-cell">
                <Checkbox
                  checked={selectedCards.some((c) => c.id === card.id)}
                  onCheckedChange={(checked: boolean) => handleCheckboxChange(checked, card)}
                />
              </td>
              <td className="px-6 py-4">{card.guestName || 'N/A'}</td>
              <td className="px-6 py-4">{card.cardNumber}</td>
              <td className="px-6 py-4">{card.expiryDate}</td>
              <td className="px-6 py-4">{card.cvv}</td>
              <td className="px-6 py-4">{formatCurrency(card.remainingBalance)}</td>
              <td className="px-6 py-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  card.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {card.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {selectedCard && (
        <ChargeCardModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          card={selectedCard}
        />
      )}
    </div>
  );
} 