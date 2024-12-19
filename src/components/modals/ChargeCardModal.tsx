import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { VirtualCard, Transaction, PaymentMethod, ActiveTab, PaymentMethodOption } from '../../types';
import { CreditCard, DollarSign, Send, CreditCard as StripeIcon, Globe, ClipboardCheck, XCircle, AlignLeft, ArrowUpCircle, ArrowDownCircle, AlertCircle, ExternalLink } from 'lucide-react';
import apiService from '../../utils/api';
import type { AxiosError } from 'axios';

interface ChargeCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: VirtualCard;
  onUpdate?: (updatedCard: VirtualCard) => void;
}

interface ApiErrorResponse {
  message: string;
  details?: string;
}

export function ChargeCardModal({ isOpen, onClose, card, onUpdate }: ChargeCardModalProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('info');
  const [amount, setAmount] = useState(card?.remainingBalance?.toString() || '0');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRawText, setShowRawText] = useState(false);
  const [notes, setNotes] = useState(card?.notes || '');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [transactionError, setTransactionError] = useState<string | null>(null);

  // Reset state when modal opens or card changes
  useEffect(() => {
    if (isOpen && card) {
      setActiveTab('info');
      setAmount(card.remainingBalance?.toString() || '0');
      setSelectedMethod(null);
      setError(null);
      setShowRawText(false);
      setTransactions([]);
      setLoadingTransactions(false);
      setTransactionError(null);
      // Set initial notes when modal opens
      setNotes(card.notes || '');
    }
  }, [isOpen, card]);

  // Fetch transactions when tab changes
  useEffect(() => {
    if (activeTab === 'transactions' && card?.id) {
      fetchTransactions();
    }
  }, [activeTab, card?.id]);

  const fetchTransactions = async () => {
    if (!card?.id) return;
    
    try {
      setLoadingTransactions(true);
      setTransactionError(null);
      const response = await apiService.get<Transaction[]>(`/api/cards/${card.id}/transactions`);
      setTransactions(response.data);
    } catch (err) {
      const error = err as AxiosError<ApiErrorResponse>;
      setTransactionError(error.response?.data?.message || error.message || 'Failed to fetch transactions');
    } finally {
      setLoadingTransactions(false);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '') {
      setAmount(value);
      return;
    }
    
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue < 0) {
      return;
    }
    
    setAmount(value);
  };

  const processFlutterwavePayment = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validate card details
      if (!card.expirationDate) {
        setError('Card expiration date is missing');
        return;
      }

      if (!card.cardNumber) {
        setError('Card number is missing');
        return;
      }

      if (!card.cvv) {
        setError('CVV is missing');
        return;
      }

      // Format card expiration date (assuming it's in MM/YY format)
      const expirationParts = card.expirationDate.split('/');
      if (expirationParts.length !== 2) {
        setError('Invalid expiration date format. Expected MM/YY');
        return;
      }

      const [expMonth, expYear] = expirationParts;
      
      // Validate amount
      const numericAmount = parseFloat(amount);
      if (isNaN(numericAmount) || numericAmount <= 0) {
        setError('Please enter a valid amount greater than 0');
        return;
      }

      // Format customer name (use hotel name and reservation ID if guest name is not available)
      const customerName = card.guestName || `${card.Hotel} - Reservation ${card.id}`;

      // Create the client payload
      const clientPayload = {
        card_id: card.id,
        card_number: card.cardNumber.replace(/\s/g, ''),
        cvv: card.cvv,
        expiry_month: expMonth,
        expiry_year: expYear,
        currency: card.currency,
        amount: numericAmount,
        email: 'guest@example.com',
        fullname: customerName,
        tx_ref: `tx-${card.id}-${Date.now()}`
      };
      
      // Let the backend handle the encryption and API call
      const response = await apiService.post<{
        status: string;
        message?: string;
        data?: {
          chargeResponseCode?: string;
        };
      }>('/api/process-payment/flutterwave', clientPayload);

      if (response.data.status === 'success') {
        // Handle successful payment
        console.log('Payment successful:', response.data);
        onClose();
      } else if (response.data.status === 'error') {
        setError(response.data.message || 'Payment failed. Please try again.');
      } else if (response.data.data?.chargeResponseCode === '02') {
        // Handle 3DS or additional validation
        setError('Additional validation required. Please contact support.');
      } else {
        setError(response.data.message || 'Payment failed. Please try again.');
      }
    } catch (err) {
      console.error('Payment processing error:', err);
      const error = err as AxiosError<{
        message?: string;
        details?: string;
      }>;
      const errorMessage = error.response?.data?.message || error.response?.data?.details || error.message || 'An error occurred while processing the payment.';
      setError(errorMessage);

      if (error.response?.status === 401) {
        console.error('Payment gateway authentication failed. API key might be missing or invalid.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedMethod) return;

    switch (selectedMethod) {
      case 'flutterwave':
        await processFlutterwavePayment();
        break;
      case 'stripe':
        // Stripe implementation will go here
        console.log('Stripe payment:', { amount, card });
        break;
      case 'manual':
        // Manual payment implementation will go here
        console.log('Manual payment:', { amount, card });
        break;
      case 'link':
        // Send payment link implementation will go here
        console.log('Send payment link:', { amount, card });
        break;
      case 'doNotCharge':
        try {
          setLoading(true);
          setError(null);
          // Update the card status to "do not charge"
          await apiService.post('/api/cards/do-not-charge', { 
            cardId: card.id,
            reason: 'Marked as do not charge via UI'
          });
          onClose();
        } catch (err) {
          const error = err as AxiosError<ApiErrorResponse>;
          setError(error.response?.data?.message || error.message || 'Failed to update card status');
        } finally {
          setLoading(false);
        }
        break;
    }
  };

  const handleSaveNotes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('[Notes] Saving notes for card:', { cardId: card.id, notes });
      const response = await apiService.post('/api/cards/update-notes', {
        cardId: card.id,
        notes
      });

      console.log('[Notes] API Response:', response.data);

      if (response.data.status === 'success') {
        // Create updated card with new notes
        const updatedCard = { 
          ...card,
          notes: response.data.notes || notes // Use response notes or local notes as fallback
        };
        
        // Update local state
        setNotes(updatedCard.notes);
        
        // Show success message
        setError('Notes saved successfully');
        
        // Call onUpdate with the updated card
        if (onUpdate) {
          onUpdate(updatedCard);
        }

        // Wait a bit before clearing the success message
        setTimeout(() => {
          setError(null);
        }, 2000);
      } else {
        throw new Error(response.data.message || 'Failed to save notes');
      }
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      console.error('[Notes] Error saving notes:', error);
      setError(error.response?.data?.message || error.message || 'Failed to save notes');
    } finally {
      setLoading(false);
    }
  };

  const renderTransactionIcon = (transaction: Transaction) => {
    switch (transaction.type) {
      case 'payment':
        return <ArrowDownCircle className="h-5 w-5 text-green-500" />;
      case 'refund':
        return <ArrowUpCircle className="h-5 w-5 text-red-500" />;
      case 'adjustment':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: card.currency
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const paymentMethods: PaymentMethodOption[] = [
    {
      id: 'flutterwave',
      name: 'Flutterwave',
      icon: Globe,
      description: 'Process payment via Flutterwave',
      color: 'text-orange-500',
      bgHover: 'hover:bg-orange-50',
      bgSelected: 'bg-orange-50 ring-orange-500'
    },
    {
      id: 'stripe',
      name: 'Stripe',
      icon: StripeIcon,
      description: 'Process payment via Stripe',
      color: 'text-purple-500',
      bgHover: 'hover:bg-purple-50',
      bgSelected: 'bg-purple-50 ring-purple-500'
    },
    {
      id: 'manual',
      name: 'Manual',
      icon: ClipboardCheck,
      description: 'Record manual payment',
      color: 'text-blue-500',
      bgHover: 'hover:bg-blue-50',
      bgSelected: 'bg-blue-50 ring-blue-500'
    },
    {
      id: 'link',
      name: 'Send Link',
      icon: Send,
      description: 'Send payment link to guest',
      color: 'text-green-500',
      bgHover: 'hover:bg-green-50',
      bgSelected: 'bg-green-50 ring-green-500'
    },
    {
      id: 'doNotCharge',
      name: 'Do Not Charge',
      icon: XCircle,
      description: 'Mark this card as do not charge',
      color: 'text-red-500',
      bgHover: 'hover:bg-red-50',
      bgSelected: 'bg-red-50 ring-red-500'
    }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reservation Details"
      maxWidth="max-w-5xl"
    >
      {card ? (
        <div className="space-y-6">
          {error && (
            <div className={`${
              error === 'Notes saved successfully' 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            } rounded-lg p-4`}>
              <div className="flex items-center gap-3">
                <div className={`text-sm ${
                  error === 'Notes saved successfully' 
                    ? 'text-green-700' 
                    : 'text-red-700'
                }`}>{error}</div>
              </div>
            </div>
          )}

          {/* Header Info */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-blue-500" />
              <div className="text-sm text-blue-700">
                {card.guestName || `${card.Hotel} - Reservation ${card.id}`}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('info')}
                className={`py-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === 'info'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                Information
              </button>
              <button
                onClick={() => setActiveTab('payment')}
                className={`py-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === 'payment'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                Payment
              </button>
              <button
                onClick={() => setActiveTab('notes')}
                className={`py-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === 'notes'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                Notes
              </button>
              <button
                onClick={() => setActiveTab('transactions')}
                className={`py-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === 'transactions'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                Transactions
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="mt-6">
            {activeTab === 'info' && (
              <div className="grid grid-cols-2 gap-6">
                {/* Card Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Card Information</h3>
                  {card.bookingSource?.toLowerCase().includes('booking.com') ? (
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                      <div className="flex items-center gap-2 text-blue-600 hover:text-blue-800">
                        <a 
                          href={card.fullSidePanelText} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2"
                        >
                          Click here to view card details on Booking.com
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Card Number</p>
                          <p className="font-medium">{card.cardNumber || 'Not available'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Expiration</p>
                          <p className="font-medium">{card.expirationDate || 'Not available'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">CVV</p>
                          <p className="font-medium">{card.cvv || 'Not available'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Card Status</p>
                          <p className="font-medium">{card.card_status || 'Unknown'}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Reservation Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Reservation Details</h3>
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Guest</p>
                        <p className="font-medium">{card.guestName || 'Not available'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Hotel</p>
                        <p className="font-medium">{card.Hotel}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Check In</p>
                        <p className="font-medium">{card.checkInDate}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Check Out</p>
                        <p className="font-medium">{card.checkOutDate}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Balance</p>
                        <p className="font-medium">{card.currency} {card.remainingBalance}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Status</p>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full
                          ${card.status === 'active' ? 'bg-green-100 text-green-800' : ''}
                          ${card.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                          ${card.status === 'completed' ? 'bg-blue-100 text-blue-800' : ''}`}
                        >
                          {card.status ? card.status.charAt(0).toUpperCase() + card.status.slice(1) : 'Unknown'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Raw Text Section */}
                <div className="col-span-2">
                  <button
                    onClick={() => setShowRawText(!showRawText)}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm mb-2"
                  >
                    <AlignLeft className="h-4 w-4" />
                    {showRawText ? 'Hide' : 'Show'} Raw Text
                  </button>
                  {showRawText && (
                    <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                      <pre className="whitespace-pre-wrap text-sm text-gray-600 font-mono">
                        {card.fullSidePanelText || 'No raw text available'}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'payment' && (
              <div className="grid grid-cols-2 gap-6">
                {/* Payment Form */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Amount to Charge
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <DollarSign className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="number"
                        value={amount}
                        onChange={handleAmountChange}
                        className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-12 sm:text-sm border-gray-300 rounded-md"
                        placeholder="0.00"
                        step="0.01"
                        required
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">{card.currency}</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Methods */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Select Payment Method
                    </label>
                    <div className="grid grid-cols-1 gap-3">
                      {paymentMethods.map((method) => {
                        const Icon = method.icon;
                        return (
                          <div
                            key={method.id}
                            className={`relative rounded-lg border p-4 cursor-pointer transition-all
                              ${selectedMethod === method.id ? method.bgSelected + ' ring-2' : 'hover:border-gray-400 ' + method.bgHover}
                            `}
                            onClick={() => setSelectedMethod(method.id as PaymentMethod)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <Icon className={`h-5 w-5 ${method.color} mr-3`} />
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{method.name}</p>
                                  <p className="text-sm text-gray-500">{method.description}</p>
                                </div>
                              </div>
                              <div className={`h-4 w-4 rounded-full border flex items-center justify-center
                                ${selectedMethod === method.id ? method.color + ' border-current' : 'border-gray-300'}
                              `}>
                                {selectedMethod === method.id && (
                                  <div className={`h-2 w-2 rounded-full ${method.color.replace('text-', 'bg-')}`} />
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Process Payment Button */}
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={onClose}
                      disabled={loading}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={!selectedMethod || loading}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Processing...
                        </>
                      ) : (
                        'Process Payment'
                      )}
                    </button>
                  </div>
                </div>

                {/* Payment Instructions */}
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Instructions</h3>
                  <div className="space-y-4 text-sm text-gray-600">
                    <p>1. Enter the amount you want to charge</p>
                    <p>2. Select your preferred payment method</p>
                    <p>3. Review the payment details carefully</p>
                    <p>4. Click "Process Payment" to complete the transaction</p>
                    <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                      <p className="text-yellow-800 font-medium">Important Notes:</p>
                      <ul className="list-disc list-inside mt-2 space-y-1 text-yellow-700">
                        <li>Verify the amount before processing</li>
                        <li>Check the card expiration date</li>
                        <li>Ensure the guest name matches</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notes' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reservation Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full h-48 p-4 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter notes about this reservation..."
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleSaveNotes}
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 inline-flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Saving...
                      </>
                    ) : (
                      'Save Notes'
                    )}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'transactions' && (
              <div className="space-y-6">
                {/* Transaction Summary */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="text-sm text-gray-500">Initial Balance</div>
                    <div className="text-lg font-medium text-gray-900">
                      {formatAmount(card.initialBalance || card.remainingBalance)}
                    </div>
                  </div>
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="text-sm text-gray-500">Current Balance</div>
                    <div className="text-lg font-medium text-gray-900">
                      {formatAmount(card.remainingBalance)}
                    </div>
                  </div>
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="text-sm text-gray-500">Last Updated</div>
                    <div className="text-lg font-medium text-gray-900">
                      {card.lastScrapedAt ? formatDate(card.lastScrapedAt) : 'N/A'}
                    </div>
                  </div>
                </div>

                {/* Transaction List */}
                {loadingTransactions ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                    <div className="mt-2 text-gray-500">Loading transactions...</div>
                  </div>
                ) : transactionError ? (
                  <div className="text-center py-8 text-red-500">
                    {transactionError}
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No transactions found
                  </div>
                ) : (
                  <div className="overflow-hidden border border-gray-200 rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance After</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {transactions.map((transaction) => (
                          <tr key={transaction.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                {renderTransactionIcon(transaction)}
                                <span className="ml-2 text-sm text-gray-900 capitalize">{transaction.type}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(transaction.createdAt)}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              <div className="flex flex-col">
                                <span>{transaction.description}</span>
                                {transaction.referenceNumber && (
                                  <span className="text-xs text-gray-500">Ref: {transaction.referenceNumber}</span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span className={`font-medium ${
                                transaction.type === 'payment' ? 'text-green-600' : 
                                transaction.type === 'refund' ? 'text-red-600' : 
                                'text-gray-900'
                              }`}>
                                {formatAmount(transaction.amount)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatAmount(transaction.balanceAfter)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                                ${transaction.status === 'success' ? 'bg-green-100 text-green-800' : 
                                  transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                  'bg-red-100 text-red-800'}`}>
                                {transaction.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-4 text-center text-gray-500">
          Loading reservation details...
        </div>
      )}
    </Modal>
  );
}