import React, { useState } from 'react';
import { StudioEvent, Staff, CalendarViewType } from '../types';
import { Icons } from '../constants';
import EventModal from './EventModal';
import { 
  format, 
  addMonths, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameDay, 
  endOfWeek,
  addYears,
  isToday,
  isSameMonth
} from 'date-fns';

interface CalendarProps {
  events: StudioEvent[];
  staff: Staff[];
  isAdmin?: boolean;
  onAddEvent: (e: StudioEvent) => void;
  onUpdateEvent: (e: StudioEvent) => void;
  onDeleteEvent: (id: string) => void;
}

const CalendarView: React.FC<CalendarProps> = ({ events, staff, isAdmin, onAddEvent, onUpdateEvent, onDeleteEvent }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState<CalendarViewType>('month');
  const [selectedEvent, setSelectedEvent] = useState<StudioEvent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [initialDate, setInitialDate] = useState<string | undefined>();
  
  const [hoveredDay, setHoveredDay] = useState<Date | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Robust Date Calculations
  const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const monthEnd = endOfMonth(monthStart);
  
  const getStartOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  };

  const calendarStart = getStartOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const yearMonths = Array.from({ length: 12 }, (_, i) => new Date(currentDate.getFullYear(), i, 1));

  const handleDayClick = (day: Date) => {
    if (!isAdmin) return;
    setInitialDate(format(day, 'yyyy-MM-dd'));
    setSelectedEvent(null);
    setIsModalOpen(true);
  };

  const openEditModal = (e: StudioEvent, eventObj?: React.MouseEvent) => {
    eventObj?.stopPropagation();
    setSelectedEvent(e);
    setInitialDate(undefined);
    setIsModalOpen(true);
  };

  const handleYearHover = (day: Date, event: React.MouseEvent) => {
    const dayEvents = events.filter(e => isSameDay(new Date(e.date), day));
    if (dayEvents.length > 0) {
      setHoveredDay(day);
      setMousePos({ x: event.clientX, y: event.clientY });
    }
  };

  const next = () => {
    if (viewType === 'year') setCurrentDate(addYears(currentDate, 1));
    else setCurrentDate(addMonths(currentDate, 1));
  };

  const prev = () => {
    if (viewType === 'year') setCurrentDate(addYears(currentDate, -1));
    else setCurrentDate(addMonths(currentDate, -1));
  };

  const getDayEvents = (day: Date) => events.filter(e => isSameDay(new Date(e.date), day));

  return (
    <div className="space-y-6 animate-fadeIn relative">
      {/* Dynamic Hover Tooltip for Year View */}
      {viewType === 'year' && hoveredDay && (
        <div 
          className="fixed z-[100] pointer-events-none bg-slate-900/95 backdrop-blur-xl text-white p-5 rounded-[1.5rem] shadow-2xl border border-white/10 w-72 animate-scaleIn"
          style={{ 
            left: `${Math.min(mousePos.x + 20, window.innerWidth - 300)}px`, 
            top: `${Math.min(mousePos.y - 20, window.innerHeight - 200)}px`,
          }}
        >
          <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">
              {format(hoveredDay, 'EEE, MMM dd')}
            </p>
            <span className="bg-white/10 px-2 py-0.5 rounded text-[9px] font-bold">
              {getDayEvents(hoveredDay).length} Booking(s)
            </span>
          </div>
          <div className="space-y-4">
            {getDayEvents(hoveredDay).map(e => (
              <div key={e.id} className="group/item">
                <p className="text-xs font-bold leading-tight mb-1 group-hover/item:text-indigo-300 transition-colors">{e.title}</p>
                <div className="flex items-center justify-between gap-2">
                   <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-400">
                    <Icons.Time size={10} className="text-indigo-500" />
                    <span>{e.startTime} - {e.endTime}</span>
                  </div>
                  <span className="text-[10px] font-black text-emerald-400">₱{e.revenue.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Control Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-6 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm w-fit">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            {(['month', 'year', 'list'] as CalendarViewType[]).map((type) => (
              <button 
                key={type}
                onClick={() => setViewType(type)}
                className={`px-5 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${viewType === type ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {type}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3 pr-4 border-l border-slate-100 pl-4">
            <button onClick={prev} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-indigo-600 transition-colors"><Icons.Prev size={18}/></button>
            <h3 className="font-black text-slate-800 text-lg min-w-[160px] text-center tracking-tight uppercase">
              {viewType === 'year' ? format(currentDate, 'yyyy') : format(currentDate, 'MMMM yyyy')}
            </h3>
            <button onClick={next} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-indigo-600 transition-colors"><Icons.Next size={18}/></button>
          </div>
        </div>

        {isAdmin && (
          <button 
            onClick={() => { setSelectedEvent(null); setInitialDate(format(new Date(), 'yyyy-MM-dd')); setIsModalOpen(true); }}
            className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 hover:-translate-y-0.5 active:scale-95"
          >
            <Icons.Plus size={16} /> Create New Booking
          </button>
        )}
      </div>

      {/* Month Grid */}
      {viewType === 'month' && (
        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
          <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {days.map((day, idx) => {
              const dayEvents = getDayEvents(day);
              const isCurrentMonth = isSameMonth(day, monthStart);
              const today = isToday(day);

              return (
                <div 
                  key={day.toString()} 
                  onClick={() => handleDayClick(day)}
                  className={`group min-h-[140px] p-4 border-b border-r border-slate-100 cursor-pointer transition-all relative
                    ${!isCurrentMonth ? 'bg-slate-50/30 opacity-40' : 'bg-white hover:bg-indigo-50/30'}
                    ${idx % 7 === 6 ? 'border-r-0' : ''}
                  `}
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className={`text-sm font-black w-9 h-9 flex items-center justify-center rounded-xl transition-all
                      ${today ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : isCurrentMonth ? 'text-slate-800' : 'text-slate-300'}
                      ${!today && isCurrentMonth ? 'group-hover:bg-slate-100' : ''}
                    `}>
                      {format(day, 'd')}
                    </span>
                    {isCurrentMonth && isAdmin && (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-indigo-50 p-1.5 rounded-lg">
                         <Icons.Plus size={14} className="text-indigo-600" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-1.5 overflow-hidden">
                    {dayEvents.map(e => (
                      <div 
                        key={e.id} 
                        onClick={(ev) => openEditModal(e, ev)}
                        className="text-[9px] px-2 py-1.5 bg-white border border-slate-100 rounded-lg text-slate-700 font-bold shadow-sm hover:border-indigo-300 hover:text-indigo-700 transition-all truncate flex items-center gap-1.5"
                      >
                        <span className="w-1 h-1 rounded-full bg-indigo-500 flex-shrink-0" />
                        <span className="text-slate-400 font-medium">{e.startTime}</span>
                        <span>{e.title}</span>
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-[8px] font-black text-indigo-400 uppercase tracking-widest pl-2">
                        + {dayEvents.length - 3} More
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Year Overview */}
      {viewType === 'year' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {yearMonths.map(m => (
            <div key={m.toString()} className="bg-white p-7 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-500">
              <h4 className="font-black text-slate-800 mb-6 uppercase tracking-[0.2em] text-xs border-b border-slate-50 pb-4">{format(m, 'MMMM')}</h4>
              <div className="grid grid-cols-7 gap-1">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                  <div key={d} className="text-[9px] text-center font-black text-slate-300 uppercase py-2">{d}</div>
                ))}
                {eachDayOfInterval({ start: getStartOfWeek(m), end: endOfWeek(endOfMonth(m)) }).map(d => {
                  const dayEvents = getDayEvents(d);
                  const isCurMonth = isSameMonth(d, m);
                  const isDayToday = isToday(d);
                  const hasEvents = dayEvents.length > 0;
                  
                  return (
                    <div 
                      key={d.toString()}
                      onMouseEnter={(ev) => { if(isCurMonth) handleYearHover(d, ev); }}
                      onMouseLeave={() => setHoveredDay(null)}
                      onClick={(ev) => { if(isCurMonth) handleDayClick(d); ev.stopPropagation(); }}
                      className={`h-8 w-full flex items-center justify-center rounded-xl text-[10px] cursor-pointer transition-all relative
                        ${!isCurMonth ? 'text-transparent pointer-events-none' : 
                          hasEvents ? 'bg-indigo-600 text-white font-black shadow-lg shadow-indigo-100' : 
                          isDayToday ? 'border-2 border-indigo-200 text-indigo-600 font-bold' : 'text-slate-400 hover:bg-slate-50'}
                      `}
                    >
                      {format(d, 'd')}
                      {isCurMonth && hasEvents && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 border-2 border-white rounded-full"></span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List View with Detail Cards */}
      {viewType === 'list' && (
        <div className="space-y-4">
          {events.length === 0 ? (
            <div className="bg-white p-24 text-center rounded-[2rem] border border-slate-200">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Icons.Calendar size={32} className="text-slate-200" />
              </div>
              <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-xs">No Upcoming Bookings Found</p>
            </div>
          ) : (
            events
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .map(e => (
                <div 
                  key={e.id} 
                  onClick={() => openEditModal(e)}
                  className="bg-white p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-8 rounded-3xl border border-slate-200 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-50 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-8">
                    <div className="w-20 h-20 bg-slate-50 rounded-2xl flex flex-col items-center justify-center border border-slate-100 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-60">{format(new Date(e.date), 'MMM')}</span>
                      <span className="text-3xl font-black">{format(new Date(e.date), 'dd')}</span>
                    </div>
                    <div>
                      <h4 className="font-black text-2xl text-slate-800 tracking-tight mb-2 group-hover:text-indigo-600 transition-colors">{e.title}</h4>
                      <div className="flex flex-wrap items-center gap-6 text-[11px] text-slate-400 font-black uppercase tracking-widest">
                        <span className="flex items-center gap-2"><Icons.Time size={14} className="text-indigo-500"/> {e.startTime} - {e.endTime}</span>
                        <span className="flex items-center gap-2"><Icons.Staff size={14} className="text-indigo-500"/> {e.assignments.length} Crew</span>
                        <span className="flex items-center gap-2"><Icons.Work size={14} className="text-indigo-500"/> {e.clientName || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-10">
                    <div className="text-right">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Contract Total</p>
                      <p className="text-2xl font-black text-slate-900 tabular-nums">₱{e.revenue.toLocaleString()}</p>
                    </div>
                    {isAdmin && (
                      <button 
                        onClick={(ev) => { ev.stopPropagation(); onDeleteEvent(e.id); }}
                        className="p-4 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                      >
                        <Icons.Delete size={20} />
                      </button>
                    )}
                  </div>
                </div>
              ))
          )}
        </div>
      )}

      {isModalOpen && (
        <EventModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          event={selectedEvent}
          staff={staff}
          isAdmin={isAdmin}
          initialDate={initialDate}
          onSave={(data) => {
            if (selectedEvent) onUpdateEvent({ ...selectedEvent, ...data });
            else onAddEvent({ ...data, id: Date.now().toString() });
            setIsModalOpen(false);
          }}
          onDelete={() => {
            if (selectedEvent) onDeleteEvent(selectedEvent.id);
            setIsModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default CalendarView;
