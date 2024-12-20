import React, { useState, useRef, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import { Calendar, X } from 'lucide-react';
import "react-datepicker/dist/react-datepicker.css";

interface DateRangeFilterProps {
  value: [Date | null, Date | null];
  onChange: (range: [Date | null, Date | null]) => void;
}

export function DateRangeFilter({ value, onChange }: DateRangeFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleChange = (update: [Date | null, Date | null]) => {
    onChange(update);
    if (update[1]) { // Close after selecting end date
      setIsOpen(false);
    }
  };

  const formatDateRange = () => {
    if (!value[0] && !value[1]) return 'Check-in Dates';
    
    const formatDate = (date: Date) => {
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

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([null, null]);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border ${
          value[0] || value[1]
            ? 'bg-blue-50 border-blue-200 text-blue-700'
            : 'bg-white border-gray-300 text-gray-700'
        } hover:bg-blue-50 hover:border-blue-300 transition-colors min-w-[280px] justify-between`}
      >
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium">{formatDateRange()}</span>
        </div>
        {(value[0] || value[1]) && (
          <X 
            className="w-4 h-4 text-gray-400 hover:text-gray-600" 
            onClick={handleClear}
          />
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50 bg-white rounded-lg shadow-xl border border-gray-200">
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
      )}
    </div>
  );
}