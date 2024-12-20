import React, { useState, useRef, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import { Calendar, X } from 'lucide-react';
import 'react-datepicker/dist/react-datepicker.css';

interface DateRangeFilterProps {
  value: [Date | null, Date | null];
  onChange: (range: [Date | null, Date | null]) => void;
}

export function DateRangeFilter({ value, onChange }: DateRangeFilterProps): JSX.Element {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent): void {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleChange = (update: [Date | null, Date | null]): void => {
    onChange(update);
    if (update[1]) { // Close after selecting end date
      setIsOpen(false);
    }
  };

  const formatDateRange = (): string => {
    if (!value[0] && !value[1]) return 'Check-in Dates';
    
    const formatDate = (date: Date): string => {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    };

    if (value[0] && value[1]) {
      return `${formatDate(value[0])} - ${formatDate(value[1])}`;
    }
    return value[0] ? formatDate(value[0]) : 'Check-in Dates';
  };

  const handleClear = (e: React.MouseEvent<HTMLDivElement>): void => {
    e.stopPropagation();
    onChange([null, null]);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border ${
          value[0] || value[1]
            ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
            : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
        } transition-colors min-w-[280px] justify-between shadow-sm`}
      >
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium">{formatDateRange()}</span>
        </div>
        {(value[0] || value[1]) && (
          <div 
            role="button"
            tabIndex={0}
            onClick={handleClear}
            onKeyDown={(e) => e.key === 'Enter' && handleClear(e as unknown as React.MouseEvent<HTMLDivElement>)}
            className="cursor-pointer hover:bg-blue-100 rounded-full p-1"
          >
            <X className="w-4 h-4 text-blue-600" />
          </div>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50">
          <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-4">
            <DatePicker
              selected={value[0]}
              startDate={value[0]}
              endDate={value[1]}
              selectsRange={true}
              onChange={(update: [Date | null, Date | null]) => handleChange(update)}
              inline
              dateFormat="MMM d, yyyy"
              calendarClassName="shadow-none"
            />
          </div>
        </div>
      )}
    </div>
  );
}