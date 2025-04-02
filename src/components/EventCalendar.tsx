
import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO, addMonths, subMonths } from 'date-fns';
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
import { Event } from '@/types';
import EventCard from './EventCard';

interface EventCalendarProps {
  events: Event[];
}

const EventCalendar = ({ events }: EventCalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const navigate = useNavigate();
  
  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };
  
  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };
  
  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });
  
  const getEventsForDay = (day: Date) => {
    return events.filter(event => 
      isSameDay(parseISO(event.startDate), day)
    );
  };
  
  const handleDateClick = (day: Date) => {
    setSelectedDate(day);
  };
  
  const handleEventClick = (event: Event) => {
    navigate(`/events/${event.id}`);
  };
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Events Calendar
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="icon" onClick={prevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-md font-medium">
                {format(currentMonth, 'MMMM yyyy', { locale: es })}
              </span>
              <Button variant="outline" size="icon" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
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
            {Array.from({ length: startOfMonth(currentMonth).getDay() }).map((_, i) => (
              <div key={`empty-start-${i}`} className="h-16 rounded-md" />
            ))}
            
            {/* Actual days of the month */}
            {daysInMonth.map(day => {
              const dayEvents = getEventsForDay(day);
              const hasEvents = dayEvents.length > 0;
              const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
              const isToday = isSameDay(day, new Date());
              
              return (
                <Dialog key={day.toISOString()}>
                  <DialogTrigger asChild>
                    <Button
                      variant={isSelected ? "default" : isToday ? "outline" : "ghost"}
                      className={`h-16 flex flex-col items-center justify-start p-1 hover:bg-muted/50 ${
                        hasEvents ? "ring-1 ring-primary/20" : ""
                      }`}
                      onClick={() => handleDateClick(day)}
                    >
                      <span className={`text-sm ${isSelected ? "text-primary-foreground" : "text-foreground"}`}>
                        {format(day, 'd')}
                      </span>
                      
                      {hasEvents && (
                        <div className="mt-auto mb-1 flex flex-wrap justify-center gap-1">
                          {dayEvents.slice(0, 3).map((event, idx) => (
                            <div 
                              key={idx} 
                              className="h-1.5 w-1.5 rounded-full bg-magic-purple"
                              title={event.title}
                            />
                          ))}
                          {dayEvents.length > 3 && (
                            <span className="text-[10px] text-muted-foreground">+{dayEvents.length - 3}</span>
                          )}
                        </div>
                      )}
                    </Button>
                  </DialogTrigger>
                  
                  {hasEvents && (
                    <DialogContent className="max-w-xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>
                          Events on {format(day, 'EEEE d MMMM, yyyy', { locale: es })}
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
            {Array.from({ length: 6 - endOfMonth(currentMonth).getDay() }).map((_, i) => (
              <div key={`empty-end-${i}`} className="h-16 rounded-md" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EventCalendar;
