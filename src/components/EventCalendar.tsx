import { useState } from 'react';
import * as dateFns from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  X 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Event, EventType } from '@/types';
import EventCard from './EventCard';

interface EventCalendarProps {
  events: Event[];
}

// Define colors for different event types
const typeColors: Record<EventType, { bg: string, color: string }> = {
  'tournament': { bg: 'bg-magic-purple', color: 'text-white' },
  'casual': { bg: 'bg-green-600', color: 'text-white' },
  'championship': { bg: 'bg-red-600', color: 'text-white' },
  'draft': { bg: 'bg-blue-600', color: 'text-white' },
  'prerelease': { bg: 'bg-amber-600', color: 'text-white' },
  'other': { bg: 'bg-slate-600', color: 'text-white' }
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
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Events Calendar
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="icon" onClick={prevMonth} className="hover:bg-secondary/80">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-md font-medium text-gradient">
                {dateFns.format(currentMonth, 'MMMM yyyy', { locale: es })}
              </span>
              <Button variant="outline" size="icon" onClick={nextMonth} className="hover:bg-secondary/80">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <CardDescription>
            View all upcoming Magic: The Gathering events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {['D', 'L', 'M', 'X', 'J', 'V', 'S'].map((day, index) => (
              <div key={index} className="text-sm font-medium text-muted-foreground">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for days of the week before the first day of the month */}
            {Array.from({ length: dateFns.startOfMonth(currentMonth).getDay() }).map((_, i) => (
              <div key={`empty-start-${i}`} className="h-20 rounded-md" />
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
                      className={`h-20 flex flex-col items-center justify-start p-1 hover:bg-muted/50 ${
                        hasEvents ? "ring-1 ring-primary/20" : ""
                      }`}
                      onClick={() => handleDateClick(day)}
                    >
                      <span className={`text-sm font-semibold mb-1 ${isSelected ? "text-primary-foreground" : "text-foreground"}`}>
                        {dateFns.format(day, 'd')}
                      </span>
                      
                      {hasEvents && (
                        <div className="mt-auto mb-1 flex flex-wrap justify-center gap-1 w-full px-1">
                          <div className="flex flex-col gap-1 w-full">
                            {eventTypes.map((type, idx) => (
                              <TooltipProvider key={idx}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div 
                                      className={`text-[10px] rounded-sm px-1 py-0.5 truncate w-full ${typeColors[type].bg} ${typeColors[type].color}`}
                                    >
                                      {typeLabels[type]}
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent side="bottom">
                                    <p>{dayEvents.filter(e => e.type === type).length} {typeLabels[type]} events</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            ))}
                          </div>
                          {dayEvents.length > 3 && (
                            <span className="text-[10px] text-muted-foreground mt-1">+{dayEvents.length - 3} more</span>
                          )}
                        </div>
                      )}
                    </Button>
                  </DialogTrigger>
                  
                  {hasEvents && (
                    <DialogContent className="max-w-xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>
                          Events on {dateFns.format(day, 'EEEE d MMMM, yyyy', { locale: es })}
                        </DialogTitle>
                        <DialogDescription>
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
              <div key={`empty-end-${i}`} className="h-20 rounded-md" />
            ))}
          </div>
          
          {/* Legend */}
          <div className="mt-6 pt-4 border-t border-border/30">
            <h4 className="text-sm font-medium mb-2">Event Types</h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(typeColors).map(([type, colors]) => (
                <div key={type} className="flex items-center">
                  <div className={`w-3 h-3 rounded-sm ${colors.bg} mr-1`}></div>
                  <span className="text-xs">{typeLabels[type as EventType]}</span>
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
