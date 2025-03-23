import { useState } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';

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
      <input
        type="text"
        readOnly
        value={selectedDate ? format(new Date(selectedDate), 'dd/MM/yyyy') : 'DD/MM/YYYY'}
        onClick={() => setIsOpen(true)}
        placeholder="DD/MM/YYYY"
        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1984] focus:ring-1 focus:ring-[#7B1984] cursor-pointer"
      />
      
      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 w-[280px] z-50">
          <div className="p-4">
            {/* Calendar Header */}
            <div className="flex justify-between items-center mb-4">
              <select
                value={format(currentDate, 'MMMM')}
                onChange={(e) => {
                  const newDate = new Date(currentDate);
                  newDate.setMonth(new Date(Date.parse(e.target.value + " 1, 2000")).getMonth());
                  setCurrentDate(newDate);
                }}
                className="text-gray-900 font-medium bg-transparent border-none focus:outline-none cursor-pointer appearance-none pr-8"
                style={{
                  backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.5rem center',
                  backgroundSize: '1rem'
                }}
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
                className="text-gray-900 bg-transparent border-none focus:outline-none cursor-pointer appearance-none pl-2 pr-8"
                style={{
                  backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.5rem center',
                  backgroundSize: '1rem'
                }}
              >
                {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i).map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
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
                    className={`text-center py-2 text-sm rounded-lg hover:bg-purple-50
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
      )}
    </div>
  );
} 