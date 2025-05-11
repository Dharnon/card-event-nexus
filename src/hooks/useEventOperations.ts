
import { Event } from '@/types';
import { createEvent, updateEvent, deleteEvent as deleteEventService } from '@/services/EventService';
import { toast } from 'sonner';

export const useEventOperations = (refreshEvents: () => Promise<Event[]>, events: Event[]) => {
  // Get event by ID
  const getEventById = (id: string): Event | undefined => {
    return events.find(event => event.id === id);
  };

  // Add new event
  const addEvent = async (event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      console.log('Adding event with data:', event);
      
      // Validate required fields before sending to API
      if (!event.title || !event.format || !event.type || !event.startDate) {
        throw new Error('Missing required event fields');
      }
      
      // Ensure location object is complete
      if (!event.location || !event.location.name || !event.location.city || !event.location.address) {
        throw new Error('Event location information is incomplete');
      }
      
      const newEvent = await createEvent(event);
      await refreshEvents(); // Refresh events to get the latest data
      return newEvent;
    } catch (error: any) {
      console.error('Failed to create event:', error);
      toast.error('Failed to create event', {
        description: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  };

  // Update event
  const updateEventData = async (id: string, updates: Partial<Event>) => {
    try {
      const updatedEvent = await updateEvent(id, updates);
      await refreshEvents(); // Refresh events to get the latest data
      return updatedEvent;
    } catch (error: any) {
      console.error('Failed to update event:', error);
      toast.error('Failed to update event. Please try again.');
      throw error;
    }
  };

  // Delete event
  const deleteEventById = async (id: string) => {
    try {
      await deleteEventService(id);
      await refreshEvents(); // Refresh events to get the latest data
      toast.success('Event deleted successfully.');
    } catch (error: any) {
      console.error('Failed to delete event:', error);
      toast.error('Failed to delete event. Please try again.');
      throw error;
    }
  };

  return {
    getEventById,
    addEvent,
    updateEventData,
    deleteEvent: deleteEventById
  };
};
