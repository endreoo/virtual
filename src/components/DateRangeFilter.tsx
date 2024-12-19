import React from 'react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Box, Button } from '@mui/material';
import { enUS } from 'date-fns/locale';

interface DateRangeFilterProps {
  onDateRangeChange: (range: [Date | null, Date | null]) => void;
}

export function DateRangeFilter({ onDateRangeChange }: DateRangeFilterProps) {
  const [startDate, setStartDate] = React.useState<Date | null>(null);
  const [endDate, setEndDate] = React.useState<Date | null>(null);

  const handleStartDateChange = (date: Date | null) => {
    setStartDate(date);
    onDateRangeChange([date, endDate]);
  };

  const handleEndDateChange = (date: Date | null) => {
    setEndDate(date);
    onDateRangeChange([startDate, date]);
  };

  const handleReset = () => {
    setStartDate(null);
    setEndDate(null);
    onDateRangeChange([null, null]);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={enUS}>
      <Box sx={{ 
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        '& .MuiTextField-root': { 
          width: '200px',
        },
        '& .MuiInputBase-root': {
          height: '36px',
          fontSize: '0.875rem',
        },
        '& .MuiOutlinedInput-root': {
          '& fieldset': {
            borderColor: 'rgb(209, 213, 219)',
          },
          '&:hover fieldset': {
            borderColor: 'rgb(156, 163, 175)',
          },
          '&.Mui-focused fieldset': {
            borderColor: 'rgb(59, 130, 246)',
            borderWidth: '1px',
          },
        },
        '& .MuiInputLabel-root': {
          fontSize: '0.875rem',
        },
      }}>
        <DatePicker
          label="Check In From"
          value={startDate}
          onChange={handleStartDateChange}
          format="MM/dd/yyyy"
          slotProps={{
            textField: {
              size: "small",
              placeholder: "Start date"
            }
          }}
        />
        <DatePicker
          label="Check In To"
          value={endDate}
          onChange={handleEndDateChange}
          format="MM/dd/yyyy"
          minDate={startDate || undefined}
          slotProps={{
            textField: {
              size: "small",
              placeholder: "End date"
            }
          }}
        />
        {(startDate || endDate) && (
          <Button
            onClick={handleReset}
            variant="outlined"
            size="small"
            sx={{
              height: '36px',
              borderColor: 'rgb(209, 213, 219)',
              color: 'rgb(107, 114, 128)',
              '&:hover': {
                borderColor: 'rgb(156, 163, 175)',
                backgroundColor: 'rgb(249, 250, 251)',
              }
            }}
          >
            Reset
          </Button>
        )}
      </Box>
    </LocalizationProvider>
  );
}