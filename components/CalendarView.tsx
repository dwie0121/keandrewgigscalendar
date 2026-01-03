
import React, { useState, useRef } from 'react';
import { StudioEvent, Staff, CalendarViewType } from '../types';
import { Icons } from '../constants';
import EventModal from './EventModal';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameDay, 
  startOfWeek, 
  endOfWeek,
  addYears,
  subYears,
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
  
  // Year view hover state
  const [hoveredDay, setHoveredDay] = useState<Date | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart);
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
    setHoveredDay(day);
    setMousePos({ x: event.clientX, y: event.clientY });
  };

  const next = () => {
    if (viewType === 'year') setCurrentDate(addYears(currentDate, 1));
    else setCurrentDate(addMonths(currentDate, 1));
  };

  const prev = () => {
    if (viewType === 'year') setCurrentDate(subYears(currentDate, 1));
    else setCurrentDate(subMonths(currentDate, 1));
  };

  const getDayEvents = (day: Date) => events.filter(e => isSameDay(new Date(e.date), day));

  return (
    <div className="space-y-6 animate-fadeIn relative">
      {/* Year View Tooltip */}
      {viewType === 'year' && hoveredDay && getDayEvents(hoveredDay).length > 0 && (
        <div 
          className="fixed z-[100] pointer-events-none bg-slate-900/95 backdrop-blur-md text-white p-4 rounded-2xl shadow-2xl border border-slate-700/50 w-64 animate-scaleIn"
          style={{ 
            left: `${mousePos.x + 20}px`, 
            top: `${mousePos.y - 20}px`,
            maxWidth: 'calc(100vw - 40px)'
          }}
        >
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 border-b border-slate-700 pb-2">
            {format(hoveredDay, 'MMMM dd, yyyy')}
          </p>
          <div className="space-y-3">
            {getDayEvents(hoveredDay).map(e => (
              <div key={e.id} className="flex flex-col gap-1">
                <p className="text-xs font-bold leading-tight">{e.title}</p>
                <div className="flex items-center gap-2 text-[10px] font-medium text-indigo-300">
                  <Icons.Time size={10} />
                  <span>{e.startTime} - {e.endTime}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Calendar Header */}
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
            <h3 className="font-black text-slate-800 text-lg min-w-[160px] text-center tracking-tight">
              {viewType === 'year' ? format(currentDate, 'yyyy') : format(currentDate, 'MMMM yyyy')}
            </h3>
            <button onClick={next} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-indigo-600 transition-colors"><Icons.Next size={18}/></button>
          </div>
        </div>

        {isAdmin && (
          <button 
            onClick={() => { setSelectedEvent(null); setInitialDate(format(new Date(), 'yyyy-MM-dd')); setIsModalOpen(true); }}
            className="bg-indigo-600 text-white px-6 py-3.5 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 hover:-translate-y-0.5"
          >
            <Icons.Plus size={16} /> New Studio Booking
          </button>
        )}
      </div>

      {/* Month View */}
      {viewType === 'month' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
          <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{d}</div>
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
                  className={`group min-h-[140px] p-3 border-b border-r border-slate-100 cursor-pointer transition-all relative
                    ${!isCurrentMonth ? 'bg-slate-50/30' : 'bg-white hover:bg-indigo-50/30'}
                    ${idx % 7 === 6 ? 'border-r-0' : ''}
                  `}
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className={`text-sm font-black w-8 h-8 flex items-center justify-center rounded-xl transition-colors
                      ${today ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : isCurrentMonth ? 'text-slate-800' : 'text-slate-300'}
                      ${!today && isCurrentMonth ? 'group-hover:bg-slate-100' : ''}
                    `}>
                      {format(day, 'd')}
                    </span>
                    {isCurrentMonth && isAdmin && (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                         <Icons.Plus size={14} className="text-indigo-400" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-1.5 overflow-y-auto max-h-[80px] hide-scrollbar">
                    {dayEvents.map(e => (
                      <div 
                        key={e.id} 
                        onClick={(ev) => openEditModal(e, ev)}
                        className="text-[10px] p-2 bg-white border border-slate-100 rounded-lg text-slate-700 font-bold shadow-sm hover:border-indigo-300 hover:text-indigo-700 hover:shadow-md transition-all truncate flex items-center gap-1.5"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
                        <span className="text-slate-400 font-medium tabular-nums">{e.startTime}</span>
                        <span>{e.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Year View */}
      {viewType === 'year' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {yearMonths.map(m => (
            <div key={m.toString()} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <h4 className="font-black text-slate-800 mb-6 uppercase tracking-widest text-sm">{format(m, 'MMMM')}</h4>
              <div className="grid grid-cols-7 gap-1">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                  <div key={d} className="text-[9px] text-center font-black text-slate-300 uppercase">{d}</div>
                ))}
                {eachDayOfInterval({ start: startOfWeek(m), end: endOfWeek(endOfMonth(m)) }).map(d => {
                  const dayEventsCount = getDayEvents(d).length;
                  const isCurMonth = isSameMonth(d, m);
                  const isDayToday = isToday(d);
                  
                  return (
                    <div 
                      key={d.toString()}
                      onMouseEnter={(ev) => { if(isCurMonth) handleYearHover(d, ev); }}
                      onMouseLeave={() => setHoveredDay(null)}
                      onClick={(ev) => { if(isCurMonth) handleDayClick(d); ev.stopPropagation(); }}
                      className={`h-7 w-full flex items-center justify-center rounded-lg text-[10px] cursor-pointer transition-all relative
                        ${!isCurMonth ? 'text-transparent pointer-events-none' : 
                          dayEventsCount > 0 ? 'bg-indigo-600 text-white font-black shadow-md shadow-indigo-100' : 
                          isDayToday ? 'border-2 border-indigo-200 text-indigo-600 font-bold' : 'text-slate-400 hover:bg-slate-50'}
                      `}
                    >
                      {format(d, 'd')}
                      {isCurMonth && dayEventsCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-rose-400 border border-white rounded-full"></span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List View */}
      {viewType === 'list' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          {events.length === 0 ? (
            <div className="p-20 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Icons.Calendar size={32} className="text-slate-300" />
              </div>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">No scheduled bookings</p>
              {isAdmin && (
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="mt-4 text-indigo-600 font-bold hover:underline"
                >
                  Schedule your first one
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {events
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .map(e => (
                <div 
                  key={e.id} 
                  onClick={() => openEditModal(e)}
                  className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-slate-50/50 cursor-pointer transition-all group"
                >
                  <div className="flex items-center gap-8">
                    <div className="w-20 h-20 bg-slate-100 rounded-[2rem] flex flex-col items-center justify-center border border-slate-200 group-hover:bg-indigo-600 group-hover:text-white transition-all group-hover:shadow-xl group-hover:shadow-indigo-200">
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-70">{format(new Date(e.date), 'MMM')}</span>
                      <span className="text-3xl font-black">{format(new Date(e.date), 'dd')}</span>
                    </div>
                    <div>
                      <h4 className="font-black text-2xl text-slate-800 tracking-tight mb-2 group-hover:text-indigo-600 transition-colors">{e.title}</h4>
                      <div className="flex flex-wrap items-center gap-6 text-xs text-slate-500 font-bold uppercase tracking-widest">
                        <span className="flex items-center gap-2"><Icons.Time size={14} className="text-indigo-500"/> {e.startTime} - {e.endTime}</span>
                        <span className="flex items-center gap-2"><Icons.Staff size={14} className="text-indigo-500"/> {e.assignments.length} Crew Members</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-10">
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Contract Value</p>
                      <p className="text-2xl font-black text-slate-900 tabular-nums">₱{e.revenue.toLocaleString()}</p>
                    </div>
                    {isAdmin && (
                      <button 
                        onClick={(ev) => { ev.stopPropagation(); onDeleteEvent(e.id); }}
                        className="p-4 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Icons.Delete size={20} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
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
