
import Navbar from '@/components/Navbar';
import EventCalendar from '@/components/EventCalendar';
import { useEvents } from '@/context/EventContext';
import { Skeleton } from '@/components/ui/skeleton';
import { CalendarDays } from 'lucide-react';

const CalendarPage = () => {
  const { events, isLoading } = useEvents();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              <Skeleton className="h-96 w-full" />
            </div>
          ) : (
            <div className="calendar-container">
              <EventCalendar events={events} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default CalendarPage;
