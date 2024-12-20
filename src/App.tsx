import React, { useState, useEffect, useMemo } from 'react';
import { VirtualCardTable } from './components/table/VirtualCardTable';
import { DashboardSummary } from './components/dashboard/DashboardSummary';
import { DateRangeFilter } from './components/DateRangeFilter';
import { Search, LogOut } from 'lucide-react';
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
  const [showChargeableOnly, setShowChargeableOnly] = useState(true);
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
      // Always check for checkInDate
      if (!card.checkInDate) return false;

      // Search filter
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = 
          card.guestName?.toLowerCase().includes(searchLower) ||
          card.Hotel?.toLowerCase().includes(searchLower) ||
          card.id?.toString().includes(searchLower);
        
        if (!matchesSearch) return false;
      }

      // Date range filter
      if (dateRange[0] || dateRange[1]) {
        const checkInDate = new Date(card.checkInDate);
        // Reset time part to compare dates only
        checkInDate.setHours(0, 0, 0, 0);
        
        if (dateRange[0]) {
          const startDate = new Date(dateRange[0]);
          startDate.setHours(0, 0, 0, 0);
          if (checkInDate < startDate) return false;
        }
        
        if (dateRange[1]) {
          const endDate = new Date(dateRange[1]);
          endDate.setHours(0, 0, 0, 0);
          if (checkInDate > endDate) return false;
        }
      }

      // Chargeable only filter - apply last
      if (showChargeableOnly) {
        return card.remainingBalance !== undefined && card.remainingBalance >= 0.49;
      }

      // If not showing chargeable only, include all records
      return true;
    });
  };

  const sortedCards = useMemo(() => {
    const filteredCards = filterCards(reservations);
    if (!sortConfig.key) return filteredCards;

    return [...filteredCards].sort((a, b) => {
      const key = sortConfig.key as keyof VirtualCard;
      if (!key) return 0;
      
      const aValue = a[key];
      const bValue = b[key];

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [reservations, sortConfig, dateRange, searchQuery, showChargeableOnly]);

  const paginatedCards = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedCards.slice(startIndex, startIndex + pageSize);
  }, [sortedCards, currentPage, pageSize]);

  const handleCardUpdate = (updatedCard?: VirtualCard) => {
    if (updatedCard) {
      setReservations(prev => 
        prev.map(card => card.id === updatedCard.id ? updatedCard : card)
      );
    } else {
      refreshReservations();
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, dateRange, pageSize, showChargeableOnly]);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Sign in to your account
            </h2>
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
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-semibold text-gray-900">Virtual Cards Dashboard</h1>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <DashboardSummary cards={sortedCards} />
        </div>

        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="w-full md:w-auto">
              <DateRangeFilter 
                value={dateRange} 
                onChange={setDateRange} 
              />
            </div>
            
            <div className="relative w-full md:w-72">
              <input
                type="text"
                placeholder="Search by guest, hotel, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg">
          <VirtualCardTable 
            cards={paginatedCards}
            setCards={setReservations}
            sortConfig={sortConfig}
            onSort={handleSort}
            onUpdate={handleCardUpdate}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            pageSize={pageSize}
            setPageSize={setPageSize}
            totalItems={sortedCards.length}
            showChargeableOnly={showChargeableOnly}
            setShowChargeableOnly={setShowChargeableOnly}
          />
        </div>
      </div>
    </div>
  );
}

export default App;