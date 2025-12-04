import React, { useState } from 'react';
import { CalendarEvent } from '../types';
import { Plus, X, ChevronLeft, ChevronRight, Clock, Trash2, Edit2, Check } from 'lucide-react';

interface CalendarProps {
  events: CalendarEvent[];
  setEvents: React.Dispatch<React.SetStateAction<CalendarEvent[]>>;
}

const CalendarPage: React.FC<CalendarProps> = ({ events, setEvents }) => {
  const daysOfWeek = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه'];
  const monthName = "تیر ۱۴۰۴"; 
  
  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);
  const startOffset = 1; 

  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const getDayEvents = (day: number) => {
    const dateStr = `1404/04/${day.toString().padStart(2, '0')}`;
    return events.filter(e => e.date === dateStr);
  };

  const handleAddEvent = () => {
    if (!selectedDay || !newEventTitle.trim()) return;
    const dateStr = `1404/04/${selectedDay.toString().padStart(2, '0')}`;
    const newEvent: CalendarEvent = {
      id: Math.random().toString(),
      title: newEventTitle,
      date: dateStr,
      type: 'Meeting'
    };
    setEvents([...events, newEvent]);
    setNewEventTitle('');
  };

  const deleteEvent = (id: string) => {
    if(window.confirm('حذف شود؟')) {
        setEvents(events.filter(e => e.id !== id));
    }
  };

  const startEdit = (ev: CalendarEvent) => {
    setEditingEventId(ev.id);
    setEditTitle(ev.title);
  };

  const saveEdit = (id: string) => {
    setEvents(events.map(e => e.id === id ? { ...e, title: editTitle } : e));
    setEditingEventId(null);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-[calc(100vh-140px)]">
      
      {/* Calendar Grid */}
      <div className="flex-1 bg-dark-800 rounded-3xl p-6 border border-dark-700 flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">{monthName}</h2>
          <div className="flex gap-2">
            <button className="p-2 hover:bg-dark-700 rounded-full text-gray-400"><ChevronRight /></button>
            <button className="p-2 hover:bg-dark-700 rounded-full text-gray-400"><ChevronLeft /></button>
          </div>
        </div>

        <div className="grid grid-cols-7 mb-4">
          {daysOfWeek.map(day => (
            <div key={day} className="text-center text-gray-500 text-sm font-medium py-2">{day}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 flex-1 gap-2">
          {Array.from({ length: startOffset }).map((_, i) => <div key={`empty-${i}`} />)}
          {daysInMonth.map(day => {
            const dayEvents = getDayEvents(day);
            const isSelected = selectedDay === day;
            
            return (
              <div 
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`
                  relative rounded-xl border p-2 cursor-pointer transition-all flex flex-col items-start justify-start
                  ${isSelected 
                    ? 'bg-primary/20 border-primary text-primary' 
                    : 'bg-dark-900/50 border-dark-700 text-gray-300 hover:border-gray-500'}
                `}
              >
                <span className="font-bold text-lg">{day}</span>
                <div className="flex flex-wrap gap-1 mt-1 w-full">
                  {dayEvents.map(ev => (
                    <div key={ev.id} className="w-1.5 h-1.5 rounded-full bg-accent-blue"></div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Side Panel: Events for selected day */}
      <div className="w-full lg:w-96 bg-dark-800 rounded-3xl p-6 border border-dark-700 flex flex-col">
        <div className="mb-6">
            <h3 className="text-xl font-bold text-white mb-2">
            {selectedDay ? `${selectedDay} تیر` : 'یک روز را انتخاب کنید'}
            </h3>
            <p className="text-gray-500 text-sm">برنامه‌های روزانه شما</p>
        </div>

        {selectedDay ? (
            <>
                <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-2">
                    {getDayEvents(selectedDay).length === 0 ? (
                        <p className="text-gray-500 text-center py-10">رویدادی ثبت نشده است.</p>
                    ) : (
                        getDayEvents(selectedDay).map(ev => (
                            <div key={ev.id} className="bg-dark-900 p-3 rounded-xl border border-dark-700 flex justify-between items-center group">
                                {editingEventId === ev.id ? (
                                    <div className="flex-1 flex gap-2">
                                        <input 
                                            value={editTitle}
                                            onChange={(e) => setEditTitle(e.target.value)}
                                            className="w-full bg-dark-800 text-white rounded px-2 py-1 text-sm border border-dark-600 focus:outline-none"
                                            autoFocus
                                        />
                                        <button onClick={() => saveEdit(ev.id)} className="text-green-500"><Check size={16}/></button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-accent-blue/20 text-accent-blue rounded-lg">
                                                <Clock size={16} />
                                            </div>
                                            <span className="text-gray-200 text-sm">{ev.title}</span>
                                        </div>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => startEdit(ev)} className="text-gray-500 hover:text-blue-400">
                                                <Edit2 size={14} />
                                            </button>
                                            <button onClick={() => deleteEvent(ev.id)} className="text-gray-500 hover:text-red-500">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))
                    )}
                </div>

                <div className="pt-4 border-t border-dark-700">
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            placeholder="عنوان رویداد..." 
                            className="flex-1 bg-dark-900 border border-dark-600 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-primary text-sm"
                            value={newEventTitle}
                            onChange={(e) => setNewEventTitle(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddEvent()}
                        />
                        <button 
                            onClick={handleAddEvent}
                            className="bg-primary hover:bg-primary/90 text-white p-2 rounded-xl"
                        >
                            <Plus size={20} />
                        </button>
                    </div>
                </div>
            </>
        ) : (
            <div className="flex-1 flex items-center justify-center text-gray-600">
                جهت مشاهده یا افزودن رویداد، روی تقویم کلیک کنید.
            </div>
        )}
      </div>
    </div>
  );
};

export default CalendarPage;