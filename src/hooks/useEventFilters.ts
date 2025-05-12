
import { useState } from 'react';
import { Event, EventFormat, EventType } from '@/types';

// Export this interface so it can be imported by other files
export interface EventFilters {
  searchTerm?: string;
  location?: string;
  format?: EventFormat;
  type?: EventType;
  startDate?: Date;
  storeId?: string;
}

export const useEventFilters = (events: Event[]) => {
  const [filters, setFilters] = useState<EventFilters>({});
  const [activeFormat, setActiveFormat] = useState<string>('all');
  const [activeType, setActiveType] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<string>('date-asc');

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
    if (activeFormat !== 'all' && event.format !== activeFormat) {
      return false;
    }
    
    // Type filter
    if (activeType !== 'all' && event.type !== activeType) {
      return false;
    }
    
    // Store filter
    if (filters.storeId && event.createdBy !== filters.storeId) {
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
  }).sort((a, b) => {
    if (sortOrder === 'date-asc') {
      return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    } else if (sortOrder === 'date-desc') {
      return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
    } else {
      return 0;
    }
  });

  return {
    filters,
    setFilters,
    filteredEvents,
    upcomingEvents,
    featuredEvents,
    activeFormat,
    setActiveFormat,
    activeType,
    setActiveType,
    sortOrder,
    setSortOrder
  };
};
