
import { useState } from 'react';
import * as dateFns from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  X,
  CalendarDays
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Event, EventType } from '@/types';
import EventCard from './EventCard';
import { useTheme } from '@/context/ThemeContext';

interface EventCalendarProps {
  events: Event[];
}

// Define colors for different event types
const typeColors: Record<EventType, { bg: string, color: string, darkBg: string, darkColor: string }> = {
  'tournament': { 
    bg: 'bg-magic-purple', 
    color: 'text-white',
    darkBg: 'dark:bg-magic-purple/80',
    darkColor: 'dark:text-white'
  },
  'casual': { 
    bg: 'bg-green-600', 
    color: 'text-white',
    darkBg: 'dark:bg-green-600/80',
    darkColor: 'dark:text-white'
  },
  'championship': { 
    bg: 'bg-red-600', 
    color: 'text-white',
    darkBg: 'dark:bg-red-600/80',
    darkColor: 'dark:text-white'
  },
  'draft': { 
    bg: 'bg-blue-600', 
    color: 'text-white',
    darkBg: 'dark:bg-blue-600/80', 
    darkColor: 'dark:text-white'
  },
  'prerelease': { 
    bg: 'bg-amber-600', 
    color: 'text-white',
    darkBg: 'dark:bg-amber-600/80',
    darkColor: 'dark:text-white'
  },
  'other': { 
    bg: 'bg-slate-600', 
    color: 'text-white',
    darkBg: 'dark:bg-slate-600/80',
    darkColor: 'dark:text-white'
  }
};

const typeLabels: Record<EventType, string> = {
  'tournament': 'Tournament',
  'casual': 'Casual Play',
  'championship': 'Championship',
  'draft': 'Draft',
  'prerelease': 'Prerelease',
  'other': 'Other'
};

