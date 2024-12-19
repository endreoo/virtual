import React, { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import type { VirtualCard, SortConfig } from '../../types';
import { ChargeCardModal } from '../modals/ChargeCardModal';

interface VirtualCardTableProps {
  cards: VirtualCard[];
  sortConfig: SortConfig;
  onSort: (key: keyof VirtualCard) => void;
  onUpdate?: (updatedCard: VirtualCard) => void;
}

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

export function VirtualCardTable({ cards, sortConfig, onSort, onUpdate }: VirtualCardTableProps): JSX.Element {
  const [selectedCard, setSelectedCard] = useState<VirtualCard | null>(null);
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  const handleCardClick = (card: VirtualCard) => {
    if (!card) return;
    setSelectedCard(card);
  };

  const handleModalClose = () => {
    setSelectedCard(null);
    setActiveModal(null);
  };

  const handleCardUpdate = async (updatedCard: VirtualCard) => {
    setSelectedCard(updatedCard);
    
    if (onUpdate) {
      onUpdate(updatedCard);
    }
  };

  const renderSortIcon = (columnKey: keyof VirtualCard) => {
    if (sortConfig.key !== columnKey) {
      return <ChevronUp className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100" />;
    }
    return sortConfig.direction === 'asc' 
      ? <ChevronUp className="w-4 h-4 text-blue-500" />
      : <ChevronDown className="w-4 h-4 text-blue-500" />;
  };

  const renderCell = (card: VirtualCard, column: ColumnConfig) => {
    const value = card[column.key];
    
    switch (column.key) {
      case 'status':
        const status = value?.toString() || '';
        if (!status || status === 'Unknown') {
          return <span></span>;
        }
        const statusMap = {
          'Active': { bg: 'bg-green-100', text: 'text-green-800' },
          'Recent': { bg: 'bg-blue-100', text: 'text-blue-800' },
          'Canceled': { bg: 'bg-red-100', text: 'text-red-800' },
          'No-show': { bg: 'bg-yellow-100', text: 'text-yellow-800' },
          'Reconciled - modified': { bg: 'bg-purple-100', text: 'text-purple-800' }
        };
        const { bg, text } = statusMap[status as keyof typeof statusMap] || { bg: '', text: '' };
        return (
          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${bg} ${text}`}>
            {status}
          </span>
        );
      case 'remainingBalance':
        const amount = Number(value) || 0;
        return (
          <div className="text-sm text-gray-900">
            ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        );
      case 'Hotel':
        return (
          <div className="text-sm text-gray-900 break-words leading-snug">
            {value || 'N/A'}
          </div>
        );
      case 'bookingSource':
        const source = value?.toString() || 'Unknown';
        const sourceMap = {
          'Expedia': { color: 'text-blue-600' },
          'Expedia Affiliate Network': { color: 'text-blue-800' },
          'Hotels': { color: 'text-indigo-600' },
          'Booking.com': { color: 'text-blue-500' },
          'American Express': { color: 'text-purple-600' },
          'Orbitz': { color: 'text-green-600' },
          'Travelocity': { color: 'text-red-600' },
          'Egencia': { color: 'text-orange-600' },
          'Wotif': { color: 'text-yellow-600' }
        };
        const { color } = sourceMap[source as keyof typeof sourceMap] || { color: 'text-gray-600' };
        return (
          <div 
            className={`text-sm ${color} truncate font-medium`}
            title={source}
          >
            {source}
          </div>
        );
      case 'checkInDate':
      case 'checkOutDate':
        const date = value ? new Date(value).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }) : 'N/A';
        return <div className="text-sm text-gray-900">{date}</div>;
      default:
        return <div className="text-sm text-gray-900">{value?.toString() || 'N/A'}</div>;
    }
  };

  return (
    <>
      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full table-fixed divide-y divide-gray-200">
          <colgroup>
            {columns.map((col) => (
              <col key={col.key} style={{ width: col.width }} />
            ))}
          </colgroup>
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 group"
                  style={{ width: column.width }}
                  onClick={() => onSort(column.key)}
                >
                  <div className="flex items-center gap-1">
                    {column.label}
                    {renderSortIcon(column.key)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {cards.map((card) => (
              <tr 
                key={card.id} 
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => handleCardClick(card)}
              >
                {columns.map((column) => (
                  <td 
                    key={column.key} 
                    className={`px-6 py-4 ${
                      column.key === 'Hotel' 
                        ? 'whitespace-normal min-h-[4rem] align-top' 
                        : 'whitespace-nowrap'
                    }`}
                  >
                    {renderCell(card, column)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedCard && (
        <ChargeCardModal
          isOpen={true}
          onClose={handleModalClose}
          card={selectedCard}
          onUpdate={handleCardUpdate}
        />
      )}
    </>
  );
}