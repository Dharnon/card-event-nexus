
import { createContext, useContext, useState, useEffect } from 'react';
import { Event, EventFormat, EventType, EventLocation } from '@/types';
import { getEvents, getEventById as fetchEventById, subscribeToEvents, createEvent, updateEvent, deleteEvent } from '@/services/EventService';
import { toast } from 'sonner';

export interface EventFilters {
  searchTerm?: string;
  location?: string;
  format?: EventFormat;
  type?: EventType;
  startDate?: Date;
}

interface EventContextType {
  events: Event[];
  filteredEvents: Event[];
  featuredEvents: Event[];
  upcomingEvents: Event[];
  loading: boolean;
  isLoading: boolean;
  error: Error | null;
  refreshEvents: () => Promise<void>;
  getEventById: (id: string) => Event | undefined;
  addEvent: (event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Event>;
  updateEventData: (id: string, updates: Partial<Event>) => Promise<Event>;
  deleteEvent: (id: string) => Promise<void>;
  setFilters: (filters: EventFilters) => void;
}

const EventContext = createContext<EventContextType>({
  events: [],
  filteredEvents: [],
  featuredEvents: [],
  upcomingEvents: [],
  loading: true,
  isLoading: true,
  error: null,
  refreshEvents: async () => {},
  getEventById: () => undefined,
  addEvent: async () => ({} as Event),
  updateEventData: async () => ({} as Event),
  deleteEvent: async () => {},
  setFilters: () => {},
});

export const useEvents = () => useContext(EventContext);

export const EventProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFilters] = useState<EventFilters>({});

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

  // Apply filters
  const filteredEvents = events.filter(event => {
    // Search term filter
    if (filters.searchTerm && 
        !event.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) && 
        !event.description.toLowerCase().includes(filters.searchTerm.toLowerCase())) {
      return false;
    }
    
    // Location filter
    if (filters.location && event.location.city !== filters.location) {
      return false;
    }
    
    // Format filter
    if (filters.format && event.format !== filters.format) {
      return false;
    }
    
    // Type filter
    if (filters.type && event.type !== filters.type) {
      return false;
    }
    
    // Date filter
    if (filters.startDate) {
      const eventDate = new Date(event.startDate);
      const filterDate = filters.startDate;
      
      // Check if the dates match (ignoring time)
      if (eventDate.getDate() !== filterDate.getDate() || 
          eventDate.getMonth() !== filterDate.getMonth() || 
          eventDate.getFullYear() !== filterDate.getFullYear()) {
        return false;
      }
    }
    
    return true;
  });

  // Get event by ID
  const getEventById = (id: string): Event | undefined => {
    return events.find(event => event.id === id);
  };

  // Add new event
  const addEvent = async (event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newEvent = await createEvent(event);
      return newEvent;
    } catch (error) {
      console.error('Failed to create event:', error);
      toast.error('Failed to create event. Please try again.');
      throw error;
    }
  };

  // Update event
  const updateEventData = async (id: string, updates: Partial<Event>) => {
    try {
      const updatedEvent = await updateEvent(id, updates);
      return updatedEvent;
    } catch (error) {
      console.error('Failed to update event:', error);
      toast.error('Failed to update event. Please try again.');
      throw error;
    }
  };

  // Delete event
  const deleteEventById = async (id: string) => {
    try {
      await deleteEvent(id);
      toast.success('Event deleted successfully.');
    } catch (error) {
      console.error('Failed to delete event:', error);
      toast.error('Failed to delete event. Please try again.');
      throw error;
    }
  };

  return (
    <EventContext.Provider
      value={{
        events,
        filteredEvents,
        featuredEvents,
        upcomingEvents,
        loading,
        isLoading: loading, // Add alias for isLoading
        error,
        refreshEvents: loadEvents,
        getEventById,
        addEvent,
        updateEventData,
        deleteEvent: deleteEventById,
        setFilters,
      }}
    >
      {children}
    </EventContext.Provider>
  );
};

export default EventContext;
