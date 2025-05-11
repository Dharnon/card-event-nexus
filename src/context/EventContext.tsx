
import { createContext, useContext } from 'react';
import { Event } from '@/types';
import { useEventsData } from '@/hooks/useEventsData';
import { useEventFilters, EventFilters } from '@/hooks/useEventFilters';
import { useEventOperations } from '@/hooks/useEventOperations';

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
  showToastOnce: (message: string, type: 'success' | 'error') => void;
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
  showToastOnce: () => {},
});

export const useEvents = () => useContext(EventContext);

// Re-export EventFilters type from the hook
export type { EventFilters } from '@/hooks/useEventFilters';

export const EventProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Use our custom hooks to manage events data and operations
  const { events, loading, error, refreshEvents, showToastOnce } = useEventsData();
  const { filteredEvents, featuredEvents, upcomingEvents, setFilters } = useEventFilters(events);
  const { getEventById, addEvent, updateEventData, deleteEvent } = useEventOperations(refreshEvents, events);
  
  // Create a wrapper for refreshEvents to adapt the return type
  const refreshEventsWrapper = async (): Promise<void> => {
    await refreshEvents();
  };
  
  return (
    <EventContext.Provider
      value={{
        events,
        filteredEvents,
        featuredEvents,
        upcomingEvents,
        loading,
        isLoading: loading,
        error,
        refreshEvents: refreshEventsWrapper,
        getEventById,
        addEvent,
        updateEventData,
        deleteEvent,
        setFilters,
        showToastOnce
      }}
    >
      {children}
    </EventContext.Provider>
  );
};

export default EventContext;
