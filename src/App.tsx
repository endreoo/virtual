import React, { useState, useEffect, useMemo } from 'react';
import { VirtualCardTable } from './components/table/VirtualCardTable';
import { DashboardSummary } from './components/dashboard/DashboardSummary';
import { DateRangeFilter } from './components/DateRangeFilter';
import { Search } from 'lucide-react';
import { VirtualCard } from './types';
import { getReservations } from './utils/api';
import { DateRange } from '@mui/x-date-pickers-pro';
import { LicenseInfo } from '@mui/x-date-pickers-pro';

// Add MUI X Pro trial license key
LicenseInfo.setLicenseKey('MUI-X-c5a88c4b77-b12562-f56789-ac1234');

export function App(): JSX.Element {
  // Authentication states
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');

  // Application states
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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'Admin' && password === 'S@ccess912') {
      setIsAuthenticated(true);
      setLoginError('');
      localStorage.setItem('isAuthenticated', 'true');
    } else {
      setLoginError('Invalid credentials');
    }
  };

  // Check if user was previously authenticated
  useEffect(() => {
    const isAuth = localStorage.getItem('isAuthenticated');
    if (isAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const refreshReservations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getReservations();
      setReservations(data as VirtualCard[]);
    } catch (err: any) {
      console.error('Error fetching reservations:', err);
      setError(err.message || 'Failed to fetch reservations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      void refreshReservations();
    }
  }, [isAuthenticated]);

  const handleSort = (key: keyof VirtualCard) => {
    setSortConfig((prevConfig) => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const filterCards = (cards: VirtualCard[]) => {
    return cards.filter(card => {
      if (!card.checkInDate || typeof card.checkInDate !== 'string') return false;
      if (!card.remainingBalance || card.remainingBalance <= 0.49) return false;

      // Date range filter
      if (dateRange[0] || dateRange[1]) {
        const cardDate = new Date(card.checkInDate);
        const fromDate = dateRange[0];
        const toDate = dateRange[1];

        if (fromDate && toDate) {
          return cardDate >= fromDate && cardDate <= toDate;
        } else if (fromDate) {
          return cardDate >= fromDate;
        } else if (toDate) {
          return cardDate <= toDate;
        }
      }

      // If no date range is selected, include the card if it matches other filters
      const matchesSearch = !searchQuery || 
        (card.guestName?.toLowerCase() || '').includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'All Status' || 
        (statusFilter === 'Unknown' ? !card.status || card.status === 'Unknown' : card.status === statusFilter);

      return matchesSearch && matchesStatus;
    });
  };

  const filteredCards = useMemo(() => {
    if (!Array.isArray(reservations)) return [];
    
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const oneYearAgoStr = oneYearAgo.toISOString().split('T')[0];

    let filtered = filterCards(reservations);

    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key!];
        const bValue = b[sortConfig.key!];

        // Always put empty/unknown values at the bottom
        if (!aValue || aValue === 'Unknown') return 1;
        if (!bValue || bValue === 'Unknown') return -1;
        if (!aValue && !bValue) return 0;

        let comparison = 0;
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          // For bookingSource, strip out the "(booked X/X/XX)" part for sorting
          if (sortConfig.key === 'bookingSource') {
            const aSource = aValue.split(' (')[0];
            const bSource = bValue.split(' (')[0];
            comparison = aSource.localeCompare(bSource);
          } else {
            comparison = aValue.localeCompare(bValue);
          }
        } else {
          comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        }

        return sortConfig.direction === 'asc' ? comparison : -comparison;
      });
    }

    return filtered;
  }, [reservations, dateRange, searchQuery, statusFilter, sortConfig]);

  const paginatedCards = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredCards.slice(startIndex, startIndex + pageSize);
  }, [filteredCards, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredCards.length / pageSize);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, dateRange, pageSize]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
          <div>
            <h2 className="text-center text-3xl font-extrabold text-gray-900">Sign in</h2>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="username" className="sr-only">Username</label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {loginError && (
              <div className="text-red-500 text-sm text-center">{loginError}</div>
            )}

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Sign in
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Finance Dashboard</h1>
          <button
            onClick={() => {
              localStorage.removeItem('isAuthenticated');
              setIsAuthenticated(false);
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Logout
          </button>
        </div>
        
        <DashboardSummary cards={filteredCards} />

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[300px]">
              <DateRangeFilter onDateRangeChange={setDateRange} />
            </div>

            <div className="relative min-w-[200px]">
              <input
                type="text"
                placeholder="Search guest name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
              <svg
                className="absolute left-2.5 top-2 h-4 w-4 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            
            <div className="flex items-center gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option>All Status</option>
                <option>Active</option>
                <option>Recent</option>
                <option>Canceled</option>
                <option>No-show</option>
                <option>Reconciled - modified</option>
                <option>Unknown</option>
              </select>

              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow mt-4">
          <VirtualCardTable
            cards={paginatedCards}
            sortConfig={sortConfig}
            onSort={handleSort}
            onUpdate={(updatedCard) => {
              setReservations(prevReservations => 
                prevReservations.map(card => 
                  card.id === updatedCard.id ? updatedCard : card
                )
              );
            }}
          />
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t">
              <div className="text-sm text-gray-700">
                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredCards.length)} of {filteredCards.length} entries
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded ${
                    currentPage === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border'
                  }`}
                >
                  Previous
                </button>
                {(() => {
                  const pages = [];
                  const maxButtons = 5;
                  const halfMaxButtons = Math.floor(maxButtons / 2);

                  if (totalPages <= maxButtons) {
                    // Show all pages if total pages is less than max buttons
                    for (let i = 1; i <= totalPages; i++) {
                      pages.push(i);
                    }
                  } else {
                    // Always show first page
                    pages.push(1);

                    // Calculate start and end of middle section
                    let startPage = Math.max(2, currentPage - halfMaxButtons);
                    let endPage = Math.min(totalPages - 1, startPage + maxButtons - 3);
                    startPage = Math.max(2, endPage - maxButtons + 3);

                    // Add ellipsis after first page if needed
                    if (startPage > 2) {
                      pages.push('...');
                    }

                    // Add middle pages
                    for (let i = startPage; i <= endPage; i++) {
                      pages.push(i);
                    }

                    // Add ellipsis before last page if needed
                    if (endPage < totalPages - 1) {
                      pages.push('...');
                    }

                    // Always show last page
                    pages.push(totalPages);
                  }

                  return pages.map((page, index) => 
                    page === '...' ? (
                      <span key={`ellipsis-${index}`} className="px-3 py-1">...</span>
                    ) : (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page as number)}
                        className={`px-3 py-1 rounded ${
                          currentPage === page
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-50 border'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  );
                })()}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded ${
                    currentPage === totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border'
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}