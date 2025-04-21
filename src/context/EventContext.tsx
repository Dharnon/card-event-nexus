
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Event, EventFormat, EventType, EventLocation } from '@/types';
import { format, parseISO, addDays, addHours } from 'date-fns';

interface EventContextType {
  events: Event[];
  isLoading: boolean;
  error: string | null;
  addEvent: (event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Event>;
  updateEvent: (id: string, event: Partial<Event>) => Promise<Event>;
  deleteEvent: (id: string) => Promise<void>;
  getEventById: (id: string) => Event | undefined;
  filteredEvents: Event[];
  setFilters: (filters: EventFilters) => void;
}

export interface EventFilters {
  location?: string;
  type?: EventType;
  format?: EventFormat;
  startDate?: Date;
  endDate?: Date;
  searchTerm?: string;
}

const EventContext = createContext<EventContextType>({
  events: [],
  isLoading: false,
  error: null,
  addEvent: async () => ({} as Event),
  updateEvent: async () => ({} as Event),
  deleteEvent: async () => {},
  getEventById: () => undefined,
  filteredEvents: [],
  setFilters: () => {},
});

export const useEvents = () => useContext(EventContext);

// Create mock events data for the demo
const generateMockEvents = (): Event[] => {
  const now = new Date();
  const mockEvents: Event[] = [];
  
  const formats: EventFormat[] = ['Standard', 'Modern', 'Legacy', 'Commander', 'Pioneer', 'Draft', 'Sealed', 'Prerelease'];
  const types: EventType[] = ['tournament', 'casual', 'championship', 'draft', 'prerelease'];
  const cities = ['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Bilbao'];
  const storeIds = ['1', '2', '3'];
  
  // Generate 20 mock events
  for (let i = 1; i <= 20; i++) {
    const format = formats[Math.floor(Math.random() * formats.length)];
    const type = types[Math.floor(Math.random() * types.length)];
    const city = cities[Math.floor(Math.random() * cities.length)];
    const storeId = storeIds[Math.floor(Math.random() * storeIds.length)];
    
    const startDate = addDays(now, Math.floor(Math.random() * 30));
    const endDate = addHours(startDate, Math.floor(Math.random() * 8) + 3);
    
    const eventId = `event-${i}`;
    
    mockEvents.push({
      id: eventId,
      title: `${format} ${type} - ${city}`,
      description: `Join us for an exciting ${format} ${type} event! Players of all skill levels are welcome.`,
      format,
      type,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      location: {
        name: `Magic Store ${city}`,
        address: `Calle Principal ${i}`,
        city,
        postalCode: `${Math.floor(Math.random() * 90000) + 10000}`,
        country: 'Spain',
      },
      price: Math.floor(Math.random() * 50) + 5,
      maxParticipants: Math.floor(Math.random() * 30) + 10,
      currentParticipants: Math.floor(Math.random() * 10),
      image: `/placeholder.svg`,
      createdBy: storeId,
      createdAt: addDays(now, -Math.floor(Math.random() * 30)).toISOString(),
      updatedAt: now.toISOString(),
    });
  }
  
  return mockEvents;
};

export const EventProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [filters, setFilters] = useState<EventFilters>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate API call to fetch events
    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const mockEvents = generateMockEvents();
        setEvents(mockEvents);
        setFilteredEvents(mockEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
        setError('Failed to fetch events');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  useEffect(() => {
    // Apply filters to events
    let filtered = [...events];
    
    if (filters.location) {
      filtered = filtered.filter(event => 
        event.location.city.toLowerCase().includes(filters.location!.toLowerCase())
      );
    }
    
    if (filters.type) {
      filtered = filtered.filter(event => event.type === filters.type);
    }
    
    if (filters.format) {
      filtered = filtered.filter(event => event.format === filters.format);
    }
    
    if (filters.startDate) {
      filtered = filtered.filter(event => 
        new Date(event.startDate) >= filters.startDate!
      );
    }
    
    if (filters.endDate) {
      filtered = filtered.filter(event => 
        new Date(event.startDate) <= filters.endDate!
      );
    }
    
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(searchLower) || 
        event.description.toLowerCase().includes(searchLower)
      );
    }
    
    setFilteredEvents(filtered);
  }, [events, filters]);

  const addEvent = async (eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>): Promise<Event> => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const now = new Date().toISOString();
      const newEvent: Event = {
        ...eventData,
        id: `event-${events.length + 1}`,
        createdAt: now,
        updatedAt: now,
      };
      
      const updatedEvents = [...events, newEvent];
      setEvents(updatedEvents);
      return newEvent;
    } catch (error) {
      console.error('Error adding event:', error);
      setError('Failed to add event');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateEvent = async (id: string, eventData: Partial<Event>): Promise<Event> => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const eventIndex = events.findIndex(event => event.id === id);
      if (eventIndex === -1) {
        throw new Error('Event not found');
      }
      
      const updatedEvent: Event = {
        ...events[eventIndex],
        ...eventData,
        updatedAt: new Date().toISOString(),
      };
      
      const updatedEvents = [...events];
      updatedEvents[eventIndex] = updatedEvent;
      setEvents(updatedEvents);
      return updatedEvent;
    } catch (error) {
      console.error('Error updating event:', error);
      setError('Failed to update event');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteEvent = async (id: string): Promise<void> => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedEvents = events.filter(event => event.id !== id);
      setEvents(updatedEvents);
    } catch (error) {
      console.error('Error deleting event:', error);
      setError('Failed to delete event');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getEventById = (id: string): Event | undefined => {
    return events.find(event => event.id === id);
  };

  return (
    <EventContext.Provider
      value={{
        events,
        isLoading,
        error,
        addEvent,
        updateEvent,
        deleteEvent,
        getEventById,
        filteredEvents,
        setFilters,
      }}
    >
      {children}
    </EventContext.Provider>
  );
};
