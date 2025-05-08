
import Navbar from '@/components/Navbar';
import { useEvents } from '@/context/EventContext';
import { Skeleton } from '@/components/ui/skeleton';
import { CalendarDays } from 'lucide-react';
import { FullScreenCalendar } from '@/components/ui/fullscreen-calendar';
import { format, parseISO } from 'date-fns';

const CalendarPage = () => {
  const { events, isLoading } = useEvents();
  
  // Transform events into the format expected by FullScreenCalendar
  const calendarData = events.reduce((acc, event) => {
    const day = parseISO(event.startDate);
    const eventTime = format(parseISO(event.startDate), 'h:mm a');
    
    const existingDay = acc.find(item => 
      format(item.day, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
    );
    
    if (existingDay) {
      existingDay.events.push({
        id: event.id,
        name: event.title,
        time: eventTime,
        datetime: event.startDate,
      });
    } else {
      acc.push({
        day,
        events: [{
          id: event.id,
          name: event.title,
          time: eventTime,
          datetime: event.startDate,
        }],
      });
    }
    
    return acc;
  }, [] as Array<{
    day: Date;
    events: Array<{
      id: string | number;
      name: string;
      time: string;
      datetime: string;
    }>;
  }>);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="flex items-center mb-2">
              <CalendarDays className="h-7 w-7 mr-3 text-primary" />
              <h1 className="text-3xl font-bold">Events Calendar</h1>
            </div>
            <p className="text-muted-foreground text-lg">
              View all upcoming Magic: The Gathering events in calendar format
            </p>
          </div>
          
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-[600px] w-full" />
            </div>
          ) : (
            <div className="h-[700px] border rounded-lg overflow-hidden">
              <FullScreenCalendar data={calendarData} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default CalendarPage;
