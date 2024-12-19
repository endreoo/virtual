import React, { useState, useEffect, useMemo } from 'react';
import { VirtualCardList } from './components/VirtualCardList';
import { VirtualCardTable } from './components/table/VirtualCardTable';
import { DashboardSummary } from './components/dashboard/DashboardSummary';
import { DateRangeFilter } from './components/DateRangeFilter';
import { Search } from 'lucide-react';
import { VirtualCard } from './types';

function App(): JSX.Element {
  console.log('App component rendering...');
  
  const [viewMode, setViewMode] = useState<'list' | 'table'>('table');
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('All Status');
  const [reservations, setReservations] = useState<VirtualCard[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof VirtualCard | null;
    direction: 'asc' | 'desc';
  }>({
    key: 'checkInDate',
    direction: 'desc'
  });

  const handleSort = (key: keyof VirtualCard) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'desc' ? 'asc' : 'desc'
    });
  };

  // Memoize filtered cards to prevent unnecessary recalculations
  const filteredCards = useMemo(() => {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const oneYearAgoStr = oneYearAgo.toISOString().split('T')[0];

    const filtered = reservations.filter((card: VirtualCard) => {
      // Filter out old check-in dates
      if (card.checkInDate < oneYearAgoStr) {
        return false;
      }

      const matchesDate = !dateRange[0] || !dateRange[1] || 
        (card.checkInDate >= dateRange[0].toISOString().split('T')[0] && 
         card.checkInDate <= dateRange[1].toISOString().split('T')[0]);
      
      const matchesSearch = (card.guestName?.toLowerCase() || '').includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'All Status' || card.status === statusFilter.toLowerCase();

      return matchesDate && matchesSearch && matchesStatus;
    });

    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key!];
        const bValue = b[sortConfig.key!];

        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;

        let comparison = 0;
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          comparison = aValue.localeCompare(bValue);
        } else if (typeof aValue === 'number' && typeof bValue === 'number') {
          comparison = aValue - bValue;
        } else {
          comparison = String(aValue).localeCompare(String(bValue));
        }

        return sortConfig.direction === 'desc' ? -comparison : comparison;
      });
    }

    return filtered;
  }, [reservations, dateRange, searchQuery, statusFilter, sortConfig]);

  // Memoize paginated cards
  const paginatedCards = useMemo(() => {
    return filteredCards.slice(
      (currentPage - 1) * pageSize,
      currentPage * pageSize
    );
  }, [filteredCards, currentPage, pageSize]);

  useEffect(() => {
    console.log('[Frontend] Setting up data fetch');
    const controller = new AbortController();
    let isSubscribed = true;
    
    const fetchReservations = async (): Promise<void> => {
      if (!isSubscribed) return;
      
      console.log('[Frontend] Starting to fetch reservations...');
      try {
        setLoading(true);
        console.log('[Frontend] Making API request to /api/reservations');
        const response = await fetch('/api/reservations', {
          signal: controller.signal,
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.details || `HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        if (isSubscribed) {
          console.log(`[Frontend] Received ${data.length} reservations`);
          setReservations(data);
          setError(null);
        }
      } catch (err: unknown) {
        if (!isSubscribed) return;
        
        if (err instanceof Error) {
          if (err.name === 'AbortError') {
            console.log('[Frontend] Request was aborted');
            return;
          }
          console.error('[Frontend] Error fetching reservations:', err.message);
          setError(err.message);
        } else {
          console.error('[Frontend] Unknown error fetching reservations:', err);
          setError('Failed to fetch reservations');
        }
      } finally {
        if (isSubscribed) {
          setLoading(false);
          console.log('[Frontend] Fetch operation completed');
        }
      }
    };

    void fetchReservations();
    
    return () => {
      console.log('[Frontend] Cleanup - cancelling fetch');
      isSubscribed = false;
      controller.abort();
    };
  }, []); // Empty dependency array to run only once

  const totalPages = Math.ceil(filteredCards.length / pageSize);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i);
      }
    }

    for (let i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    return rangeWithDots;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading reservations...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Finance Dashboard</h1>
        
        <DashboardSummary cards={reservations} />

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Virtual Cards</h2>
          
          <div className="flex justify-between items-center gap-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search cards..."
                  value={searchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <select
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="border border-gray-300 rounded-lg px-4 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option>All Status</option>
                <option>Active</option>
                <option>Pending</option>
                <option>Completed</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-4">
            <DateRangeFilter value={dateRange} onChange={setDateRange} />
          </div>
          <VirtualCardTable 
            cards={paginatedCards} 
            sortConfig={sortConfig}
            onSort={handleSort}
          />
          {filteredCards.length === 0 && !loading && (
            <div className="p-8 text-center text-gray-500">
              No reservations found
            </div>
          )}
          
          {/* Pagination Controls */}
          {filteredCards.length > 0 && (
            <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
              <div className="flex flex-1 justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(currentPage * pageSize, filteredCards.length)}
                    </span>{' '}
                    of <span className="font-medium">{filteredCards.length}</span> results
                  </p>
                </div>
                <div>
                  <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                    >
                      <span className="sr-only">Previous</span>
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                      </svg>
                    </button>
                    {getPageNumbers().map((pageNum, index) => (
                      <button
                        key={index}
                        onClick={() => typeof pageNum === 'number' ? handlePageChange(pageNum) : undefined}
                        disabled={pageNum === '...'}
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                          pageNum === currentPage
                            ? 'z-10 bg-blue-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                            : pageNum === '...'
                            ? 'text-gray-700'
                            : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                    >
                      <span className="sr-only">Next</span>
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;