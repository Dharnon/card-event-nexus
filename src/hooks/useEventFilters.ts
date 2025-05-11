
import { useState } from 'react';
import { Event, EventFormat, EventType } from '@/types';

export interface EventFilters {
  searchTerm?: string;
  location?: string;
  format?: EventFormat;
  type?: EventType;
  startDate?: Date;
}

export const useEventFilters = (events: Event[]) => {
  const [filters, setFilters] = useState<EventFilters>({});

  // Filter upcoming events (events that haven't started yet)
  const upcomingEvents = events
    .filter(event => new Date(event.startDate) > new Date())
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  // Filter featured events
  const featuredEvents = events.filter(event => event.featured);

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

  return {
    filters,
    setFilters,
    filteredEvents,
    upcomingEvents,
    featuredEvents
  };
};
