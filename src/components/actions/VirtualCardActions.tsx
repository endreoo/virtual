import React from 'react';
import { MoreHorizontal, Edit, Trash, CreditCard } from 'lucide-react';
import { VirtualCard } from '../../types';

interface VirtualCardActionsProps {
  card: VirtualCard;
}

export function VirtualCardActions({ card }: VirtualCardActionsProps) {
  return (
    <div className="flex items-center space-x-2">
      <button
        className="p-1 hover:bg-gray-100 rounded-full"
        title="Edit"
      >
        <Edit className="h-4 w-4 text-gray-500" />
      </button>
      <button
        className="p-1 hover:bg-gray-100 rounded-full"
        title="Process Payment"
      >
        <CreditCard className="h-4 w-4 text-gray-500" />
      </button>
      <button
        className="p-1 hover:bg-gray-100 rounded-full"
        title="More Actions"
      >
        <MoreHorizontal className="h-4 w-4 text-gray-500" />
      </button>
    </div>
  );
}