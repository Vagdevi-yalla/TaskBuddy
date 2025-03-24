import { useState, useRef, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';

interface RelativeDatePickerProps {
  selectedDate: string;
  onChange: (date: string) => void;
  placeholder?: string;
}

export default function RelativeDatePicker({ selectedDate, onChange, placeholder = 'Add date' }: RelativeDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(selectedDate ? new Date(selectedDate) : new Date());
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && buttonRef.current && dropdownRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const isMobile = window.innerWidth < 768;

      if (isMobile) {
        dropdownRef.current.style.top = `${buttonRect.bottom + window.scrollY + 8}px`;
      }
    }
  }, [isOpen]);

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
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 px-3 py-1.5 text-sm rounded-2xl border border-gray-300 bg-white hover:bg-gray-50"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span className="text-gray-700">
          {selectedDate ? format(new Date(selectedDate), 'dd/MM/yyyy') : placeholder}
        </span>
      </button>
      
      {isOpen && (
        <>
          <div className="fixed inset-0 z-[100]" onClick={() => setIsOpen(false)} />
          <div 
            ref={dropdownRef}
            className="md:absolute fixed z-[101] md:top-full md:mt-2 md:left-0 left-4 bg-white rounded-2xl shadow-lg border border-gray-200 w-[calc(100vw-2rem)] md:w-[250px]"
            onClick={e => e.stopPropagation()}
            style={{
              maxHeight: '80vh',
              overflowY: 'auto'
            }}
          >
            <div className="p-3">
              {/* Calendar Header */}
              <div className="flex justify-between items-center mb-3">
                <select
                  value={format(currentDate, 'MMMM')}
                  onChange={(e) => {
                    const newDate = new Date(currentDate);
                    newDate.setMonth(new Date(Date.parse(e.target.value + " 1, 2000")).getMonth());
                    setCurrentDate(newDate);
                  }}
                  className="text-gray-900 font-medium bg-transparent border-none focus:outline-none cursor-pointer appearance-none pr-6 text-sm text-center"
                  style={{
                    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%237B1984' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 0.25rem center',
                    backgroundSize: '0.75rem'
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
                  className="text-gray-900 bg-transparent border-none focus:outline-none cursor-pointer appearance-none pl-2 pr-6 text-sm text-center"
                  style={{
                    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%237B1984' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 0.25rem center',
                    backgroundSize: '0.75rem'
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
              <div className="grid grid-cols-7 gap-1 mb-1">
                {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((day) => (
                  <div key={day} className="text-center text-xs text-gray-600 py-1">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {/* Previous month padding */}
                {Array.from({ length: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay() || 7 - 1 }).map((_, i) => (
                  <div key={`prev-${i}`} className="text-center py-1 text-xs text-gray-400">
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
                      className={`text-center py-1 text-xs rounded hover:bg-purple-50
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
                  <div key={`next-${i}`} className="text-center py-1 text-xs text-gray-400">
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