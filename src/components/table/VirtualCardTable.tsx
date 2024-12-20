import React, { useState } from 'react';
import { ArrowUpDown, Info, DollarSign, FileText, Edit3, XCircle, ChevronUp, ChevronDown } from 'lucide-react';
import type { VirtualCard } from '../../types/index';
import { InfoModal } from '../modals/InfoModal';
import { ChargeCardModal } from '../modals/ChargeCardModal';
import { NotesModal } from '../modals/NotesModal';
import { MassDoNotChargeModal } from '../modals/MassDoNotChargeModal';
import { doNotCharge } from '../../utils/api';

interface VirtualCardTableProps {
  cards: VirtualCard[];
  sortConfig: {
    key: keyof VirtualCard | null;
    direction: 'asc' | 'desc';
  };
  onSort: (key: keyof VirtualCard) => void;
  onUpdate?: (updatedCard?: VirtualCard) => void;
}

type ModalType = 'info' | 'charge' | 'notes' | 'massDoNotCharge' | null;

export function VirtualCardTable({ cards, sortConfig, onSort, onUpdate }: VirtualCardTableProps) {
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [selectedCard, setSelectedCard] = useState<VirtualCard | null>(null);
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const openModal = (type: ModalType, card: VirtualCard) => {
    setSelectedCard(card);
    setActiveModal(type);
  };

  const closeModal = () => {
    setSelectedCard(null);
    setActiveModal(null);
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedCards(cards.map(card => card.id));
    } else {
      setSelectedCards([]);
    }
  };

  const handleSelectCard = (cardId: string) => {
    setSelectedCards(prev => {
      if (prev.includes(cardId)) {
        return prev.filter(id => id !== cardId);
      } else {
        return [...prev, cardId];
      }
    });
  };

  const handleMassDoNotCharge = () => {
    setActiveModal('massDoNotCharge');
  };

  const handleConfirmMassDoNotCharge = async (cardIds: string[]) => {
    setIsProcessing(true);
    try {
      console.log('[Mass Do Not Charge] Starting process with cardIds:', cardIds);
      
      // Process each card sequentially
      for (const cardId of cardIds) {
        console.log('[Mass Do Not Charge] Looking for card with ID:', cardId);
        const card = cards.find(c => c.id === cardId);
        
        if (card) {
          console.log('[Mass Do Not Charge] Found card:', {
            id: card.id,
            hotelId: card.hotelId,
            remainingBalance: card.remainingBalance
          });
          
          const payload = {
            reservation_id: card.id,
            amount_usd: card.remainingBalance || 0,
            payment_channel: 'Do Not Charge',
            hotel_id: card.hotelId || null,
            expedia_reservation_id: parseInt(card.id),
            created_at: new Date().toISOString(),
            type_of_transaction: 'Do Not Charge'
          };

          console.log('[Mass Do Not Charge] Built payload:', payload);
          console.log('[Mass Do Not Charge] Sending request with payload:', payload);
          await doNotCharge(payload);
          console.log('[Mass Do Not Charge] Card processed successfully:', cardId);
        } else {
          console.error('[Mass Do Not Charge] Card not found for ID:', cardId);
        }
      }
      
      console.log('[Mass Do Not Charge] All cards processed successfully');
      
      // Clear selection and close modal first
      setSelectedCards([]);
      closeModal();
      
      // Then refresh the table data
      if (onUpdate) {
        onUpdate();
      }
    } catch (error: any) {
      console.error('[Mass Do Not Charge] Error:', error);
      console.error('[Mass Do Not Charge] Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const selectedCardsData = cards.filter(card => selectedCards.includes(card.id));

  const renderSortIcon = (columnKey: keyof VirtualCard) => {
    if (sortConfig.key !== columnKey) {
      return <ChevronUp className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100" />;
    }
    return sortConfig.direction === 'asc' 
      ? <ChevronUp className="w-4 h-4 text-blue-500" />
      : <ChevronDown className="w-4 h-4 text-blue-500" />;
  };

  const renderCell = (card: VirtualCard, column: keyof VirtualCard) => {
    const value = card[column];
    
    switch (column) {
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
        const date = value ? new Date(value.toString()).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }) : 'N/A';
        return <div className="text-sm text-gray-900">{date}</div>;
      default:
        return <div className="text-sm text-gray-900">{value?.toString() || 'N/A'}</div>;
    }
  };

  const columns: { key: keyof VirtualCard; label: string }[] = [
    { key: 'id', label: 'ID' },
    { key: 'guestName', label: 'Guest Name' },
    { key: 'Hotel', label: 'Hotel' },
    { key: 'checkInDate', label: 'Check In' },
    { key: 'checkOutDate', label: 'Check Out' },
    { key: 'remainingBalance', label: 'Balance' },
    { key: 'status', label: 'Status' },
    { key: 'bookingSource', label: 'Source' }
  ];

  return (
    <div className="overflow-x-auto">
      <div className="mb-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <input
            type="checkbox"
            checked={selectedCards.length === cards.length}
            onChange={handleSelectAll}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-sm text-gray-600">
            {selectedCards.length} selected
          </span>
        </div>
        {selectedCards.length > 0 && (
          <button
            onClick={handleMassDoNotCharge}
            disabled={isProcessing}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? 'Processing...' : 'Do Not Charge Selected'}
          </button>
        )}
      </div>

      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="w-12 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <input
                type="checkbox"
                checked={selectedCards.length === cards.length}
                onChange={handleSelectAll}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
            </th>
            {columns.map((column) => (
              <th
                key={column.key}
                onClick={() => onSort(column.key)}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 group"
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
              onClick={(e) => {
                // Don't open modal if clicking on checkbox
                if ((e.target as HTMLElement).tagName === 'INPUT') {
                  return;
                }
                openModal('charge', card);
              }}
            >
              <td 
                className="w-12 px-6 py-4 whitespace-nowrap"
                onClick={(e) => e.stopPropagation()} // Prevent row click when clicking checkbox
              >
                <input
                  type="checkbox"
                  checked={selectedCards.includes(card.id)}
                  onChange={() => handleSelectCard(card.id)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </td>
              {columns.map((column) => (
                <td 
                  key={column.key}
                  className={`px-6 py-4 ${
                    column.key === 'Hotel' 
                      ? 'whitespace-normal min-h-[4rem] align-top' 
                      : 'whitespace-nowrap'
                  }`}
                >
                  {renderCell(card, column.key)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modals */}
      {activeModal === 'massDoNotCharge' && (
        <MassDoNotChargeModal
          isOpen={true}
          onClose={closeModal}
          selectedCards={selectedCardsData}
          onConfirm={handleConfirmMassDoNotCharge}
        />
      )}
      {activeModal === 'charge' && selectedCard && (
        <ChargeCardModal
          isOpen={true}
          onClose={closeModal}
          card={selectedCard}
          onUpdate={onUpdate}
        />
      )}
    </div>
  );
}