const EventCalendar = ({ events }: EventCalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const { theme } = useTheme();
  const navigate = useNavigate();
  
  const nextMonth = () => {
    setCurrentMonth(dateFns.addMonths(currentMonth, 1));
  };
  
  const prevMonth = () => {
    setCurrentMonth(dateFns.subMonths(currentMonth, 1));
  };
  
  const daysInMonth = dateFns.eachDayOfInterval({
    start: dateFns.startOfMonth(currentMonth),
    end: dateFns.endOfMonth(currentMonth),
  });
  
  const getEventsForDay = (day: Date) => {
    return events.filter(event => 
      dateFns.isSameDay(dateFns.parseISO(event.startDate), day)
    );
  };
  
  const getEventTypesByDay = (day: Date) => {
    const dayEvents = getEventsForDay(day);
    // Create a unique array of event types for this day
    return [...new Set(dayEvents.map(event => event.type))];
  };
  
  const handleDateClick = (day: Date) => {
    setSelectedDate(day);
  };
  
  const handleEventClick = (event: Event) => {
    navigate(`/events/${event.id}`);
  };
  
  return (
    <div className="space-y-4">
      <Card className="shadow-lg border-border/30 glass-morphism">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-2xl flex items-center">
              <CalendarDays className="h-6 w-6 mr-2 text-primary" />
              Events Calendar
            </CardTitle>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="icon" onClick={prevMonth} className="hover:bg-primary/5">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-xl font-medium text-gradient whitespace-nowrap px-2">
                {dateFns.format(currentMonth, 'MMMM yyyy', { locale: es })}
              </span>
              <Button variant="outline" size="icon" onClick={nextMonth} className="hover:bg-primary/5">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <CardDescription className="text-base mt-2">
            View all upcoming Magic: The Gathering events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 text-center mb-3 bg-muted/30 rounded-t-lg p-2">
            {['D', 'L', 'M', 'X', 'J', 'V', 'S'].map((day, index) => (
              <div key={index} className="text-sm font-medium text-muted-foreground">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1 md:gap-2">
            {/* Empty cells for days of the week before the first day of the month */}
            {Array.from({ length: dateFns.startOfMonth(currentMonth).getDay() }).map((_, i) => (
              <div key={`empty-start-${i}`} className="calendar-day" />
            ))}
            
            {/* Actual days of the month */}
            {daysInMonth.map(day => {
              const dayEvents = getEventsForDay(day);
              const hasEvents = dayEvents.length > 0;
              const isSelected = selectedDate ? dateFns.isSameDay(day, selectedDate) : false;
              const isToday = dateFns.isSameDay(day, new Date());
              const eventTypes = getEventTypesByDay(day);
              
              return (
                <Dialog key={day.toISOString()}>
                  <DialogTrigger asChild>
                    <Button
                      variant={isSelected ? "default" : isToday ? "outline" : "ghost"}
                      className={`calendar-day flex flex-col items-center justify-start p-1 hover:bg-muted/50 ${
                        hasEvents ? "ring-1 ring-primary/20" : ""
                      } ${isToday && !isSelected ? "ring-1 ring-primary" : ""}`}
                      onClick={() => handleDateClick(day)}
                    >
                      <div className="calendar-day-content">
                        <span className={`text-sm font-semibold mb-1 ${isSelected ? "text-primary-foreground" : isToday ? "text-primary" : "text-foreground"}`}>
                          {dateFns.format(day, 'd')}
                        </span>
                        
                        {hasEvents && (
                          <div className="mt-auto mb-1 flex flex-col gap-1 w-full px-1">
                            {eventTypes.map((type, idx) => (
                              <TooltipProvider key={idx}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div 
                                      className={`text-[10px] rounded-sm px-1 py-0.5 truncate w-full ${typeColors[type].bg} ${typeColors[type].color} ${typeColors[type].darkBg} ${typeColors[type].darkColor}`}
                                    >
                                      {dayEvents.filter(e => e.type === type).length} {typeLabels[type]}
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent side="bottom">
                                    <p>{dayEvents.filter(e => e.type === type).length} {typeLabels[type]} events</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            ))}
                            {dayEvents.length > 3 && (
                              <span className="text-[10px] text-muted-foreground mt-1 text-center">
                                +{dayEvents.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </Button>
                  </DialogTrigger>
                  
                  {hasEvents && (
                    <DialogContent className="max-w-xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <div className="flex items-center justify-between">
                          <DialogTitle className="text-xl">
                            Events on {dateFns.format(day, 'EEEE d MMMM, yyyy', { locale: es })}
                          </DialogTitle>
                          <DialogClose asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <X className="h-4 w-4" />
                            </Button>
                          </DialogClose>
                        </div>
                        <DialogDescription className="text-base">
                          {dayEvents.length} event{dayEvents.length !== 1 ? 's' : ''} scheduled for this day
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="grid grid-cols-1 gap-4 mt-4 pb-2">
                        {dayEvents.map(event => (
                          <EventCard 
                            key={event.id} 
                            event={event} 
                            className="cursor-pointer"
                          />
                        ))}
                      </div>
                    </DialogContent>
                  )}
                </Dialog>
              );
            })}
            
            {/* Empty cells for days of the week after the last day of the month */}
            {Array.from({ length: 6 - dateFns.endOfMonth(currentMonth).getDay() }).map((_, i) => (
              <div key={`empty-end-${i}`} className="calendar-day" />
            ))}
          </div>
          
          {/* Legend */}
          <div className="mt-8 pt-4 border-t border-border/30">
            <h4 className="text-base font-medium mb-3">Event Types</h4>
            <div className="flex flex-wrap gap-3">
              {Object.entries(typeColors).map(([type, colors]) => (
                <div key={type} className="flex items-center">
                  <div className={`w-4 h-4 rounded-sm ${colors.bg} ${colors.darkBg} mr-1.5`}></div>
                  <span className="text-sm">{typeLabels[type as EventType]}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EventCalendar;
