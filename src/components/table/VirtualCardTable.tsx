import React, { useState, useEffect } from 'react';
import { ArrowUpDown, Info, DollarSign, FileText, Edit3, XCircle, ChevronUp, ChevronDown } from 'lucide-react';
import type { VirtualCard } from '../../types/index';
import { InfoModal } from '../modals/InfoModal';
import { ChargeCardModal } from '../modals/ChargeCardModal';
import { NotesModal } from '../modals/NotesModal';
import { MassDoNotChargeModal } from '../modals/MassDoNotChargeModal';
import apiService from '../../utils/api';
import { doNotCharge } from '../../utils/api';

interface VirtualCardTableProps {
  cards: VirtualCard[];
  setCards: (cards: VirtualCard[]) => void;
  sortConfig: {
    key: keyof VirtualCard | null;
    direction: 'asc' | 'desc';
  };
  onSort: (key: keyof VirtualCard) => void;
  onUpdate?: (updatedCard?: VirtualCard) => void;
}

type ModalType = 'info' | 'charge' | 'notes' | 'massDoNotCharge' | null;

export function VirtualCardTable({ cards, setCards, sortConfig, onSort, onUpdate }: VirtualCardTableProps) {
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [selectedCard, setSelectedCard] = useState<VirtualCard | null>(null);
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [showMassDoNotCharge, setShowMassDoNotCharge] = useState(false);
  const [showChargeableOnly, setShowChargeableOnly] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const fetchCards = async () => {
      try {
        setLoading(true);
        const response = await apiService.get<VirtualCard[]>(`/api/reservations?showChargeable=${showChargeableOnly}`);
        setCards(response.data);
      } catch (error) {
        console.error('Error fetching cards:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCards();
  }, [showChargeableOnly, setCards]);

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
      case 'guestName':
        return <div className="text-sm text-gray-900">{value || 'N/A'}</div>;
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
          <div className="text-sm text-gray-900 break-words leading-snug max-h-20 overflow-hidden">
            {value || 'N/A'}
          </div>
        );
      case 'bookingSource':
        const source = value?.toString() || 'Unknown';
        const sourceMap = {
          'Expedia': { color: 'text-blue-600', short: 'EXP' },
          'Expedia Affiliate Network': { color: 'text-blue-800', short: 'EAN' },
          'Hotels': { color: 'text-indigo-600', short: 'HTL' },
          'Booking.com': { color: 'text-blue-500', short: 'BKG' },
          'American Express': { color: 'text-purple-600', short: 'AMEX' },
          'Orbitz': { color: 'text-green-600', short: 'ORB' },
          'Travelocity': { color: 'text-red-600', short: 'TVL' },
          'Egencia': { color: 'text-orange-600', short: 'EGN' },
          'Wotif': { color: 'text-yellow-600', short: 'WTF' }
        };
        const { color, short } = sourceMap[source as keyof typeof sourceMap] || { color: 'text-gray-600', short: source.substring(0, 4) };
        return (
          <div 
            className={`text-sm ${color} font-medium truncate`}
            title={source}
          >
            {short}
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

  const columns: { key: keyof VirtualCard; label: string; width: string }[] = [
    { key: 'id', label: 'ID', width: 'w-20' },
    { key: 'guestName', label: 'Guest Name', width: 'w-48' },
    { key: 'Hotel', label: 'Hotel', width: 'w-64' },
    { key: 'checkInDate', label: 'Check In', width: 'w-32' },
    { key: 'checkOutDate', label: 'Check Out', width: 'w-32' },
    { key: 'remainingBalance', label: 'Balance', width: 'w-28' },
    { key: 'status', label: 'Status', width: 'w-28' },
    { key: 'bookingSource', label: 'Source', width: 'w-36' }
  ];

  const totalPages = Math.ceil(cards.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedCards = cards.slice(startIndex, startIndex + pageSize);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-semibold text-gray-900">Virtual Cards</h1>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              {showChargeableOnly ? 'Chargeable Only' : 'All Records'}
            </span>
            <button
              onClick={() => setShowChargeableOnly(!showChargeableOnly)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                showChargeableOnly ? 'bg-blue-600' : 'bg-gray-200'
              }`}
              role="switch"
              aria-checked={showChargeableOnly}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  showChargeableOnly ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
        {selectedCards.length > 0 && (
          <button
            onClick={() => setShowMassDoNotCharge(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Do Not Charge Selected ({selectedCards.length})
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="flex justify-between items-center p-4 border-b">
          <div className="flex items-center space-x-4">
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
            </select>
            <span className="text-sm text-gray-600">
              Showing {startIndex + 1} to {Math.min(startIndex + pageSize, cards.length)} of {cards.length} entries
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
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
                    className={`${column.width} px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 group`}
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
              {paginatedCards.map((card) => (
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
                      className={`${column.width} px-6 py-4 ${
                        column.key === 'Hotel' 
                          ? 'min-h-[4rem] align-top' 
                          : ''
                      }`}
                    >
                      {renderCell(card, column.key)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-2 py-1 rounded text-sm ${
                  currentPage === 1
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                ←
              </button>
              {(() => {
                const pages = [];
                const maxVisiblePages = 3; // Reduced from 5 to 3
                const halfVisible = Math.floor(maxVisiblePages / 2);
                
                let startPage = Math.max(1, currentPage - halfVisible);
                let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
                
                if (endPage - startPage + 1 < maxVisiblePages) {
                  startPage = Math.max(1, endPage - maxVisiblePages + 1);
                }

                // First page
                if (startPage > 1) {
                  pages.push(
                    <button
                      key={1}
                      onClick={() => handlePageChange(1)}
                      className="px-2 py-1 rounded text-sm text-gray-700 hover:bg-gray-50"
                    >
                      1
                    </button>
                  );
                  if (startPage > 2) {
                    pages.push(
                      <span key="ellipsis1" className="px-1 text-gray-500">
                        •••
                      </span>
                    );
                  }
                }

                // Visible pages
                for (let i = startPage; i <= endPage; i++) {
                  pages.push(
                    <button
                      key={i}
                      onClick={() => handlePageChange(i)}
                      className={`px-2 py-1 rounded text-sm ${
                        currentPage === i
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {i}
                    </button>
                  );
                }

                // Last page
                if (endPage < totalPages) {
                  if (endPage < totalPages - 1) {
                    pages.push(
                      <span key="ellipsis2" className="px-1 text-gray-500">
                        •••
                      </span>
                    );
                  }
                  pages.push(
                    <button
                      key={totalPages}
                      onClick={() => handlePageChange(totalPages)}
                      className="px-2 py-1 rounded text-sm text-gray-700 hover:bg-gray-50"
                    >
                      {totalPages}
                    </button>
                  );
                }

                return pages;
              })()}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-2 py-1 rounded text-sm ${
                  currentPage === totalPages
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                →
              </button>
            </div>
            <div className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </div>
          </div>
        )}
      </div>

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