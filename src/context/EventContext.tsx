
import { createContext, useContext, useState, useEffect } from 'react';
import { Event } from '@/types';
import { getEvents, subscribeToEvents } from '@/services/EventService';
import { toast } from 'sonner';

interface EventContextType {
  events: Event[];
  featuredEvents: Event[];
  upcomingEvents: Event[];
  loading: boolean;
  error: Error | null;
  refreshEvents: () => Promise<void>;
}

const EventContext = createContext<EventContextType>({
  events: [],
  featuredEvents: [],
  upcomingEvents: [],
  loading: true,
  error: null,
  refreshEvents: async () => {},
});

export const useEvents = () => useContext(EventContext);

export const EventProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const loadEvents = async () => {
    try {
      const eventsData = await getEvents();
      setEvents(eventsData);
      setError(null);
    } catch (err: any) {
      console.error('Failed to load events:', err);
      setError(err);
      toast.error('Failed to load events. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();

    // Subscribe to event updates
    const unsubscribe = subscribeToEvents(updatedEvents => {
      setEvents(updatedEvents);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Filter featured events
  const featuredEvents = events.filter(event => event.featured);

  // Filter upcoming events (events that haven't started yet)
  const upcomingEvents = events
    .filter(event => new Date(event.startDate) > new Date())
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  return (
    <EventContext.Provider
      value={{
        events,
        featuredEvents,
        upcomingEvents,
        loading,
        error,
        refreshEvents: loadEvents,
      }}
    >
      {children}
    </EventContext.Provider>
  );
};

export default EventContext;
