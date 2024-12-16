import React, { useState } from 'react';
import { ArrowUpDown, Info, CreditCard, DollarSign, FileText, Edit3, XCircle, ChevronUp, ChevronDown } from 'lucide-react';
import { VirtualCard } from '../../types';
import { InfoModal } from '../modals/InfoModal';
import { CardDetailsModal } from '../modals/CardDetailsModal';
import { ChargeCardModal } from '../modals/ChargeCardModal';
import { NotesModal } from '../modals/NotesModal';
import { AdjustAmountModal } from '../modals/AdjustAmountModal';
import { DoNotChargeModal } from '../modals/DoNotChargeModal';

interface VirtualCardTableProps {
  cards: VirtualCard[];
  sortConfig: {
    key: keyof VirtualCard | null;
    direction: 'asc' | 'desc';
  };
  onSort: (key: keyof VirtualCard) => void;
}

type ModalType = 'info' | 'cardDetails' | 'charge' | 'notes' | 'adjust' | 'doNotCharge' | null;

export function VirtualCardTable({ cards, sortConfig, onSort }: VirtualCardTableProps) {
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [selectedCard, setSelectedCard] = useState<VirtualCard | null>(null);

  const renderSortIcon = (columnKey: keyof VirtualCard) => {
    if (sortConfig.key !== columnKey) {
      return <ChevronUp className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100" />;
    }
    return sortConfig.direction === 'asc' 
      ? <ChevronUp className="w-4 h-4 text-blue-500" />
      : <ChevronDown className="w-4 h-4 text-blue-500" />;
  };

  const renderHeaderCell = (label: string, key: keyof VirtualCard) => (
    <th
      onClick={() => onSort(key)}
      className="group cursor-pointer px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hover:bg-gray-50"
    >
      <div className="flex items-center gap-1">
        {label}
        {renderSortIcon(key)}
      </div>
    </th>
  );

  const openModal = (modal: ModalType, card: VirtualCard) => {
    setSelectedCard(card);
    setActiveModal(modal);
  };

  const closeModal = () => {
    setActiveModal(null);
    setSelectedCard(null);
  };

  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {renderHeaderCell('ID', 'id')}
              {renderHeaderCell('Guest Name', 'guestName')}
              {renderHeaderCell('Confirmation', 'confirmationCode')}
              {renderHeaderCell('Check In', 'checkInDate')}
              {renderHeaderCell('Check Out', 'checkOutDate')}
              {renderHeaderCell('Amount', 'bookingAmount')}
              {renderHeaderCell('Balance', 'remainingBalance')}
              {renderHeaderCell('Status', 'status')}
              {renderHeaderCell('Source', 'bookingSource')}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {cards.map((card, index) => (
              <tr key={card.id || index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{card.id}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{card.guestName}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{card.confirmationCode}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{card.checkInDate}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{card.checkOutDate}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">${card.bookingAmount?.toFixed(2)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">${card.remainingBalance?.toFixed(2)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${card.status === 'completed' ? 'bg-green-100 text-green-800' : 
                      card.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-gray-100 text-gray-800'}`}>
                    {card.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{card.bookingSource}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <button 
                      title="Info" 
                      className="text-blue-600 hover:text-blue-800"
                      onClick={() => openModal('info', card)}
                    >
                      <Info className="h-5 w-5" />
                    </button>
                    <button 
                      title="Card Details" 
                      className="text-blue-600 hover:text-blue-800"
                      onClick={() => openModal('cardDetails', card)}
                    >
                      <CreditCard className="h-5 w-5" />
                    </button>
                    <button 
                      title="Charge" 
                      className="text-green-600 hover:text-green-800"
                      onClick={() => openModal('charge', card)}
                    >
                      <DollarSign className="h-5 w-5" />
                    </button>
                    <button 
                      title="Notes" 
                      className="text-gray-600 hover:text-gray-800"
                      onClick={() => openModal('notes', card)}
                    >
                      <FileText className="h-5 w-5" />
                    </button>
                    <button 
                      title="Edit" 
                      className="text-yellow-600 hover:text-yellow-800"
                      onClick={() => openModal('adjust', card)}
                    >
                      <Edit3 className="h-5 w-5" />
                    </button>
                    <button 
                      title="Do not charge" 
                      className="text-red-600 hover:text-red-800"
                      onClick={() => openModal('doNotCharge', card)}
                    >
                      <XCircle className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedCard && (
        <>
          <InfoModal
            isOpen={activeModal === 'info'}
            onClose={closeModal}
            card={selectedCard}
          />
          <CardDetailsModal
            isOpen={activeModal === 'cardDetails'}
            onClose={closeModal}
            card={selectedCard}
          />
          <ChargeCardModal
            isOpen={activeModal === 'charge'}
            onClose={closeModal}
            card={selectedCard}
          />
          <NotesModal
            isOpen={activeModal === 'notes'}
            onClose={closeModal}
            card={selectedCard}
          />
          <AdjustAmountModal
            isOpen={activeModal === 'adjust'}
            onClose={closeModal}
            card={selectedCard}
          />
          <DoNotChargeModal
            isOpen={activeModal === 'doNotCharge'}
            onClose={closeModal}
            card={selectedCard}
          />
        </>
      )}
    </>
  );
}