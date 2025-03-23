import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { COLORS } from '../../constants/colors';

interface CustomDatePickerProps {
  selectedDate: string | null;
  onDateSelect: (date: string) => void;
  onClose: () => void;
}

export const CustomDatePicker = ({ selectedDate, onDateSelect, onClose }: CustomDatePickerProps) => {
  const [currentDate, setCurrentDate] = useState(selectedDate ? new Date(selectedDate) : new Date());
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const handlePrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const handleDateSelect = (date: Date) => {
    onDateSelect(format(date, 'yyyy-MM-dd'));
    onClose();
  };

  return (
    <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg p-4 w-[280px] z-50">
      <div className="flex justify-between items-center mb-4">
        <button onClick={handlePrevMonth} className="p-1 hover:bg-gray-100 rounded-full">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 12L6 8L10 4" stroke={COLORS.text.secondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <span className="text-sm font-medium">{format(currentDate, 'MMMM yyyy')}</span>
        <button onClick={handleNextMonth} className="p-1 hover:bg-gray-100 rounded-full">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 4L10 8L6 12" stroke={COLORS.text.secondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
      
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-xs text-gray-500">
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => (
          <button
            key={index}
            onClick={() => handleDateSelect(day)}
            className={`p-2 text-sm rounded-full hover:bg-gray-100 ${
              !isSameMonth(day, currentDate) ? 'text-gray-400' : ''
            } ${
              selectedDate && isSameDay(day, new Date(selectedDate))
                ? `bg-[${COLORS.primary}] text-white hover:bg-[${COLORS.primary}]`
                : ''
            }`}
          >
            {format(day, 'd')}
          </button>
        ))}
      </div>
    </div>
  );
}; 