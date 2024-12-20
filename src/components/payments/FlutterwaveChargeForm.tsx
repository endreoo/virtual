import React, { useState } from 'react';
import { VirtualCard } from '../../types';
import axios from 'axios';

interface FlutterwaveChargeFormProps {
  card: VirtualCard;
  onSuccess?: () => void;
}

interface CardDetails {
  number: string;
  cvv: string;
  expiryMonth: string;
  expiryYear: string;
}

const baseURL = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000' 
  : `${window.location.protocol}//${window.location.hostname}`;

export function FlutterwaveChargeForm({ card, onSuccess }: FlutterwaveChargeFormProps) {
  const [cardDetails, setCardDetails] = useState<CardDetails>({
    number: '',
    cvv: '',
    expiryMonth: '',
    expiryYear: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Remove any spaces from card number
    const sanitizedCardNumber = cardDetails.number.replace(/\s/g, '');

    const payload = {
      amount: card.remainingBalance,
      currency: card.currency || 'USD',
      email: 'guest@hotelonline.co',
      card: {
        card_number: sanitizedCardNumber,
        cvv: cardDetails.cvv,
        expiry_month: cardDetails.expiryMonth.padStart(2, '0'),
        expiry_year: cardDetails.expiryYear.padStart(2, '0')
      }
    };

    console.log('Sending payment request:', {
      url: `${baseURL}/api/process-payment/flutterwave`,
      payload: {
        ...payload,
        card: {
          ...payload.card,
          card_number: '****' + payload.card.card_number.slice(-4),
          cvv: '***'
        }
      }
    });

    try {
      const response = await axios.post(`${baseURL}/api/process-payment/flutterwave`, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      console.log('Payment response:', response.data);

      if (response.data.success) {
        onSuccess?.();
      } else {
        setError(response.data.message || 'Payment failed');
      }
    } catch (err: any) {
      console.error('Payment error:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      setError(err.response?.data?.message || 'Payment processing failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Format card number with spaces every 4 digits
    let value = e.target.value.replace(/\s/g, '');
    if (value.length > 16) value = value.slice(0, 16);
    const formatted = value.replace(/(\d{4})/g, '$1 ').trim();
    setCardDetails({ ...cardDetails, number: formatted });
  };

  const handleExpiryMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 2) value = value.slice(0, 2);
    if (parseInt(value) > 12) value = '12';
    setCardDetails({ ...cardDetails, expiryMonth: value });
  };

  const handleExpiryYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 2) value = value.slice(0, 2);
    setCardDetails({ ...cardDetails, expiryYear: value });
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 4) value = value.slice(0, 4);
    setCardDetails({ ...cardDetails, cvv: value });
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Payment Details</h3>
        <div className="bg-gray-50 p-3 rounded-lg mb-4">
          <p className="text-sm text-gray-600">Guest: {card.guestName}</p>
          <p className="text-sm text-gray-600">Hotel: {card.Hotel}</p>
          <p className="text-sm text-gray-600">Amount: {card.remainingBalance} {card.currency || 'USD'}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700">
              Card Number
            </label>
            <input
              type="text"
              id="cardNumber"
              value={cardDetails.number}
              onChange={handleCardNumberChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="4111 1111 1111 1111"
              required
              pattern="\d*"
              inputMode="numeric"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label htmlFor="expiryMonth" className="block text-sm font-medium text-gray-700">
                Month
              </label>
              <input
                type="text"
                id="expiryMonth"
                value={cardDetails.expiryMonth}
                onChange={handleExpiryMonthChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="MM"
                required
                pattern="\d*"
                inputMode="numeric"
              />
            </div>

            <div>
              <label htmlFor="expiryYear" className="block text-sm font-medium text-gray-700">
                Year
              </label>
              <input
                type="text"
                id="expiryYear"
                value={cardDetails.expiryYear}
                onChange={handleExpiryYearChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="YY"
                required
                pattern="\d*"
                inputMode="numeric"
              />
            </div>

            <div>
              <label htmlFor="cvv" className="block text-sm font-medium text-gray-700">
                CVV
              </label>
              <input
                type="text"
                id="cvv"
                value={cardDetails.cvv}
                onChange={handleCvvChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="123"
                required
                pattern="\d*"
                inputMode="numeric"
              />
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-600 mt-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Processing...' : 'Pay Now'}
          </button>
        </form>
      </div>
    </div>
  );
}