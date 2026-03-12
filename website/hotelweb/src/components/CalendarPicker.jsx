import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function CalendarPicker({ 
  startDate, 
  endDate, 
  onChange, 
  disabledDates = [], 
  minDate = null // Will default to today inside if null
}) {
  const fmtLocalDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const effectiveMinDate = useMemo(() => minDate || fmtLocalDate(new Date()), [minDate]);
  const [viewDate, setViewDate] = useState(new Date(startDate || effectiveMinDate));

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const days = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const prevMonthDays = new Date(year, month, 0).getDate();
    const result = [];

    // Prev month padding
    for (let i = firstDay - 1; i >= 0; i--) {
      result.push({ date: new Date(year, month - 1, prevMonthDays - i), currentMonth: false });
    }

    // Current month
    for (let i = 1; i <= daysInMonth; i++) {
      result.push({ date: new Date(year, month, i), currentMonth: true });
    }

    // Next month padding
    const remaining = 42 - result.length;
    for (let i = 1; i <= remaining; i++) {
      result.push({ date: new Date(year, month + 1, i), currentMonth: false });
    }

    return result;
  }, [viewDate]);

  const isSelected = (date) => {
    const dStr = fmtLocalDate(date);
    return dStr === startDate || dStr === endDate;
  };

  const isInRange = (date) => {
    if (!startDate || !endDate) return false;
    const d = fmtLocalDate(date);
    return d > startDate && d < endDate;
  };

  const isDisabled = (date) => {
    const dStr = fmtLocalDate(date);
    if (dStr < effectiveMinDate) return true;
    
    return disabledDates.some(range => {
      // Normalize range dates to YYYY-MM-DD in case they come as ISO strings
      const rawStart = range.checkInDate || range.startDate;
      const rawEnd = range.checkOutDate || range.endDate;
      
      const start = typeof rawStart === 'string' ? rawStart.split('T')[0] : fmtLocalDate(new Date(rawStart));
      const end = typeof rawEnd === 'string' ? rawEnd.split('T')[0] : fmtLocalDate(new Date(rawEnd));
      
      // Note: A user CAN check out on the same day someone else checks in.
      // So we only disable if the date is EXACTLY between [start, end)
      return dStr >= start && dStr < end;
    });
  };

  const handleDateClick = (date) => {
    const dStr = fmtLocalDate(date);
    if (isDisabled(date)) return;

    // 1. If clicking a currently selected date, unselect just that date
    if (dStr === startDate) {
      // Unselecting start: if end exists, it becomes the new start
      onChange({ checkInDate: endDate || '', checkOutDate: '' });
      return;
    }
    if (dStr === endDate) {
      // Unselecting end: keep start
      onChange({ checkInDate: startDate || '', checkOutDate: '' });
      return;
    }

    // 2. If no start date exists, or if a full range already exists
    if (!startDate || (startDate && endDate)) {
      // Starting a fresh selection: only set check-in
      onChange({ checkInDate: dStr, checkOutDate: '' });
    } else {
      // 3. We have a startDate but no endDate: set the second boundary
      let newStart = startDate;
      let newEnd = dStr;

      // Ensure smaller is check-in
      if (newEnd < newStart) {
        [newStart, newEnd] = [newEnd, newStart];
      }
      
      onChange({ checkInDate: newStart, checkOutDate: newEnd });
    }
  };

  const changeMonth = (offset) => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1));
  };

  return (
    <div className="bg-white border border-black/5 p-6 select-none shadow-sm">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-sm font-serif text-chalet-dark">
          {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
        </h3>
        <div className="flex gap-2">
          <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-chalet-bg transition-colors"><ChevronLeft className="w-4 h-4" /></button>
          <button onClick={() => changeMonth(1)} className="p-2 hover:bg-chalet-bg transition-colors"><ChevronRight className="w-4 h-4" /></button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px mb-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
          <div key={d} className="text-[10px] font-sans font-bold uppercase tracking-widest text-chalet-gray text-center pb-2 underline decoration-chalet-gold/30">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-1">
        {days.map((item, idx) => {
          const selected = isSelected(item.date);
          const range = isInRange(item.date);
          const disabled = isDisabled(item.date);
          const isToday = fmtLocalDate(item.date) === fmtLocalDate(new Date());

          return (
            <div 
              key={idx}
              onClick={() => handleDateClick(item.date)}
              className={`
                relative h-10 flex items-center justify-center text-xs font-sans transition-all cursor-pointer
                ${!item.currentMonth ? 'text-chalet-gray/30' : 'text-chalet-dark'}
                ${selected ? 'bg-chalet-dark text-white z-10' : ''}
                ${range ? 'bg-chalet-bg text-chalet-dark' : ''}
                ${disabled ? 'opacity-20 cursor-not-allowed line-through' : 'hover:bg-chalet-gold/10'}
                ${isToday && !selected ? 'border-b-2 border-chalet-gold' : ''}
              `}
            >
              {item.date.getDate()}
              {selected && startDate === endDate && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-chalet-gold rounded-full"></div>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="mt-6 flex items-center gap-4 text-[10px] uppercase tracking-widest font-bold text-chalet-gray">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 bg-chalet-dark"></div> Selected
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 bg-chalet-bg"></div> Range
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 border border-black/10 line-through opacity-30"></div> Booked
        </div>
      </div>
    </div>
  );
}
