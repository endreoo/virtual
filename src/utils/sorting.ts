import { VirtualCard } from '../types';

export type SortField = keyof VirtualCard;
export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

export function sortCards(cards: VirtualCard[], { field, direction }: SortConfig): VirtualCard[] {
  return [...cards].sort((a, b) => {
    const aValue = a[field];
    const bValue = b[field];

    // Handle undefined values
    if (aValue === undefined && bValue === undefined) return 0;
    if (aValue === undefined) return 1;
    if (bValue === undefined) return -1;

    // Compare values
    if (aValue === bValue) return 0;
    const comparison = aValue < bValue ? -1 : 1;
    return direction === 'asc' ? comparison : -comparison;
  });
}