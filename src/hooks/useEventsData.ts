
import { useState, useEffect } from 'react';
import { Event } from '@/types';
import { getEvents, subscribeToEvents } from '@/services/EventService';
import { toast } from 'sonner';

export const useEventsData = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const eventsData = await getEvents();
      setEvents(eventsData);
      setError(null);
      return eventsData;
    } catch (err: any) {
      console.error('Failed to load events:', err);
      setError(err);
      toast.error('Failed to load events. Please try again later.');
      return [];
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

  return {
    events,
    setEvents,
    loading,
    error,
    refreshEvents: loadEvents
  };
};
