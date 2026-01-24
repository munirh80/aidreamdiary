import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, Moon, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const API_URL = process.env.REACT_APP_BACKEND_URL + '/api';

const DreamCalendar = () => {
  const navigate = useNavigate();
  const { getAuthHeaders } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [dreamsByDate, setDreamsByDate] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    const fetchCalendarData = async () => {
      setLoading(true);
      try {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth() + 1;
        const response = await axios.get(
          `${API_URL}/dreams/calendar/${year}/${month}`,
          getAuthHeaders()
        );
        setDreamsByDate(response.data.dreams_by_date || {});
      } catch (error) {
        console.error('Error fetching calendar data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCalendarData();
  }, [currentMonth, getAuthHeaders]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Pad the beginning with empty cells
  const startDayOfWeek = monthStart.getDay();
  const paddingDays = Array(startDayOfWeek).fill(null);

  const handleDateClick = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    if (dreamsByDate[dateStr]?.length > 0) {
      setSelectedDate(dateStr);
    }
  };

  const getDreamCountForDate = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return dreamsByDate[dateStr]?.length || 0;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in" data-testid="dream-calendar">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl text-white mb-2">Dream Calendar</h1>
          <p className="text-slate-400">Visualize your dream journey over time</p>
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="text-slate-400 hover:text-white"
            data-testid="prev-month"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h2 className="font-serif text-2xl text-white">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="text-slate-400 hover:text-white"
            data-testid="next-month"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-xs font-medium text-slate-500 uppercase tracking-wider py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {paddingDays.map((_, i) => (
            <div key={`pad-${i}`} className="aspect-square" />
          ))}
          {days.map(day => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const dreamCount = getDreamCountForDate(day);
            const isToday = isSameDay(day, new Date());
            const dreams = dreamsByDate[dateStr] || [];

            return (
              <button
                key={dateStr}
                onClick={() => handleDateClick(day)}
                className={`aspect-square rounded-xl flex flex-col items-center justify-center relative transition-all duration-200 ${
                  dreamCount > 0
                    ? 'bg-purple-500/20 border border-purple-500/30 hover:border-purple-500/50 cursor-pointer'
                    : 'bg-slate-800/30 border border-transparent hover:border-white/10'
                } ${isToday ? 'ring-2 ring-cyan-500/50' : ''}`}
                data-testid={`calendar-day-${dateStr}`}
              >
                <span className={`text-sm ${dreamCount > 0 ? 'text-white font-medium' : 'text-slate-500'}`}>
                  {format(day, 'd')}
                </span>
                {dreamCount > 0 && (
                  <div className="flex items-center gap-0.5 mt-1">
                    {Array(Math.min(dreamCount, 3)).fill(0).map((_, i) => (
                      <div key={i} className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                    ))}
                    {dreamCount > 3 && (
                      <span className="text-[10px] text-purple-400 ml-0.5">+{dreamCount - 3}</span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Date Dreams */}
      {selectedDate && dreamsByDate[selectedDate] && (
        <div className="glass rounded-2xl p-6 animate-fade-in" data-testid="selected-date-dreams">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif text-xl text-white">
              Dreams on {format(new Date(selectedDate), 'MMMM d, yyyy')}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedDate(null)}
              className="text-slate-400"
            >
              Close
            </Button>
          </div>
          <div className="space-y-3">
            {dreamsByDate[selectedDate].map(dream => (
              <button
                key={dream.id}
                onClick={() => navigate(`/dreams/${dream.id}`)}
                className="w-full text-left p-4 rounded-xl bg-slate-800/50 border border-white/5 hover:border-purple-500/30 transition-all"
                data-testid={`calendar-dream-${dream.id}`}
              >
                <div className="flex items-center gap-3">
                  <Moon className="w-5 h-5 text-purple-400 flex-shrink-0" />
                  <div>
                    <h4 className="text-white font-medium">{dream.title}</h4>
                    {dream.themes?.length > 0 && (
                      <div className="flex gap-2 mt-1">
                        {dream.themes.slice(0, 2).map((theme, i) => (
                          <span key={i} className="text-xs text-cyan-400">{theme}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-6 text-sm text-slate-400">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-purple-500/20 border border-purple-500/30" />
          <span>Dreams recorded</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded ring-2 ring-cyan-500/50" />
          <span>Today</span>
        </div>
      </div>
    </div>
  );
};

export default DreamCalendar;
