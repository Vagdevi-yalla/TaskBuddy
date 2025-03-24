import { useState } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { CalendarIcon } from '@heroicons/react/24/outline';

interface DatePickerProps {
  selectedDate: string;
  onChange: (date: string) => void;
}

export default function DatePicker({ selectedDate, onChange }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(selectedDate ? new Date(selectedDate) : new Date());

  const handlePrevMonth = () => {
    setCurrentDate(prevDate => subMonths(prevDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prevDate => addMonths(prevDate, 1));
  };

  const getDaysInMonth = () => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    return eachDayOfInterval({ start, end });
  };

  const handleDateSelect = (date: Date) => {
    onChange(format(date, 'yyyy-MM-dd'));
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1984] focus:ring-1 focus:ring-[#7B1984]"
      >
        <CalendarIcon className="h-5 w-5 text-gray-400" />
        <span className="text-gray-700">
          {selectedDate ? format(new Date(selectedDate), 'dd/MM/yyyy') : 'Select date'}
        </span>
      </button>
      
      {isOpen && (
        <>
          <div className="fixed inset-0 z-[100]" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 w-[280px] z-[101]">
            <div className="p-4">
              {/* Calendar Header */}
              <div className="flex justify-between items-center mb-4">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-1 hover:bg-gray-100 rounded-full"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div className="flex gap-2">
                  <select
                    value={format(currentDate, 'MMMM')}
                    onChange={(e) => {
                      const newDate = new Date(currentDate);
                      newDate.setMonth(new Date(Date.parse(e.target.value + " 1, 2000")).getMonth());
                      setCurrentDate(newDate);
                    }}
                    className="text-sm font-medium bg-transparent border-none focus:outline-none cursor-pointer"
                  >
                    {Array.from({ length: 12 }, (_, i) => new Date(0, i)).map((date) => (
                      <option key={format(date, 'MMMM')} value={format(date, 'MMMM')}>
                        {format(date, 'MMMM')}
                      </option>
                    ))}
                  </select>
                  <select
                    value={format(currentDate, 'yyyy')}
                    onChange={(e) => {
                      const newDate = new Date(currentDate);
                      newDate.setFullYear(parseInt(e.target.value));
                      setCurrentDate(newDate);
                    }}
                    className="text-sm bg-transparent border-none focus:outline-none cursor-pointer"
                  >
                    {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i).map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1 hover:bg-gray-100 rounded-full"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Calendar Days Header */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((day) => (
                  <div key={day} className="text-center text-sm text-gray-600 py-1">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {/* Previous month padding */}
                {Array.from({ length: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay() || 7 - 1 }).map((_, i) => (
                  <div key={`prev-${i}`} className="text-center py-2 text-sm text-gray-400">
                    {new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate() - i}
                  </div>
                )).reverse()}

                {/* Current month */}
                {getDaysInMonth().map((date) => {
                  const isSelected = selectedDate === format(date, 'yyyy-MM-dd');
                  const isToday = format(new Date(), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
                  
                  return (
                    <button
                      key={date.getTime()}
                      onClick={() => handleDateSelect(date)}
                      className={`text-center py-2 text-sm rounded hover:bg-purple-50
                        ${isSelected ? 'bg-[#7B1984] text-white' : ''}
                        ${isToday ? 'bg-purple-50' : ''}
                      `}
                    >
                      {date.getDate()}
                    </button>
                  );
                })}

                {/* Next month padding */}
                {Array.from({ length: (7 - new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDay()) % 7 }).map((_, i) => (
                  <div key={`next-${i}`} className="text-center py-2 text-sm text-gray-400">
                    {i + 1}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
} 