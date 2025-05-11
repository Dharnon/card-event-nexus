
import { useState, useEffect, useRef } from 'react';
import { Event } from '@/types';
import { getEvents, subscribeToEvents } from '@/services/EventService';
import { toast } from 'sonner';

export const useEventsData = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const toastShownRef = useRef<{[key: string]: boolean}>({});

  const showToastOnce = (message: string, type: 'success' | 'error') => {
    const toastKey = `${message}-${Date.now()}`;
    
    // Only show toast if we haven't shown this one recently (within last 2s)
    if (!toastShownRef.current[toastKey]) {
      toastShownRef.current[toastKey] = true;
      
      if (type === 'error') {
        toast.error(message);
      } else {
        toast.success(message);
      }
      
      // Clear this toast notification after a delay
      setTimeout(() => {
        delete toastShownRef.current[toastKey];
      }, 2000);
    }
  };

  const loadEvents = async () => {
    try {
      setLoading(true);
      const eventsData = await getEvents();
      console.log('Loaded events:', eventsData);
      setEvents(eventsData);
      setError(null);
      return eventsData;
    } catch (err: any) {
      console.error('Failed to load events:', err);
      setError(err);
      showToastOnce('Failed to load events. Please try again later.', 'error');
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();

    // Subscribe to event updates with debounce to prevent multiple quick updates
    const unsubscribe = subscribeToEvents(updatedEvents => {
      console.log('Events updated via subscription:', updatedEvents);
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
