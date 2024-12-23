import React, { useState, useEffect } from 'react';
import { VirtualCard } from '../../types';
import { ChargeCardModal } from '../modals/ChargeCardModal';
import { formatCurrency } from '../../utils/formatCurrency';
import { ChevronDown, ChevronUp, ArrowUpDown } from 'lucide-react';
import { Checkbox } from '../ui/Checkbox';
import { MassDoNotChargeModal } from '../modals/MassDoNotChargeModal';
import { doNotCharge, updateCardStatus } from '../../utils/api';

interface ColumnConfig {
  key: keyof VirtualCard;
  label: string;
  sortable: boolean;
}

interface VirtualCardTableProps {
  cards: VirtualCard[];
  setCards: React.Dispatch<React.SetStateAction<VirtualCard[]>>;
  sortConfig: {
    key: keyof VirtualCard | null;
    direction: 'asc' | 'desc';
  };
  onSort: (key: keyof VirtualCard) => void;
  onUpdate: (updatedCard?: VirtualCard) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  pageSize: number;
  setPageSize: (size: number) => void;
  totalItems: number;
  showChargeableOnly: boolean;
  setShowChargeableOnly: (show: boolean) => void;
}

const CARD_STATUSES = ['Active', 'Waiting on Expedia', 'Do Not Charge'] as const;

