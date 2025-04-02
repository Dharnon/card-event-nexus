
import Navbar from '@/components/Navbar';
import EventCalendar from '@/components/EventCalendar';
import { useEvents } from '@/context/EventContext';

const CalendarPage = () => {
  const { events, isLoading } = useEvents();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Events Calendar</h1>
            <p className="text-muted-foreground">
              View all upcoming Magic: The Gathering events in calendar format
            </p>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <p>Loading calendar...</p>
            </div>
          ) : (
            <EventCalendar events={events} />
          )}
        </div>
      </main>
    </div>
  );
};

export default CalendarPage;
