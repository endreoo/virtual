import React from 'react';
import { Check } from 'lucide-react';

interface CheckboxProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  className?: string;
}

export function Checkbox({ checked, onCheckedChange, className = '' }: CheckboxProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onCheckedChange?.(!checked)}
      className={`h-4 w-4 rounded border border-gray-300 flex items-center justify-center
        ${checked 
          ? 'bg-blue-600 border-blue-600' 
          : 'bg-white hover:bg-gray-50'
        }
        ${className}
      `}
    >
      {checked && <Check className="h-3 w-3 text-white" />}
    </button>
  );
} 