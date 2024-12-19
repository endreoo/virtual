import React from 'react';
import { Modal } from '../ui/Modal';
import { ExternalLink, User, Calendar, CreditCard, DollarSign, AlertTriangle, AlignLeft } from 'lucide-react';
import type { VirtualCard } from '../../types/index';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: VirtualCard;
}

export function InfoModal({ isOpen, onClose, card }: InfoModalProps) {
  const [showRawText, setShowRawText] = React.useState(false);
  const formatText = (text: string) => {
    // Guest Information
    const guestMatch = text.match(/Pre-stay (.*?) \+(\d+.*?) #(\d+)/);
    const dateMatch = text.match(/(\d{1,2}\/\d{1,2}\/\d{2,4})\s*-\s*(\d{1,2}\/\d{1,2}\/\d{2,4})/);
    const bookingSourceMatch = text.match(/(\w+)\s*\(booked\s+([^)]+)\)/);
    const roomMatch = text.match(/(\w+,\s*[^P]+)/);
    
    // Payment Information
    const cardMatch = text.match(/(\d{4}\s*\d{4}\s*\d{4}\s*\d{4})/);
    const expiryMatch = text.match(/Expires\s+CVV\s+(\d{2}\/\d{4})\s+(\d{3})/);
    const amountMatch = text.match(/Amount to charge USD\s*([\d.]+)/);
    
    // Payment Summary
    const totalPaymentMatch = text.match(/Total guest payment USD\s*([\d.]+)/);
    const compensationMatch = text.match(/Expedia compensation USD\s*([\d.]+)/);
    const totalPayoutMatch = text.match(/Your total payout USD\s*([\d.]+)/);

    return {
      guestName: guestMatch?.[1] || '',
      phone: guestMatch?.[2] || '',
      bookingId: guestMatch?.[3] || '',
      checkIn: dateMatch?.[1] || '',
      checkOut: dateMatch?.[2] || '',
      bookingSource: bookingSourceMatch?.[1] || '',
      bookingDate: bookingSourceMatch?.[2] || '',
      roomType: roomMatch?.[1] || '',
      cardNumber: cardMatch?.[1] || '',
      expiry: expiryMatch?.[1] || '',
      cvv: expiryMatch?.[2] || '',
      amountToCharge: amountMatch?.[1] || '',
      totalPayment: totalPaymentMatch?.[1] || '',
      compensation: compensationMatch?.[1] || '',
      totalPayout: totalPayoutMatch?.[1] || ''
    };
  };

  const info = formatText(card.fullSidePanelText || '');

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Reservation Information">
      <div className="space-y-6 max-h-[70vh] overflow-y-auto p-6">
        {card.bookingSource?.toLowerCase() === 'booking.com' ? (
          <div className="flex items-center gap-2 text-blue-600 hover:text-blue-800">
            <a 
              href={card.fullSidePanelText} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              Click here for more information
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Guest Information */}
            <div className="bg-gradient-to-r from-blue-50 to-white rounded-lg border border-blue-100 p-4">
              <div className="flex items-center gap-2 text-blue-700 mb-3">
                <User className="h-5 w-5" />
                <h3 className="font-medium">Guest Information</h3>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-blue-600">Guest Name</p>
                  <p className="font-medium text-gray-900">{info.guestName}</p>
                </div>
                <div>
                  <p className="text-blue-600">Phone</p>
                  <p className="font-medium text-gray-900">{info.phone}</p>
                </div>
                <div>
                  <p className="text-blue-600">Booking ID</p>
                  <p className="font-medium text-gray-900">#{info.bookingId}</p>
                </div>
                <div>
                  <p className="text-blue-600">Source</p>
                  <p className="font-medium text-gray-900">{info.bookingSource} (booked {info.bookingDate})</p>
                </div>
              </div>
            </div>

            {/* Stay Details */}
            <div className="bg-gradient-to-r from-green-50 to-white rounded-lg border border-green-100 p-4">
              <div className="flex items-center gap-2 text-green-700 mb-3">
                <Calendar className="h-5 w-5" />
                <h3 className="font-medium">Stay Details</h3>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-green-600">Check In</p>
                  <p className="font-medium text-gray-900">{info.checkIn}</p>
                </div>
                <div>
                  <p className="text-green-600">Check Out</p>
                  <p className="font-medium text-gray-900">{info.checkOut}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-green-600">Room Type</p>
                  <p className="font-medium text-gray-900">{info.roomType}</p>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-gradient-to-r from-purple-50 to-white rounded-lg border border-purple-100 p-4">
              <div className="flex items-center gap-2 text-purple-700 mb-3">
                <CreditCard className="h-5 w-5" />
                <h3 className="font-medium">Payment Information</h3>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-purple-600">Card Number</p>
                  <p className="font-mono font-medium text-gray-900">{info.cardNumber}</p>
                </div>
                <div>
                  <p className="text-purple-600">Expiry / CVV</p>
                  <p className="font-mono font-medium text-gray-900">{info.expiry} / {info.cvv}</p>
                </div>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="bg-gradient-to-r from-indigo-50 to-white rounded-lg border border-indigo-100 p-4">
              <div className="flex items-center gap-2 text-indigo-700 mb-3">
                <DollarSign className="h-5 w-5" />
                <h3 className="font-medium">Payment Summary</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-indigo-600">Total Guest Payment</span>
                  <span className="font-medium text-gray-900">USD {info.totalPayment}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-indigo-600">Platform Compensation</span>
                  <span className="font-medium text-gray-900">USD {info.compensation}</span>
                </div>
                <div className="flex justify-between font-medium text-base pt-2 border-t border-indigo-100">
                  <span className="text-indigo-800">Your Total Payout</span>
                  <span className="text-indigo-800">USD {info.totalPayout}</span>
                </div>
              </div>
            </div>

            {/* Important Notes */}
            <div className="bg-gradient-to-r from-amber-50 to-white rounded-lg border border-amber-200 p-4">
              <div className="flex items-start gap-2 text-amber-800">
                <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium mb-1">Important Notes</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>You can charge this card on the guest's check-in date</li>
                    <li>Collect the guest's credit card for any incidentals</li>
                    <li>Incidentals shouldn't be charged to the virtual card</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Raw Text Toggle */}
            <button
              onClick={() => setShowRawText(!showRawText)}
              className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm"
            >
              <AlignLeft className="h-4 w-4" />
              {showRawText ? 'Hide' : 'Show'} Raw Text
            </button>

            {/* Raw Text Section */}
            {showRawText && (
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                <pre className="whitespace-pre-wrap text-sm text-gray-600 font-mono">
                  {card.fullSidePanelText}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}