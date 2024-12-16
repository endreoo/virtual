import React from 'react';

interface DateRangeFilterProps {
  value: [Date | null, Date | null];
  onChange: (dates: [Date | null, Date | null]) => void;
}

export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({ value, onChange }) => {
  return (
    <div className="flex gap-4">
      <input
        type="date"
        className="px-3 py-2 border rounded"
        onChange={(e) => onChange([new Date(e.target.value), value[1]])}
      />
      <input
        type="date"
        className="px-3 py-2 border rounded"
        onChange={(e) => onChange([value[0], new Date(e.target.value)])}
      />
    </div>
  );
};