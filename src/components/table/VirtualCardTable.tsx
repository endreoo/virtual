import React, { useState } from 'react';
import { ArrowUpDown, Info, DollarSign, FileText, Edit3, XCircle, ChevronUp, ChevronDown } from 'lucide-react';
import type { VirtualCard } from '../../types/index';
import { InfoModal } from '../modals/InfoModal';
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

type ModalType = 'info' | 'charge' | 'notes' | 'adjust' | 'doNotCharge' | null;

type ColumnConfig = {
  key: keyof VirtualCard;
  label: string;
  width: string;
};

const columns: ColumnConfig[] = [
  { key: 'id', label: 'ID', width: '80px' },
  { key: 'Hotel', label: 'Hotel', width: '200px' },
  { key: 'checkInDate', label: 'Check In', width: '120px' },
  { key: 'checkOutDate', label: 'Check Out', width: '120px' },
  { key: 'remainingBalance', label: 'Balance', width: '100px' },
  { key: 'status', label: 'Status', width: '100px' },
  { key: 'bookingSource', label: 'Source', width: '120px' }
];

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
      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full table-fixed divide-y divide-gray-200">
          <colgroup>
            {columns.map((col) => (
              <col key={col.key.toString()} style={{ width: col.width }} />
            ))}
            <col style={{ width: '120px' }} /> {/* Actions column */}
          </colgroup>
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key.toString()}
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  style={{ width: column.width }}
                  onClick={() => onSort(column.key)}
                >
                  <div className="flex items-center gap-1">
                    {column.label}
                    {renderSortIcon(column.key)}
                  </div>
                </th>
              ))}
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                style={{ width: '150px' }}
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {cards.map((card, index) => (
              <tr key={card.id?.toString() || index.toString()} className="hover:bg-gray-50">
                {columns.map((column) => (
                  <td 
                    key={column.key.toString()} 
                    className={`px-6 py-4 ${
                      column.key === 'Hotel' 
                        ? 'whitespace-normal min-h-[4rem] align-top' 
                        : 'whitespace-nowrap'
                    }`}
                  >
                    {column.key === 'status' ? (
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${card.status === 'completed' ? 'bg-green-100 text-green-800' : 
                          card.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-gray-100 text-gray-800'}`}>
                        {card[column.key]}
                      </span>
                    ) : column.key === 'remainingBalance' ? (
                      <div className="text-sm text-gray-900">${card[column.key]?.toFixed(2)}</div>
                    ) : column.key === 'Hotel' ? (
                      <div className="text-sm text-gray-900 break-words leading-snug">{card[column.key]}</div>
                    ) : column.key === 'bookingSource' ? (
                      <div 
                        className="text-sm text-gray-900 truncate" 
                        title={card[column.key]?.toString() || ''}
                      >
                        {card[column.key]}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-900">{card[column.key]}</div>
                    )}
                  </td>
                ))}
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