export function VirtualCardTable({ 
  cards, 
  setCards, 
  sortConfig, 
  onSort, 
  onUpdate,
  currentPage,
  setCurrentPage,
  pageSize,
  setPageSize,
  totalItems,
  showChargeableOnly,
  setShowChargeableOnly
}: VirtualCardTableProps): JSX.Element {
  const [selectedCard, setSelectedCard] = useState<VirtualCard | null>(null);
  const [selectedCards, setSelectedCards] = useState<VirtualCard[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [showMassDoNotCharge, setShowMassDoNotCharge] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

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

  const handleConfirmMassDoNotCharge = async (cardIds: string[]) => {
    setIsProcessing(true);
    try {
      console.log('[Mass Do Not Charge] Starting process with card IDs:', cardIds);
      
      // Process each card sequentially
      for (const cardId of cardIds) {
        console.log('[Mass Do Not Charge] Processing card:', cardId);
        const card = selectedCards.find(c => c.id === cardId);
        if (!card) {
          console.warn(`[Mass Do Not Charge] Card not found for ID: ${cardId}`);
          continue;
        }
        
        const payload = {
          reservation_id: card.id,
          amount_usd: card.remainingBalance || 0,
          payment_channel: 'Do Not Charge',
          expedia_reservation_id: parseInt(card.id),
          created_at: new Date().toISOString(),
          type_of_transaction: 'Do Not Charge'
        };

        console.log('[Mass Do Not Charge] Sending request with payload:', payload);
        await doNotCharge(payload);
        console.log('[Mass Do Not Charge] Card processed successfully:', cardId);
      }
      
      console.log('[Mass Do Not Charge] All cards processed successfully');
      
      // Clear selection and close modal
      setSelectedCards([]);
      setShowMassDoNotCharge(false);
      
      // Refresh the table data
      onUpdate();
    } catch (error: any) {
      console.error('[Mass Do Not Charge] Error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const renderSortIcon = (key: keyof VirtualCard) => {
    if (sortConfig.key !== key) {
      return <ChevronDown className="h-4 w-4 text-gray-400" />;
    }
    return sortConfig.direction === 'asc' 
      ? <ChevronUp className="h-4 w-4 text-blue-500" />
      : <ChevronDown className="h-4 w-4 text-blue-500" />;
  };

  // Calculate pagination
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  const columns: ColumnConfig[] = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'guestName', label: 'Guest Name', sortable: true },
    { key: 'Hotel', label: 'Hotel', sortable: true },
    { key: 'checkInDate', label: 'Check In', sortable: true },
    { key: 'checkOutDate', label: 'Check Out', sortable: true },
    { key: 'remainingBalance', label: 'Balance', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'bookingSource', label: 'Source', sortable: true }
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
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
          <select
            value={pageSize}
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value={10}>10 per page</option>
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
          </select>
        </div>

        {selectedCards.length > 0 && (
          <button
            type="button"
            onClick={() => setShowMassDoNotCharge(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Mass Do Not Charge ({selectedCards.length})
          </button>
        )}
      </div>

      <div className="relative overflow-x-auto bg-white rounded-lg shadow">
        <table className="w-full text-sm text-left table-fixed">
          <colgroup>
            <col className="w-10" /> {/* Checkbox */}
            <col className="w-24" /> {/* ID */}
            <col className="w-48" /> {/* Guest Name */}
            <col className="w-48" /> {/* Hotel */}
            <col className="w-32" /> {/* Check In */}
            <col className="w-32" /> {/* Check Out */}
            <col className="w-32" /> {/* Amount */}
            <col className="w-32" /> {/* Status */}
          </colgroup>
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="p-4">
                <Checkbox
                  checked={selectedCards.length === cards.length && cards.length > 0}
                  onCheckedChange={(checked: boolean) => {
                    if (checked) {
                      setSelectedCards(cards);
                    } else {
                      setSelectedCards([]);
                    }
                  }}
                />
              </th>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => column.sortable && onSort(column.key)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.label}</span>
                    {column.sortable && <ArrowUpDown className="h-4 w-4" />}
                  </div>
                </th>
              ))}
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {cards.map((card) => (
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
                <td className="px-6 py-4 truncate text-sm text-gray-900">{card.id}</td>
                <td className="px-6 py-4 truncate font-medium text-gray-900">{card.guestName || 'N/A'}</td>
                <td className="px-6 py-4 truncate">{card.Hotel}</td>
                <td className="px-6 py-4 truncate">{card.checkInDate}</td>
                <td className="px-6 py-4 truncate">{card.checkOutDate}</td>
                <td className="px-6 py-4 truncate font-medium">{formatCurrency(card.remainingBalance, card.currency)}</td>
                <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                  <select
                    value={card.status}
                    onChange={async (e) => {
                      try {
                        console.log('[Status Update] Starting update:', {
                          cardId: card.id,
                          oldStatus: card.status,
                          newStatus: e.target.value
                        });
                        const updatedCard = await updateCardStatus(card.id, e.target.value);
                        console.log('[Status Update] Update successful');
                        
                        // Call onUpdate with the updated card
                        onUpdate(updatedCard);
                      } catch (error) {
                        console.error('[Status Update] Failed:', error);
                      }
                    }}
                    className={`px-2 py-1 rounded text-xs font-medium border-0 ${
                      card.status === 'Active' ? 'bg-green-100 text-green-800' : 
                      card.status === 'Waiting on Expedia' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}
                  >
                    {CARD_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-6 py-4 truncate text-sm text-gray-500">{card.bookingSource || 'Unknown'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {/* Actions */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              className={`px-3 py-1.5 border rounded text-sm font-medium ${
                currentPage === 1
                  ? 'text-gray-400 border-gray-200 bg-gray-50 cursor-not-allowed'
                  : 'text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              First
            </button>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-1.5 border rounded text-sm font-medium ${
                currentPage === 1
                  ? 'text-gray-400 border-gray-200 bg-gray-50 cursor-not-allowed'
                  : 'text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Previous
            </button>

            <div className="flex items-center space-x-1">
              {(() => {
                let pages = [];
                const maxVisiblePages = 5;
                const halfVisible = Math.floor(maxVisiblePages / 2);

                if (totalPages <= maxVisiblePages) {
                  pages = Array.from({ length: totalPages }, (_, i) => i + 1);
                } else {
                  let start = Math.max(1, currentPage - halfVisible);
                  let end = Math.min(totalPages, start + maxVisiblePages - 1);

                  if (end - start < maxVisiblePages - 1) {
                    start = Math.max(1, end - maxVisiblePages + 1);
                  }

                  if (start > 1) {
                    pages.push(1);
                    if (start > 2) pages.push('...');
                  }

                  for (let i = start; i <= end; i++) {
                    pages.push(i);
                  }

                  if (end < totalPages) {
                    if (end < totalPages - 1) pages.push('...');
                    pages.push(totalPages);
                  }
                }

                return pages.map((page, index) => {
                  if (page === '...') {
                    return (
                      <span key={`ellipsis-${index}`} className="px-2 py-1.5 text-sm text-gray-500">
                        ...
                      </span>
                    );
                  }

                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page as number)}
                      className={`min-w-[2.25rem] px-2 py-1.5 border rounded text-sm font-medium ${
                        currentPage === page
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                });
              })()}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-3 py-1.5 border rounded text-sm font-medium ${
                currentPage === totalPages
                  ? 'text-gray-400 border-gray-200 bg-gray-50 cursor-not-allowed'
                  : 'text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Next
            </button>
            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              className={`px-3 py-1.5 border rounded text-sm font-medium ${
                currentPage === totalPages
                  ? 'text-gray-400 border-gray-200 bg-gray-50 cursor-not-allowed'
                  : 'text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Last
            </button>
          </div>

          <div className="flex items-center space-x-4">
            <select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="border border-gray-300 rounded px-3 py-1.5 text-sm bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
            </select>

            <div className="text-sm text-gray-600">
              Showing {cards.length > 0 ? startIndex + 1 : 0} to {Math.min(startIndex + pageSize, totalItems)} of {totalItems} entries
            </div>
          </div>
        </div>
      </div>

      {selectedCard && (
        <ChargeCardModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          card={selectedCard}
          onUpdate={onUpdate}
        />
      )}

      {showMassDoNotCharge && (
        <MassDoNotChargeModal
          isOpen={true}
          onClose={() => setShowMassDoNotCharge(false)}
          selectedCards={selectedCards}
          onConfirm={handleConfirmMassDoNotCharge}
          isProcessing={isProcessing}
        />
      )}
    </div>
  );
}