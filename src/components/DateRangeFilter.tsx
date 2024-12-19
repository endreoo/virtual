import React from 'react';

interface DateRangeFilterProps {
  value: [Date | null, Date | null];
  onChange: (dates: [Date | null, Date | null]) => void;
}

export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({ value, onChange }) => {
  const formatDate = (date: Date | null): string => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };

  return (
    <div className="flex gap-4">
      <div className="flex flex-col">
        <label className="text-sm font-medium text-gray-700 mb-1">Check In Period (from)</label>
        <input
          type="date"
          value={formatDate(value[0])}
          className="px-3 py-2 border rounded"
          onChange={(e) => onChange([e.target.value ? new Date(e.target.value) : null, value[1]])}
        />
      </div>
      <div className="flex flex-col">
        <label className="text-sm font-medium text-gray-700 mb-1">to</label>
        <input
          type="date"
          value={formatDate(value[1])}
          className="px-3 py-2 border rounded"
          onChange={(e) => onChange([value[0], e.target.value ? new Date(e.target.value) : null])}
        />
      </div>
    </div>
  );
};